"""
SHAP Explainability for Isolation Forest anomaly detection.
"""
import numpy as np
import shap
from .anomaly_detector import FEATURE_COLUMNS


def compute_shap_values(model, X_scaled, features_df):
    """
    Compute SHAP values for each meter's anomaly prediction.
    
    Returns list of dicts with top contributing features per meter.
    """
    # Use TreeExplainer for Isolation Forest
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_scaled)
    
    results = []
    
    for i in range(len(features_df)):
        meter_shap = shap_values[i]
        
        # Get top features by absolute SHAP value
        feature_importance = []
        for j, col in enumerate(FEATURE_COLUMNS):
            feature_importance.append({
                'feature': col,
                'shap_value': round(float(meter_shap[j]), 4),
                'abs_importance': abs(float(meter_shap[j]))
            })
        
        # Sort by absolute importance
        feature_importance.sort(key=lambda x: x['abs_importance'], reverse=True)
        
        # Top 5 features
        top_features = [
            {
                'feature': f['feature'],
                'shap_value': f['shap_value'],
                'direction': 'increases risk' if f['shap_value'] > 0 else 'decreases risk'
            }
            for f in feature_importance[:5]
        ]
        
        results.append({
            'meter_id': features_df.iloc[i]['meter_id'],
            'top_features': top_features
        })
    
    return results
