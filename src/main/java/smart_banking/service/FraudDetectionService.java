package smart_banking.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import smart_banking.dto.FraudPredictionRequest;
import smart_banking.dto.FraudPredictionResponse;

@Service
public class FraudDetectionService {

    private final RestClient restClient;

    private static final String ML_API_URL =
            "http://127.0.0.1:5000";

    public FraudDetectionService(RestClient.Builder restClientBuilder) {

        this.restClient = restClientBuilder
                .baseUrl(ML_API_URL)
                .build();
    }

    public FraudPredictionResponse predictFraud(
            FraudPredictionRequest request) {

        return restClient
                .post()
                .uri("/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .body(request)
                .retrieve()
                .body(FraudPredictionResponse.class);
    }
}