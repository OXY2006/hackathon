"""
Time Series Feature Engineering for electricity meter data.
Extracts statistical features per meter for anomaly detection.
"""
import pandas as pd
import numpy as np


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract time-series features for each meter.
    
    Input: DataFrame with columns [meter_id, timestamp, consumption_kwh, latitude, longitude]
    Output: DataFrame with one row per meter and computed features.
    """
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_night'] = ((df['hour'] >= 0) & (df['hour'] <= 5)).astype(int)
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    features_list = []
    
    for meter_id, group in df.groupby('meter_id'):
        group = group.sort_values('timestamp')
        consumption = group['consumption_kwh']
        
        # Basic statistics
        avg_consumption = consumption.mean()
        std_consumption = consumption.std()
        variance = consumption.var()
        median_consumption = consumption.median()
        min_consumption = consumption.min()
        max_consumption = consumption.max()
        
        # Rolling statistics (24h window)
        rolling_mean = consumption.rolling(window=24, min_periods=1).mean()
        rolling_std = consumption.rolling(window=24, min_periods=1).std()
        avg_rolling_mean = rolling_mean.mean()
        avg_rolling_std = rolling_std.fillna(0).mean()
        
        # Day vs Night ratio
        day_consumption = group[group['is_night'] == 0]['consumption_kwh'].mean()
        night_consumption = group[group['is_night'] == 1]['consumption_kwh'].mean()
        day_night_ratio = day_consumption / max(night_consumption, 0.01)
        
        # Night usage intensity
        night_usage_ratio = night_consumption / max(avg_consumption, 0.01)
        
        # Weekly pattern consistency
        daily_means = group.groupby(group['timestamp'].dt.date)['consumption_kwh'].mean()
        weekly_consistency = daily_means.std() / max(daily_means.mean(), 0.01)
        
        # Consumption drop detection
        consumption_diff = consumption.diff()
        max_drop = consumption_diff.min()  # Most negative = biggest drop
        drop_count = (consumption_diff < -avg_consumption * 0.5).sum()
        
        # Flatline detection (low variance periods)
        rolling_var = consumption.rolling(window=24, min_periods=1).var()
        flatline_ratio = (rolling_var < 0.01).sum() / max(len(rolling_var), 1)
        
        # Coefficient of variation
        cv = std_consumption / max(avg_consumption, 0.01)
        
        # Skewness and kurtosis
        skewness = consumption.skew()
        kurtosis = consumption.kurtosis()
        
        features_list.append({
            'meter_id': meter_id,
            'latitude': group['latitude'].iloc[0],
            'longitude': group['longitude'].iloc[0],
            'avg_consumption': round(avg_consumption, 4),
            'std_consumption': round(std_consumption, 4),
            'variance': round(variance, 4),
            'median_consumption': round(median_consumption, 4),
            'min_consumption': round(min_consumption, 4),
            'max_consumption': round(max_consumption, 4),
            'avg_rolling_mean': round(avg_rolling_mean, 4),
            'avg_rolling_std': round(avg_rolling_std, 4),
            'day_night_ratio': round(day_night_ratio, 4),
            'night_usage_ratio': round(night_usage_ratio, 4),
            'weekly_consistency': round(weekly_consistency, 4),
            'max_drop': round(max_drop, 4) if pd.notna(max_drop) else 0.0,
            'drop_count': int(drop_count),
            'flatline_ratio': round(flatline_ratio, 4),
            'cv': round(cv, 4),
            'skewness': round(skewness, 4) if pd.notna(skewness) else 0.0,
            'kurtosis': round(kurtosis, 4) if pd.notna(kurtosis) else 0.0,
        })
    
    return pd.DataFrame(features_list)
