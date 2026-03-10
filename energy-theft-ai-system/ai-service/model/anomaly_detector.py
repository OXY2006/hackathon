"""
Anomaly Detection for electricity consumption data.
Uses Isolation Forest (unsupervised) + Random Forest Classifier (supervised).
"""
import numpy as np
import pandas as pd
import traceback
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix


FEATURE_COLUMNS = [
    'avg_consumption', 'std_consumption', 'variance', 'median_consumption',
    'min_consumption', 'max_consumption', 'avg_rolling_mean', 'avg_rolling_std',
    'day_night_ratio', 'night_usage_ratio', 'weekly_consistency',
    'max_drop', 'drop_count', 'flatline_ratio', 'cv', 'skewness', 'kurtosis'
]


def create_ground_truth_labels(df: pd.DataFrame) -> np.ndarray:
    """
    Create ground truth labels from feature patterns.
    Meters with clear anomaly signatures are labeled as suspicious (1).
    """
    labels = np.zeros(len(df))
    
    for idx, (_, row) in enumerate(df.iterrows()):
        suspicious = False
        
        try:
            if float(row.get('flatline_ratio', 0) or 0) > 0.15:
                suspicious = True
            if float(row.get('max_drop', 0) or 0) < -3.0 and float(row.get('drop_count', 0) or 0) > 10:
                suspicious = True
            if float(row.get('day_night_ratio', 999) or 999) < 1.0:
                suspicious = True
            if float(row.get('cv', 999) or 999) < 0.05 and float(row.get('avg_consumption', 0) or 0) > 0.5:
                suspicious = True
            if float(row.get('night_usage_ratio', 0) or 0) > 1.2:
                suspicious = True
        except (ValueError, TypeError):
            pass
        
        labels[idx] = 1 if suspicious else 0
    
    return labels


def detect_anomalies(features_df: pd.DataFrame, contamination: float = 0.15):
    """
    Run Isolation Forest + Random Forest Classifier on engineered features.
    """
    df = features_df.copy().reset_index(drop=True)
    n_samples = len(df)
    
    # Prepare feature matrix — clean NaN/Inf
    X = df[FEATURE_COLUMNS].fillna(0).values.astype(np.float64)
    X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    X_scaled = np.nan_to_num(X_scaled, nan=0.0, posinf=0.0, neginf=0.0)
    
    # ========== ISOLATION FOREST (Unsupervised) ==========
    iso_model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples='auto',
        random_state=42,
        n_jobs=1
    )
    iso_model.fit(X_scaled)
    
    iso_predictions = iso_model.predict(X_scaled)
    raw_scores = iso_model.decision_function(X_scaled)
    
    # Normalize to 0-100 risk score
    min_score = raw_scores.min()
    max_score = raw_scores.max()
    score_range = max_score - min_score if max_score != min_score else 1
    risk_scores = ((max_score - raw_scores) / score_range * 100).round(1)
    
    # ========== RANDOM FOREST CLASSIFIER (Supervised) ==========
    y_true = create_ground_truth_labels(df)
    
    n_positive = int(y_true.sum())
    n_negative = n_samples - n_positive
    
    # Default metrics
    metrics = {
        'accuracy': 0.0,
        'precision': 0.0,
        'recall': 0.0,
        'f1_score': 0.0,
        'test_size': 0,
        'train_size': n_samples,
        'total_anomalies_in_data': n_positive,
        'model': 'Random Forest Classifier',
    }
    
    rf_risk = risk_scores.copy()
    rf_predictions = (iso_predictions == -1).astype(int)
    
    # Only train RF if we have enough samples of both classes
    if n_positive >= 3 and n_negative >= 3 and n_samples >= 10:
        try:
            # Determine if stratify is safe
            test_size = max(0.2, min(0.3, 1.0 - (6 / n_samples)))
            stratify_param = y_true if (n_positive >= 4 and n_negative >= 4) else None
            
            X_train, X_test, y_train, y_test = train_test_split(
                X_scaled, y_true, test_size=test_size, random_state=42, stratify=stratify_param
            )
            
            rf_model = RandomForestClassifier(
                n_estimators=150,
                max_depth=min(10, max(2, n_samples // 5)),
                min_samples_split=max(2, min(5, n_positive // 2)),
                min_samples_leaf=max(1, min(2, n_positive // 3)),
                random_state=42,
                n_jobs=1,
                class_weight='balanced'
            )
            rf_model.fit(X_train, y_train)
            
            y_pred_test = rf_model.predict(X_test)
            rf_predictions = rf_model.predict(X_scaled)
            rf_probabilities = rf_model.predict_proba(X_scaled)
            
            metrics = {
                'accuracy': round(accuracy_score(y_test, y_pred_test) * 100, 1),
                'precision': round(precision_score(y_test, y_pred_test, zero_division=0) * 100, 1),
                'recall': round(recall_score(y_test, y_pred_test, zero_division=0) * 100, 1),
                'f1_score': round(f1_score(y_test, y_pred_test, zero_division=0) * 100, 1),
                'test_size': len(y_test),
                'train_size': len(y_train),
                'total_anomalies_in_data': n_positive,
                'model': 'Random Forest Classifier',
            }
            
            # Confusion matrix
            cm = confusion_matrix(y_test, y_pred_test)
            if cm.shape == (2, 2):
                metrics['confusion_matrix'] = {
                    'true_negatives': int(cm[0][0]),
                    'false_positives': int(cm[0][1]),
                    'false_negatives': int(cm[1][0]),
                    'true_positives': int(cm[1][1]),
                }
            
            # Blend RF probability with ISO score
            if rf_probabilities.shape[1] > 1:
                rf_risk = (rf_probabilities[:, 1] * 100).round(1)
            
        except Exception as e:
            print(f"RF training failed, using Isolation Forest only: {e}")
            traceback.print_exc()
    else:
        print(f"Skipping RF (samples={n_samples}, positive={n_positive}, negative={n_negative}). Using ISO only.")
    
    # Blend scores
    blended_risk = (0.6 * rf_risk + 0.4 * risk_scores).round(1)
    is_suspicious = (rf_predictions == 1) | (iso_predictions == -1)
    
    df['anomaly_score'] = raw_scores.round(4)
    df['risk_score'] = blended_risk
    df['is_suspicious'] = is_suspicious
    df['rf_risk'] = rf_risk
    df['iso_risk'] = risk_scores
    
    return df, iso_model, scaler, X_scaled, metrics
