import pandas as pd
import joblib

from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix


# ==========================================
# 1. File Paths
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
DATASET_FILE = BASE_DIR.parent / "dataset" / "fraud_transactions.csv"
MODEL_FILE = BASE_DIR / "fraud_detection_model.pkl"


# ==========================================
# 2. Load Dataset
# ==========================================

print("======================================")
print("Loading Fraud Detection Dataset")
print("======================================")

df = pd.read_csv(DATASET_FILE)

print(f"Dataset shape: {df.shape}")
print()


# ==========================================
# 3. Separate Features and Target
# ==========================================

X = df.drop("fraud", axis=1)
y = df["fraud"]


# ==========================================
# 4. Define Columns
# ==========================================

categorical_features = [
    "transaction_type",
    "location",
    "device_id"
]

numeric_features = [
    "amount",
    "transaction_hour",
    "previous_transactions",
    "is_new_device",
    "is_international"
]


# ==========================================
# 5. Preprocessing
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            categorical_features
        )
    ],
    remainder="passthrough"
)


# ==========================================
# 6. Create Random Forest Model
# ==========================================

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    class_weight="balanced"
)


# ==========================================
# 7. Create ML Pipeline
# ==========================================

pipeline = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("classifier", model)
    ]
)


# ==========================================
# 8. Split Dataset
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("Training records :", len(X_train))
print("Testing records  :", len(X_test))
print()


# ==========================================
# 9. Train Model
# ==========================================

print("======================================")
print("Training Random Forest Model...")
print("======================================")

pipeline.fit(X_train, y_train)


# ==========================================
# 10. Prediction
# ==========================================

y_pred = pipeline.predict(X_test)


# ==========================================
# 11. Model Evaluation
# ==========================================

accuracy = accuracy_score(y_test, y_pred)

print()
print("======================================")
print("MODEL PERFORMANCE")
print("======================================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print()
print("Classification Report:")
print(classification_report(y_test, y_pred))

print()
print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# ==========================================
# 12. Save Trained Model
# ==========================================

joblib.dump(
    pipeline,
    MODEL_FILE
)

print()
print("======================================")
print("ML MODEL TRAINING COMPLETED")
print("======================================")

print(f"Model saved at:")
print(MODEL_FILE)

print("======================================")