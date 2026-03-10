"""
FastAPI AI Microservice for Energy Theft Detection.
Orchestrates: Feature Engineering → Isolation Forest + Random Forest → SHAP → LLM Explanation
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import traceback

from model.feature_engineering import engineer_features
from model.anomaly_detector import detect_anomalies
from model.explainability import compute_shap_values
from model.llm_explainer import generate_explanation

app = FastAPI(title="Energy Theft AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "energy-theft-ai"}


@app.post("/analyze")
async def analyze(request: Request):
    try:
        # Parse raw JSON body — no strict Pydantic validation
        body = await request.json()
        
        raw_data = body.get("meter_data", [])
        if not raw_data or not isinstance(raw_data, list):
            raise HTTPException(status_code=400, detail="No meter_data array provided")
        
        # Normalize each record, filling missing fields with defaults
        cleaned = []
        for row in raw_data:
            cleaned.append({
                "meter_id": str(row.get("meter_id", "")),
                "timestamp": str(row.get("timestamp", "")),
                "consumption_kwh": float(row.get("consumption_kwh", 0) or 0),
                "latitude": float(row.get("latitude", 0) or 0),
                "longitude": float(row.get("longitude", 0) or 0),
            })
        
        df = pd.DataFrame(cleaned)
        
        if df.empty:
            raise HTTPException(status_code=400, detail="No meter data provided")
        
        print(f"Analyzing {len(df)} readings from {df['meter_id'].nunique()} meters...")
        
        # Step 1: Feature Engineering
        print("Step 1: Feature Engineering...")
        features_df = engineer_features(df)
        print(f"  Computed features for {len(features_df)} meters")
        
        # Step 2: Anomaly Detection (Isolation Forest + Random Forest)
        print("Step 2: Anomaly Detection (IF + RF)...")
        results_df, model, scaler, X_scaled, ml_metrics = detect_anomalies(features_df)
        suspicious_count = results_df['is_suspicious'].sum()
        print(f"  Detected {suspicious_count} suspicious meters")
        print(f"  RF Accuracy: {ml_metrics['accuracy']}%, F1: {ml_metrics['f1_score']}%")
        
        # Step 3: SHAP Explainability
        print("Step 3: SHAP Explainability...")
        shap_results = compute_shap_values(model, X_scaled, results_df)
        print(f"  Computed SHAP values for {len(shap_results)} meters")
        
        # Step 4: LLM Explanations
        print("Step 4: Generating Explanations...")
        shap_lookup = {s['meter_id']: s['top_features'] for s in shap_results}
        
        # Build final output
        meters = []
        for _, row in results_df.iterrows():
            meter_id = row['meter_id']
            shap_feats = shap_lookup.get(meter_id, [])
            
            features_dict = {
                'avg_consumption': row['avg_consumption'],
                'std_consumption': row['std_consumption'],
                'variance': row['variance'],
                'day_night_ratio': row['day_night_ratio'],
                'night_usage_ratio': row['night_usage_ratio'],
                'flatline_ratio': row['flatline_ratio'],
                'max_drop': row['max_drop'],
                'drop_count': row['drop_count'],
                'weekly_consistency': row['weekly_consistency'],
                'cv': row['cv'],
            }
            
            llm_result = generate_explanation(
                meter_id=meter_id,
                risk_score=row['risk_score'],
                features=features_dict,
                shap_features=shap_feats
            )
            
            meters.append({
                'meter_id': meter_id,
                'latitude': float(row['latitude']),
                'longitude': float(row['longitude']),
                'risk_score': float(row['risk_score']),
                'anomaly_score': float(row['anomaly_score']),
                'is_suspicious': bool(row['is_suspicious']),
                'features': features_dict,
                'shap_features': shap_feats,
                'explanation': llm_result['explanation'],
                'recommendation': llm_result['recommendation'],
                'risk_level': llm_result['risk_level'],
            })
        
        # Summary stats
        risk_scores = [m['risk_score'] for m in meters]
        summary = {
            'total_meters': len(meters),
            'suspicious_meters': int(suspicious_count),
            'safe_meters': len(meters) - int(suspicious_count),
            'avg_risk_score': round(float(np.mean(risk_scores)), 1),
            'max_risk_score': round(float(np.max(risk_scores)), 1),
            'min_risk_score': round(float(np.min(risk_scores)), 1),
        }
        
        print(f"Analysis complete! Summary: {summary}")
        
        return {
            'success': True,
            'summary': summary,
            'metrics': ml_metrics,
            'meters': meters
        }
    
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
