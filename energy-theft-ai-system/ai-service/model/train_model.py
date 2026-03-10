"""
Standalone script to train and save an Isolation Forest model from CSV data.
Usage: python train_model.py --data ../data/sample_meter_data.csv
"""
import argparse
import pickle
import pandas as pd
from feature_engineering import engineer_features
from anomaly_detector import detect_anomalies, FEATURE_COLUMNS
from sklearn.preprocessing import StandardScaler


def main():
    parser = argparse.ArgumentParser(description='Train Isolation Forest model')
    parser.add_argument('--data', type=str, required=True, help='Path to meter data CSV')
    parser.add_argument('--output', type=str, default='trained_model.pkl', help='Output model path')
    args = parser.parse_args()
    
    print(f"Loading data from {args.data}...")
    df = pd.read_csv(args.data)
    print(f"Loaded {len(df)} readings")
    
    print("Engineering features...")
    features_df = engineer_features(df)
    print(f"Computed features for {len(features_df)} meters")
    
    print("Training Isolation Forest...")
    results_df, model, scaler, X_scaled = detect_anomalies(features_df)
    
    suspicious = results_df[results_df['is_suspicious'] == True]
    print(f"Detected {len(suspicious)} suspicious meters out of {len(results_df)}")
    
    # Save model and scaler
    with open(args.output, 'wb') as f:
        pickle.dump({'model': model, 'scaler': scaler}, f)
    print(f"Model saved to {args.output}")


if __name__ == '__main__':
    main()
