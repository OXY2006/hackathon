import joblib

try:
    imputer = joblib.load('../models/energy_theft_imputer.pkl')
    print("Imputer loaded. Attributes:")
    print(dir(imputer))
    if hasattr(imputer, 'statistics_'):
        print("statistics:", imputer.statistics_)
except Exception as e:
    print("Error:", e)
