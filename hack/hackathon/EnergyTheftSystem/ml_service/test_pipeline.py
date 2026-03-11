import joblib
import pandas as pd
import numpy as np

print("Loading models...")
imputer = joblib.load('../models/energy_theft_imputer.pkl')
scaler = joblib.load('../models/energy_theft_scaler.pkl')
model = joblib.load('../models/energy_theft_model (2).pkl')

# Patch imputer
if not hasattr(imputer, '_fill_dtype'):
    imputer._fill_dtype = getattr(imputer.statistics_, 'dtype', None)
if not hasattr(imputer, '_fill_fallback'):
    imputer._fill_fallback = '0'

print("Making dummy data...")
# Make dummy data
X = pd.DataFrame(np.random.randn(5, 57))

try:
    print("Transforming...")
    X_imputed = imputer.transform(X)
    X_scaled = scaler.transform(X_imputed)
    print("Predicting...")
    preds = model.predict(X_scaled)
    print("Success! Predictions:", preds)
except Exception as e:
    import traceback
    traceback.print_exc()
