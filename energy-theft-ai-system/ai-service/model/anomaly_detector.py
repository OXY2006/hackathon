"""
Anomaly Detection for electricity consumption data.
Uses Isolation Forest (unsupervised) + Random Forest Classifier (supervised).
"""
import numpy as np
import pandas as pd
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
    This simulates having labeled training data.
    """
    labels = np.zeros(len(df))
    
    for i, row in df.iterrows():
        suspicious = False
        
        # Flatline detection: very low variance relative to consumption
        if row['flatline_ratio'] > 0.15:
            suspicious = True
        
        # Sudden drop: large consumption drops
        if row['max_drop'] < -3.0 and row['drop_count'] > 10:
            suspicious = True
        
        # Abnormal night usage: night consumption close to or higher than day
        if row['day_night_ratio'] < 1.0:
            suspicious = True
        
        # Very low coefficient of variation (too constant)
        if row['cv'] < 0.05 and row['avg_consumption'] > 0.5:
            suspicious = True
        
        # Abnormally high night usage ratio
        if row['night_usage_ratio'] > 1.2:
            suspicious = True
        
        labels[i] = 1 if suspicious else 0
    
    return labels


def detect_anomalies(features_df: pd.DataFrame, contamination: float = 0.15):
    """
    Run Isolation Forest + Random Forest Classifier on engineered features.
    
    Returns:
        features_df with added columns: anomaly_score, risk_score, is_suspicious
        trained model and scaler for SHAP
        metrics dict with accuracy, precision, recall, f1
    """
    df = features_df.copy()
    
    # Prepare feature matrix
    X = df[FEATURE_COLUMNS].fillna(0).values
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # ========== ISOLATION FOREST (Unsupervised) ==========
    iso_model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        max_samples='auto',
        random_state=42,
        n_jobs=-1
    )
    iso_model.fit(X_scaled)
    
    iso_predictions = iso_model.predict(X_scaled)  # 1 = normal, -1 = anomaly
    raw_scores = iso_model.decision_function(X_scaled)
    
    # Normalize to 0-100 risk score
    min_score = raw_scores.min()
    max_score = raw_scores.max()
    score_range = max_score - min_score if max_score != min_score else 1
    risk_scores = ((max_score - raw_scores) / score_range * 100).round(1)
    
    # ========== RANDOM FOREST CLASSIFIER (Supervised) ==========
    # Create ground truth labels from feature patterns
    y_true = create_ground_truth_labels(df)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_true, test_size=0.3, random_state=42, stratify=y_true if y_true.sum() > 1 else None
    )
    
    # Train Random Forest Classifier
    rf_model = RandomForestClassifier(
        n_estimators=150,
        max_depth=10,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight='balanced'
    )
    rf_model.fit(X_train, y_train)
    
    # Predictions on test set for metrics
    y_pred_test = rf_model.predict(X_test)
    
    # Predictions on full dataset for final output
    rf_predictions = rf_model.predict(X_scaled)
    rf_probabilities = rf_model.predict_proba(X_scaled)
    
    # Compute metrics on test set
    metrics = {
        'accuracy': round(accuracy_score(y_test, y_pred_test) * 100, 1),
        'precision': round(precision_score(y_test, y_pred_test, zero_division=0) * 100, 1),
        'recall': round(recall_score(y_test, y_pred_test, zero_division=0) * 100, 1),
        'f1_score': round(f1_score(y_test, y_pred_test, zero_division=0) * 100, 1),
        'test_size': len(y_test),
        'train_size': len(y_train),
        'total_anomalies_in_data': int(y_true.sum()),
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
    
    # Combine both models: use RF probability as risk score, ISO for anomaly flag
    # Blend: 60% RF probability + 40% ISO normalized score
    rf_risk = (rf_probabilities[:, 1] * 100).round(1) if rf_probabilities.shape[1] > 1 else np.zeros(len(df))
    blended_risk = (0.6 * rf_risk + 0.4 * risk_scores).round(1)
    
    # Final suspicious flag: either model flags it
    is_suspicious = (rf_predictions == 1) | (iso_predictions == -1)
    
    df['anomaly_score'] = raw_scores.round(4)
    df['risk_score'] = blended_risk
    df['is_suspicious'] = is_suspicious
    df['rf_risk'] = rf_risk
    df['iso_risk'] = risk_scores
    
    return df, iso_model, scaler, X_scaled, metrics
