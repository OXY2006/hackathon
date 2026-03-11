import joblib
import pandas as pd
import numpy as np
import shap

model = joblib.load('../models/energy_theft_model (2).pkl')
b = model.estimators_[0] 
print(type(b))

# Let's see if TreeExplainer works on it
try:
    explainer = shap.TreeExplainer(b)
    # mock data
    X = np.random.rand(2, 53)
    sv = explainer.shap_values(X)
    print("SHAP worked! shape:", np.array(sv).shape)
except Exception as e:
    print("Error:", e)
