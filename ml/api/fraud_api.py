from flask import Flask, request, jsonify
import pandas as pd
import joblib
from pathlib import Path


# ==========================================
# 1. Create Flask Application
# ==========================================

app = Flask(__name__)


# ==========================================
# 2. Load Trained ML Model
# ==========================================

BASE_DIR = Path(__file__).resolve().parent
MODEL_FILE = BASE_DIR.parent / "model" / "fraud_detection_model.pkl"

model = joblib.load(MODEL_FILE)


# ==========================================
# 3. Home / Health Check
# ==========================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Smart Banking Fraud Detection API is running",
        "status": "success"
    })


# ==========================================
# 4. Fraud Prediction API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No transaction data received"
            }), 400


        # ==========================================
        # Required Fields
        # ==========================================

        required_fields = [
            "amount",
            "transaction_type",
            "location",
            "device_id",
            "transaction_hour",
            "previous_transactions",
            "is_new_device",
            "is_international"
        ]

        for field in required_fields:

            if field not in data:
                return jsonify({
                    "error": f"Missing field: {field}"
                }), 400


        # ==========================================
        # Create DataFrame
        # ==========================================

        transaction_data = pd.DataFrame([{

            "amount": float(data["amount"]),

            "transaction_type":
                str(data["transaction_type"]).upper(),

            "location":
                str(data["location"]),

            "device_id":
                str(data["device_id"]),

            "transaction_hour":
                int(data["transaction_hour"]),

            "previous_transactions":
                int(data["previous_transactions"]),

            "is_new_device":
                int(data["is_new_device"]),

            "is_international":
                int(data["is_international"])

        }])


        # ==========================================
        # ML Prediction
        # ==========================================

        prediction = model.predict(transaction_data)[0]


        # ==========================================
        # Fraud Probability
        # ==========================================

        probability = model.predict_proba(
            transaction_data
        )[0]

        fraud_probability = float(probability[1])

        fraud_score = round(
            fraud_probability * 100,
            2
        )


        # ==========================================
        # Fraud / Genuine Decision
        # ==========================================

        if prediction == 1:

            fraud_status = "FRAUD"

            if fraud_score >= 75:
                risk_level = "HIGH"

            elif fraud_score >= 50:
                risk_level = "MEDIUM"

            else:
                risk_level = "LOW"

        else:

            fraud_status = "GENUINE"
            risk_level = "LOW"


        # ==========================================
        # Response
        # ==========================================

        return jsonify({

            "status": "success",

            "prediction":
                int(prediction),

            "fraud_status":
                fraud_status,

            "fraud_score":
                fraud_score,

            "risk_level":
                risk_level

        })


    except Exception as e:

        return jsonify({

            "status": "error",

            "message": str(e)

        }), 500


# ==========================================
# 5. Start Flask Server
# ==========================================

if __name__ == "__main__":

    print("======================================")
    print("Smart Banking Fraud Detection API")
    print("======================================")
    print("Loading ML model...")
    print("API running at:")
    print("http://127.0.0.1:5000")
    print("======================================")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )