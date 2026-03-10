"""
Time Series Feature Engineering for electricity meter data.
Handles both hourly and daily frequency data.
Extracts statistical features per meter for anomaly detection.
"""
import pandas as pd
import numpy as np


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Extract time-series features for each meter.
    
    Input: DataFrame with columns [meter_id, timestamp, consumption_kwh, latitude, longitude]
           May also contain extra columns which are ignored.
    Output: DataFrame with one row per meter and computed features.
    """
    df = df.copy()
    df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
    
    # Drop rows with invalid timestamps or consumption
    df = df.dropna(subset=['timestamp'])
    df['consumption_kwh'] = pd.to_numeric(df['consumption_kwh'], errors='coerce').fillna(0)
    
    # Detect data frequency: hourly vs daily
    # If timestamps have no time component (all midnight), treat as daily data
    has_time = (df['timestamp'].dt.hour != 0).any()
    
    if has_time:
        df['hour'] = df['timestamp'].dt.hour
        df['is_night'] = ((df['hour'] >= 0) & (df['hour'] <= 5)).astype(int)
    else:
        # Daily data — no hour info available, use day_of_week for patterns instead
        df['hour'] = 0
        df['is_night'] = 0  # Can't determine from daily data
    
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
    
    features_list = []
    
    for meter_id, group in df.groupby('meter_id'):
        group = group.sort_values('timestamp')
        consumption = group['consumption_kwh']
        
        if len(consumption) < 2:
            continue  # Skip meters with too few readings
        
        # Basic statistics
        avg_consumption = consumption.mean()
        std_consumption = consumption.std()
        if pd.isna(std_consumption):
            std_consumption = 0.0
        variance = consumption.var()
        if pd.isna(variance):
            variance = 0.0
        median_consumption = consumption.median()
        min_consumption = consumption.min()
        max_consumption = consumption.max()
        
        # Rolling statistics (adaptive window: 24 for hourly, 7 for daily)
        window = 24 if has_time else min(7, len(consumption))
        window = max(2, window)
        
        rolling_mean = consumption.rolling(window=window, min_periods=1).mean()
        rolling_std = consumption.rolling(window=window, min_periods=1).std()
        avg_rolling_mean = rolling_mean.mean()
        avg_rolling_std = rolling_std.fillna(0).mean()
        
        # Day vs Night ratio
        if has_time:
            day_consumption = group[group['is_night'] == 0]['consumption_kwh'].mean()
            night_consumption = group[group['is_night'] == 1]['consumption_kwh'].mean()
            if pd.isna(day_consumption):
                day_consumption = avg_consumption
            if pd.isna(night_consumption):
                night_consumption = avg_consumption * 0.5
            day_night_ratio = day_consumption / max(night_consumption, 0.01)
            night_usage_ratio = night_consumption / max(avg_consumption, 0.01)
        else:
            # For daily data, use weekday vs weekend as proxy
            weekday_consumption = group[group['is_weekend'] == 0]['consumption_kwh'].mean()
            weekend_consumption = group[group['is_weekend'] == 1]['consumption_kwh'].mean()
            if pd.isna(weekday_consumption):
                weekday_consumption = avg_consumption
            if pd.isna(weekend_consumption):
                weekend_consumption = avg_consumption
            day_night_ratio = weekday_consumption / max(weekend_consumption, 0.01)
            night_usage_ratio = weekend_consumption / max(avg_consumption, 0.01)
        
        # Weekly pattern consistency
        daily_means = group.groupby(group['timestamp'].dt.date)['consumption_kwh'].mean()
        weekly_consistency = daily_means.std() / max(daily_means.mean(), 0.01) if len(daily_means) > 1 else 0.0
        if pd.isna(weekly_consistency):
            weekly_consistency = 0.0
        
        # Consumption drop detection
        consumption_diff = consumption.diff()
        max_drop = consumption_diff.min()
        drop_count = (consumption_diff < -avg_consumption * 0.5).sum() if avg_consumption > 0 else 0
        
        # Flatline detection (low variance periods)
        flat_window = min(window, len(consumption))
        rolling_var = consumption.rolling(window=max(2, flat_window), min_periods=1).var()
        flatline_ratio = (rolling_var < 0.01).sum() / max(len(rolling_var), 1)
        
        # Coefficient of variation
        cv = std_consumption / max(avg_consumption, 0.01)
        
        # Skewness and kurtosis
        skewness = consumption.skew()
        kurtosis = consumption.kurtosis()
        
        # Get lat/lng — use first non-null value or default to 0
        lat = 0.0
        lng = 0.0
        if 'latitude' in group.columns:
            lat_vals = group['latitude'].dropna()
            lat = float(lat_vals.iloc[0]) if len(lat_vals) > 0 else 0.0
        if 'longitude' in group.columns:
            lng_vals = group['longitude'].dropna()
            lng = float(lng_vals.iloc[0]) if len(lng_vals) > 0 else 0.0
        
        features_list.append({
            'meter_id': meter_id,
            'latitude': lat,
            'longitude': lng,
            'avg_consumption': round(float(avg_consumption), 4),
            'std_consumption': round(float(std_consumption), 4),
            'variance': round(float(variance), 4),
            'median_consumption': round(float(median_consumption), 4),
            'min_consumption': round(float(min_consumption), 4),
            'max_consumption': round(float(max_consumption), 4),
            'avg_rolling_mean': round(float(avg_rolling_mean), 4),
            'avg_rolling_std': round(float(avg_rolling_std), 4),
            'day_night_ratio': round(float(day_night_ratio), 4),
            'night_usage_ratio': round(float(night_usage_ratio), 4),
            'weekly_consistency': round(float(weekly_consistency), 4),
            'max_drop': round(float(max_drop), 4) if pd.notna(max_drop) else 0.0,
            'drop_count': int(drop_count),
            'flatline_ratio': round(float(flatline_ratio), 4),
            'cv': round(float(cv), 4),
            'skewness': round(float(skewness), 4) if pd.notna(skewness) else 0.0,
            'kurtosis': round(float(kurtosis), 4) if pd.notna(kurtosis) else 0.0,
        })
    
    if not features_list:
        raise ValueError("No meters with enough data to compute features")
    
    return pd.DataFrame(features_list)
