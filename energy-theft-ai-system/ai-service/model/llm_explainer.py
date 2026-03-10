"""
LLM Explanation Layer - Template-based intelligent explanation generator.
Produces natural language explanations from SHAP features and anomaly scores.
"""

FEATURE_DESCRIPTIONS = {
    'avg_consumption': 'average electricity consumption',
    'std_consumption': 'consumption variability (standard deviation)',
    'variance': 'consumption variance',
    'median_consumption': 'median electricity consumption',
    'min_consumption': 'minimum recorded consumption',
    'max_consumption': 'maximum recorded consumption',
    'avg_rolling_mean': 'smoothed average consumption trend',
    'avg_rolling_std': 'consumption volatility over time',
    'day_night_ratio': 'daytime vs nighttime usage ratio',
    'night_usage_ratio': 'nighttime usage intensity',
    'weekly_consistency': 'weekly pattern regularity',
    'max_drop': 'largest sudden consumption drop',
    'drop_count': 'number of significant consumption drops',
    'flatline_ratio': 'proportion of constant consumption periods',
    'cv': 'coefficient of variation in usage',
    'skewness': 'consumption distribution asymmetry',
    'kurtosis': 'consumption distribution tail behavior'
}

RISK_LEVELS = {
    'critical': (80, 100),
    'high': (60, 80),
    'moderate': (40, 60),
    'low': (20, 40),
    'safe': (0, 20)
}


def get_risk_level(score):
    for level, (low, high) in RISK_LEVELS.items():
        if low <= score <= high:
            return level
    return 'unknown'


def generate_explanation(meter_id, risk_score, features, shap_features):
    """
    Generate a human-readable explanation for an anomaly detection result.
    """
    risk_level = get_risk_level(risk_score)
    top_shap = shap_features[:3] if shap_features else []
    
    # Build concern descriptions from SHAP features
    concerns = []
    for sf in top_shap:
        feat_name = sf['feature']
        direction = sf.get('direction', 'increases risk')
        desc = FEATURE_DESCRIPTIONS.get(feat_name, feat_name.replace('_', ' '))
        
        if 'increases risk' in direction:
            if feat_name == 'flatline_ratio':
                concerns.append(f"unusually constant consumption patterns detected, suggesting possible meter bypass")
            elif feat_name == 'max_drop':
                concerns.append(f"significant sudden drop in consumption detected, indicating potential tampering")
            elif feat_name == 'drop_count':
                concerns.append(f"multiple consumption drops observed, which is atypical for normal usage")
            elif feat_name == 'night_usage_ratio':
                concerns.append(f"abnormally high nighttime energy usage compared to daytime patterns")
            elif feat_name == 'day_night_ratio':
                concerns.append(f"unusual daytime-to-nighttime usage ratio deviating from normal patterns")
            elif feat_name == 'cv':
                concerns.append(f"abnormal variation pattern in consumption data")
            elif feat_name == 'avg_consumption':
                concerns.append(f"average consumption level significantly deviates from the population norm")
            elif feat_name == 'weekly_consistency':
                concerns.append(f"irregular weekly pattern inconsistent with typical residential behavior")
            elif feat_name in ('std_consumption', 'variance'):
                concerns.append(f"unusual {desc} compared to normal meters")
            else:
                concerns.append(f"anomalous {desc}")
    
    # Build explanation
    if risk_level in ('critical', 'high'):
        intro = f"Meter {meter_id} shows strong indicators of potential energy theft or meter tampering."
        action = "Immediate physical inspection is strongly recommended."
        recommendation = "inspection_recommended"
    elif risk_level == 'moderate':
        intro = f"Meter {meter_id} exhibits moderately suspicious consumption patterns that warrant attention."
        action = "The meter should be flagged for monitoring and potential future inspection."
        recommendation = "monitoring_recommended"
    elif risk_level == 'low':
        intro = f"Meter {meter_id} shows minor deviations from normal consumption patterns."
        action = "No immediate action is required, but periodic monitoring is suggested."
        recommendation = "periodic_monitoring"
    else:
        intro = f"Meter {meter_id} consumption patterns are within normal expected ranges."
        action = "No action is needed at this time."
        recommendation = "no_action_needed"
    
    concern_text = ""
    if concerns:
        concern_text = "\n\nKey findings:\n" + "\n".join(f"• {c}" for c in concerns)
    
    feature_summary = ""
    if features:
        feature_summary = f"\n\nConsumption profile: avg={features.get('avg_consumption', 'N/A')} kWh, "
        feature_summary += f"std={features.get('std_consumption', 'N/A')}, "
        feature_summary += f"day/night ratio={features.get('day_night_ratio', 'N/A')}, "
        feature_summary += f"flatline ratio={features.get('flatline_ratio', 'N/A')}"
    
    explanation = f"{intro}{concern_text}{feature_summary}\n\n{action}"
    
    return {
        'explanation': explanation.strip(),
        'recommendation': recommendation,
        'risk_level': risk_level
    }
