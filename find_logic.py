import json

with open("Energy_Theft_Detection_(1).ipynb", "r", encoding="utf-8") as f:
    nb = json.load(f)

for cell in nb.get("cells", []):
    if cell.get("cell_type") == "code":
        source = "".join(cell.get("source", []))
        if "def engineer_features" in source:
            with open("features_code.py", "w", encoding="utf-8") as out:
                out.write(source)
            print("Wrote engineer_features to features_code.py")
