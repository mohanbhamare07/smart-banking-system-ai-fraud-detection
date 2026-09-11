package smart_banking.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import smart_banking.model.FraudAlert;
import smart_banking.model.Transaction;
import smart_banking.repository.FraudAlertRepository;
import smart_banking.repository.TransactionRepository;

@Service
public class FraudAlertService {

    private final FraudAlertRepository fraudAlertRepository;
    private final TransactionRepository transactionRepository;

    public FraudAlertService(
            FraudAlertRepository fraudAlertRepository,
            TransactionRepository transactionRepository
    ) {

        this.fraudAlertRepository = fraudAlertRepository;
        this.transactionRepository = transactionRepository;
    }

    // ==========================================
    // Create a new fraud alert
    // ==========================================

    @Transactional
    public FraudAlert createAlert(
            String transactionId,
            String reason,
            String riskLevel
    ) {

        if (transactionId == null ||
                transactionId.isBlank()) {

            throw new RuntimeException(
                    "Transaction ID is required");
        }

        if (reason == null ||
                reason.isBlank()) {

            throw new RuntimeException(
                    "Fraud alert reason is required");
        }

        if (riskLevel == null ||
                riskLevel.isBlank()) {

            throw new RuntimeException(
                    "Risk level is required");
        }

        // Find transaction directly from repository
        Transaction transaction =
                transactionRepository
                        .findByTransactionId(transactionId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Transaction not found: "
                                                + transactionId
                                )
                        );

        // Check whether alert already exists
        if (fraudAlertRepository
                .findByTransaction(transaction)
                .isPresent()) {

            throw new RuntimeException(
                    "Fraud alert already exists for transaction: "
                            + transactionId
            );
        }

        // Create fraud alert
        FraudAlert alert =
                new FraudAlert(
                        transaction,
                        reason,
                        riskLevel.toUpperCase()
                );

        return fraudAlertRepository.save(alert);
    }

    // ==========================================
    // Find alert using Transaction Database ID
    // ==========================================

    public FraudAlert findByTransactionId(
            Long transactionId) {

        return fraudAlertRepository
                .findByTransaction_Id(transactionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Fraud alert not found for transaction ID: "
                                        + transactionId
                        )
                );
    }

    // ==========================================
    // Get all unresolved fraud alerts
    // ==========================================

    public List<FraudAlert> getUnresolvedAlerts() {

        return fraudAlertRepository
                .findByResolved(false);
    }

    // ==========================================
    // Get all resolved fraud alerts
    // ==========================================

    public List<FraudAlert> getResolvedAlerts() {

        return fraudAlertRepository
                .findByResolved(true);
    }

    // ==========================================
    // Get alerts by risk level
    // ==========================================

    public List<FraudAlert> getAlertsByRiskLevel(
            String riskLevel
    ) {

        if (riskLevel == null ||
                riskLevel.isBlank()) {

            throw new RuntimeException(
                    "Risk level is required");
        }

        return fraudAlertRepository
                .findByRiskLevel(
                        riskLevel.toUpperCase()
                );
    }

    // ==========================================
    // Resolve a fraud alert
    // ==========================================

    @Transactional
    public FraudAlert resolveAlert(Long alertId) {

        FraudAlert alert =
                fraudAlertRepository
                        .findById(alertId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Fraud alert not found with ID: "
                                                + alertId
                                )
                        );

        alert.setResolved(true);

        return fraudAlertRepository.save(alert);
    }

    // ==========================================
    // Get all fraud alerts
    // ==========================================

    public List<FraudAlert> getAllAlerts() {

        return fraudAlertRepository.findAll();
    }
}