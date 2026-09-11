package smart_banking.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class FraudPredictionRequest {

    private double amount;

    @JsonProperty("transaction_type")
    private String transactionType;

    private String location;

    @JsonProperty("device_id")
    private String deviceId;

    @JsonProperty("transaction_hour")
    private int transactionHour;

    @JsonProperty("previous_transactions")
    private int previousTransactions;

    @JsonProperty("is_new_device")
    private int isNewDevice;

    @JsonProperty("is_international")
    private int isInternational;

    public FraudPredictionRequest() {
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public int getTransactionHour() {
        return transactionHour;
    }

    public void setTransactionHour(int transactionHour) {
        this.transactionHour = transactionHour;
    }

    public int getPreviousTransactions() {
        return previousTransactions;
    }

    public void setPreviousTransactions(int previousTransactions) {
        this.previousTransactions = previousTransactions;
    }

    public int getIsNewDevice() {
        return isNewDevice;
    }

    public void setIsNewDevice(int isNewDevice) {
        this.isNewDevice = isNewDevice;
    }

    public int getIsInternational() {
        return isInternational;
    }

    public void setIsInternational(int isInternational) {
        this.isInternational = isInternational;
    }
}