import os
import json
import joblib
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import io

app = FastAPI(title="Energy Theft Detection Service")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models')

# Global variables for models
model = None
scaler = None
imputer = None
config = None

@app.on_event("startup")
def load_models():
    global model, scaler, imputer, config
    
    try:
        model_path = os.path.join(MODELS_DIR, "energy_theft_model (2).pkl")
        scaler_path = os.path.join(MODELS_DIR, "energy_theft_scaler.pkl")
        imputer_path = os.path.join(MODELS_DIR, "energy_theft_imputer.pkl")
        config_path = os.path.join(MODELS_DIR, "model_config.json")
        
        # We might need to handle slightly different filenames depending on what was copied
        # Fallbacks for model naming
        if not os.path.exists(model_path):
            alt_model_paths = [f for f in os.listdir(MODELS_DIR) if f.startswith('energy_theft_model') and f.endswith('.pkl')]
            if alt_model_paths:
                model_path = os.path.join(MODELS_DIR, alt_model_paths[0])
                
        print(f"Loading model from: {model_path}")
        model = joblib.load(model_path)
        print("Loading scaler...")
        scaler = joblib.load(scaler_path)
        print("Loading imputer...")
        imputer = joblib.load(imputer_path)

        # Patch simple imputer for scikit-learn version mismatch when unpickling
        if not hasattr(imputer, '_fill_dtype'):
            imputer._fill_dtype = getattr(imputer.statistics_, 'dtype', None)
        if not hasattr(imputer, '_fill_fallback'):
            imputer._fill_fallback = '0'
        
        print("Loading config...")
        with open(config_path, 'r') as f:
            config = json.load(f)
            
        print("All models loaded successfully!")
    except Exception as e:
        print(f"Error loading models: {e}")
        # Note: In a real app we might sys.exit(1) here, but for development we'll let it start 
        # and fail on prediction

def engineer_features(df, target_col=None):
    feature_cols = [c for c in df.columns if target_col is None or c != target_col]
    X = df[feature_cols].apply(pd.to_numeric, errors='coerce')
    f = pd.DataFrame(index=X.index)

    # --- Basic statistics ---
    f['mean']   = X.mean(axis=1)
    f['std']    = X.std(axis=1)
    f['min']    = X.min(axis=1)
    f['max']    = X.max(axis=1)
    f['median'] = X.median(axis=1)
    f['total']  = X.sum(axis=1)
    f['range']  = f['max'] - f['min']
    f['cv']     = f['std'] / (f['mean'] + 1e-9)
    f['skew']   = X.skew(axis=1)
    f['kurt']   = X.kurt(axis=1)
    f['q25']    = X.quantile(0.25, axis=1)
    f['q75']    = X.quantile(0.75, axis=1)
    f['iqr']    = f['q75'] - f['q25']

    # --- Theft-specific ---
    f['n_zeros']      = (X == 0).sum(axis=1)
    f['n_negative']   = (X < 0).sum(axis=1)
    f['n_missing']    = X.isnull().sum(axis=1)
    f['pct_zeros']    = f['n_zeros'] / X.shape[1]
    f['pct_missing']  = f['n_missing'] / X.shape[1]
    f['has_negative'] = (f['n_negative'] > 0).astype(int)
    f['neg_sum']      = X.clip(upper=0).sum(axis=1)
    f['pos_mean']     = X.clip(lower=0).mean(axis=1)

    # --- Monthly aggregates ---
    n = X.shape[1]
    msz = n // 12
    # Prevent division by zero if n < 12
    msz = max(1, msz)
    monthly = []
    for m in range(12):
        s = m * msz
        e = s + msz if m < 11 else n
        mm = X.iloc[:, s:e].mean(axis=1)
        ms = X.iloc[:, s:e].std(axis=1)
        f[f'm{m+1}_mean'] = mm
        f[f'm{m+1}_std']  = ms
        monthly.append(mm)
    mdf = pd.concat(monthly, axis=1)
    f['monthly_std']   = mdf.std(axis=1)
    f['monthly_range'] = mdf.max(axis=1) - mdf.min(axis=1)

    # --- Trend (first half vs second half) ---
    mid = n // 2
    h1 = X.iloc[:, :mid].mean(axis=1)
    h2 = X.iloc[:, mid:].mean(axis=1)
    f['trend']       = h2 - h1
    f['trend_ratio'] = h2 / (h1 + 1e-9)

    # --- Longest zero streak ---
    def longest_zero(row):
        r = row.fillna(0)
        best, cur = 0, 0
        for v in r:
            cur = cur + 1 if v == 0 else 0
            best = max(best, cur)
        return best
    f['zero_streak'] = X.apply(longest_zero, axis=1)

    # --- Volatility ---
    diffs = X.diff(axis=1).abs()
    f['mean_change'] = diffs.mean(axis=1)
    f['max_change']  = diffs.max(axis=1)
    f['volatility']  = diffs.std(axis=1)

    # --- Outlier score ---
    z = X.sub(f['mean'], axis=0).div(f['std'] + 1e-9, axis=0)
    f['n_outliers'] = (z.abs() > 3).sum(axis=1)
    f['max_z']      = z.abs().max(axis=1)

    # --- Active days ---
    f['active_days']  = (X > 0).sum(axis=1)
    f['active_ratio'] = f['active_days'] / (X.shape[1] - f['n_missing'] + 1e-9)

    return f

@app.get("/")
def root():
    return {"message": "Energy Theft ML Service is running", "models_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None or scaler is None or imputer is None:
        raise HTTPException(status_code=500, detail="Models not loaded")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    try:
        # Read the CSV file into a pandas DataFrame
        contents = await file.read()
        df_raw = pd.read_csv(io.BytesIO(contents))
        
        # Remove ID column if present (e.g., 'meter_id', 'client_id', 'id', 'cons_no')
        id_col = None
        for col in ['meter_id', 'client_id', 'id', 'cons_no']:
            col_match = [c for c in df_raw.columns if c.lower() == col.lower()]
            if col_match:
                id_col = col_match[0]
                break
                
        # Drop ID so we don't compute statistics over the ID
        df_for_features = df_raw.drop(columns=[id_col]) if id_col else df_raw
        
        # ENGINEER FEATURES dynamically
        features_df = engineer_features(df_for_features)
                    
        # Verify columns match training data order exactly
        target_features = config.get("feature_names", [])
        if target_features:
            for f in target_features:
                if f not in features_df.columns:
                    features_df[f] = 0
            features_df = features_df[target_features]
            
        # 1. Apply imputer
        X_imputed = imputer.transform(features_df)
        
        # 2. Apply scaler
        X_scaled = scaler.transform(X_imputed)
        
        # 3. Model inference: Returns probability of positive class (Suspicious)
        # Check if the predict_proba method is available (for classifiers)
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X_scaled)[:, 1]
        else:
            # Fallback for models without predict_proba
            probabilities = model.predict(X_scaled)
            
        # Get optimal threshold from config
        threshold = config.get("optimal_threshold", 0.34)
        
        # Create predictions array
        predictions = (probabilities >= threshold).astype(int)
        
        results = []
        for i in range(len(predictions)):
            is_suspicious = bool(predictions[i])
            risk_score = float(probabilities[i]) * 100
            
            # Formulate result record
            record = {
                "index": i,
                "is_suspicious": is_suspicious,
                "status": "Suspicious / Possible Theft" if is_suspicious else "Normal Consumption",
                "probability": float(probabilities[i]),
                "risk_score": round(risk_score, 2),
                "confidence": "High" if abs(float(probabilities[i]) - threshold) > 0.2 else "Medium"
            }
            
            if id_col:
                record["id"] = str(df_raw.iloc[i][id_col])
                
            results.append(record)
            
        # Aggregate statistics
        total = len(results)
        suspicious_count = sum(1 for r in results if r["is_suspicious"])
        
        summary = {
            "total_records": total,
            "suspicious_cases": suspicious_count,
            "normal_cases": total - suspicious_count,
            "theft_percentage": round((suspicious_count / total) * 100, 2) if total > 0 else 0
        }
            
        return {"summary": summary, "predictions": results}
        
    except Exception as e:
        print(f"Error processing prediction request: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
