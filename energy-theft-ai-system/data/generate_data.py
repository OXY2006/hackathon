"""
Generate synthetic smart meter electricity consumption data.
Creates 1000 meters × 30 days with random anomalies injected.
"""
import csv
import random
import math
from datetime import datetime, timedelta

random.seed(42)

NUM_METERS = 1000
NUM_DAYS = 30
READINGS_PER_DAY = 24  # hourly readings

# Geographic bounds (approximate US midwest region)
LAT_MIN, LAT_MAX = 39.0, 42.0
LON_MIN, LON_MAX = -90.0, -85.0

def generate_normal_consumption(hour):
    """Generate normal hourly consumption with realistic daily pattern."""
    # Base consumption
    base = 1.5
    # Morning peak (7-9 AM)
    if 7 <= hour <= 9:
        base += random.gauss(2.0, 0.5)
    # Evening peak (17-21)
    elif 17 <= hour <= 21:
        base += random.gauss(3.0, 0.8)
    # Night low (0-5 AM)
    elif 0 <= hour <= 5:
        base += random.gauss(0.3, 0.1)
    # Daytime moderate
    else:
        base += random.gauss(1.0, 0.3)
    return max(0.1, base + random.gauss(0, 0.2))

def inject_anomaly(readings, anomaly_type):
    """Inject anomaly patterns into meter readings."""
    if anomaly_type == "sudden_drop":
        # Sudden consumption drop mid-period
        drop_start = random.randint(len(readings) // 3, 2 * len(readings) // 3)
        for i in range(drop_start, min(drop_start + random.randint(48, 168), len(readings))):
            readings[i]["consumption_kwh"] *= random.uniform(0.05, 0.2)
    elif anomaly_type == "flatline":
        # Constant consumption (meter bypass)
        flat_val = random.uniform(0.5, 1.5)
        flat_start = random.randint(0, len(readings) // 2)
        for i in range(flat_start, min(flat_start + random.randint(72, 240), len(readings))):
            readings[i]["consumption_kwh"] = flat_val + random.gauss(0, 0.02)
    elif anomaly_type == "night_usage":
        # Abnormally high night usage
        for r in readings:
            hour = r["_hour"]
            if 0 <= hour <= 5:
                r["consumption_kwh"] = random.uniform(4.0, 8.0)
    return readings

def main():
    rows = []
    anomaly_types = ["sudden_drop", "flatline", "night_usage"]
    
    for meter_idx in range(NUM_METERS):
        meter_id = f"MTR-{meter_idx + 1:04d}"
        lat = round(random.uniform(LAT_MIN, LAT_MAX), 6)
        lon = round(random.uniform(LON_MIN, LON_MAX), 6)
        
        # ~15% of meters are anomalous
        is_anomalous = random.random() < 0.15
        anomaly_type = random.choice(anomaly_types) if is_anomalous else None
        
        readings = []
        start_date = datetime(2025, 1, 1)
        
        for day in range(NUM_DAYS):
            for hour in range(READINGS_PER_DAY):
                timestamp = start_date + timedelta(days=day, hours=hour)
                consumption = generate_normal_consumption(hour)
                
                # Add weekly seasonality
                day_of_week = timestamp.weekday()
                if day_of_week >= 5:  # weekend
                    consumption *= random.uniform(1.1, 1.3)
                
                readings.append({
                    "meter_id": meter_id,
                    "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "consumption_kwh": round(consumption, 4),
                    "latitude": lat,
                    "longitude": lon,
                    "_hour": hour
                })
        
        if is_anomalous:
            readings = inject_anomaly(readings, anomaly_type)
        
        for r in readings:
            del r["_hour"]
            rows.append(r)
    
    output_file = "sample_meter_data.csv"
    with open(output_file, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["meter_id", "timestamp", "consumption_kwh", "latitude", "longitude"])
        writer.writeheader()
        writer.writerows(rows)
    
    print(f"Generated {len(rows)} readings for {NUM_METERS} meters -> {output_file}")
    print(f"Anomalous meters: ~{int(NUM_METERS * 0.15)}")

if __name__ == "__main__":
    main()
