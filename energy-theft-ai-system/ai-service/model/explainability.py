"""
SHAP Explainability for Isolation Forest anomaly detection.
"""
import numpy as np
import traceback

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

from .anomaly_detector import FEATURE_COLUMNS


def compute_shap_values(model, X_scaled, features_df):
    """
    Compute SHAP values for each meter's anomaly prediction.
    Falls back to feature-importance-based explanation if SHAP fails.
    
    Returns list of dicts with top contributing features per meter.
    """
    results = []
    shap_values = None
    
    # Try SHAP computation
    if SHAP_AVAILABLE:
        try:
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(X_scaled)
            
            # Handle different SHAP output formats
            if isinstance(shap_values, list):
                shap_values = shap_values[0]
            if hasattr(shap_values, 'values'):
                shap_values = shap_values.values
        except Exception as e:
            print(f"SHAP computation failed, using fallback: {e}")
            traceback.print_exc()
            shap_values = None
    
    for i in range(len(features_df)):
        feature_importance = []
        
        if shap_values is not None and i < len(shap_values):
            meter_shap = shap_values[i]
            for j, col in enumerate(FEATURE_COLUMNS):
                if j < len(meter_shap):
                    val = float(meter_shap[j]) if np.isfinite(meter_shap[j]) else 0.0
                    feature_importance.append({
                        'feature': col,
                        'shap_value': round(val, 4),
                        'abs_importance': abs(val)
                    })
        else:
            # Fallback: use feature values relative to mean as proxy importance
            row = features_df.iloc[i]
            for col in FEATURE_COLUMNS:
                val = float(row.get(col, 0)) if col in row.index else 0.0
                if not np.isfinite(val):
                    val = 0.0
                col_mean = features_df[col].mean() if col in features_df.columns else 0.0
                if not np.isfinite(col_mean):
                    col_mean = 0.0
                deviation = val - col_mean
                feature_importance.append({
                    'feature': col,
                    'shap_value': round(deviation, 4),
                    'abs_importance': abs(deviation)
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
