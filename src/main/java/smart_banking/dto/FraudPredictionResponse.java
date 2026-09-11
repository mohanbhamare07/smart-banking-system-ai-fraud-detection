package smart_banking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FraudPredictionResponse {

    private String status;

    private int prediction;

    @JsonProperty("fraud_status")
    private String fraudStatus;

    @JsonProperty("fraud_score")
    private double fraudScore;

    @JsonProperty("risk_level")
    private String riskLevel;

    public FraudPredictionResponse() {
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getPrediction() {
        return prediction;
    }

    public void setPrediction(int prediction) {
        this.prediction = prediction;
    }

    public String getFraudStatus() {
        return fraudStatus;
    }

    public void setFraudStatus(String fraudStatus) {
        this.fraudStatus = fraudStatus;
    }

    public double getFraudScore() {
        return fraudScore;
    }

    public void setFraudScore(double fraudScore) {
        this.fraudScore = fraudScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }
}