package smart_banking.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import smart_banking.dto.FraudPredictionRequest;
import smart_banking.dto.FraudPredictionResponse;
import smart_banking.model.Account;
import smart_banking.model.Transaction;
import smart_banking.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final FraudDetectionService fraudDetectionService;
    private final FraudAlertService fraudAlertService;

    public TransactionService(
            TransactionRepository transactionRepository,
            AccountService accountService,
            FraudDetectionService fraudDetectionService,
            FraudAlertService fraudAlertService) {

        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
        this.fraudDetectionService = fraudDetectionService;
        this.fraudAlertService = fraudAlertService;
    }


    // =========================================
    // CREATE TRANSFER TRANSACTION
    // =========================================

    @Transactional
    public Transaction createTransaction(
            Long accountId,
            BigDecimal amount,
            String transactionType,
            String location,
            String deviceId,
            String receiverAccountNumber) {


        // =========================================
        // 1. Validate Amount
        // =========================================

        if (amount == null ||
                amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Transaction amount must be greater than zero");
        }


        // =========================================
        // 2. Validate Transaction Type
        // =========================================

        if (transactionType == null ||
                transactionType.isBlank()) {

            throw new RuntimeException(
                    "Transaction type is required");
        }

        String type =
                transactionType.trim().toUpperCase();


        // =========================================
        // 3. Only TRANSFER Allowed
        // =========================================

        if (!"TRANSFER".equals(type)) {

            throw new RuntimeException(
                    "Only TRANSFER transactions are allowed");
        }


        // =========================================
        // 4. Validate Receiver Account Number
        // =========================================

        if (receiverAccountNumber == null ||
                receiverAccountNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Receiver account number is required");
        }


        // =========================================
        // 5. Find Sender Account
        // =========================================

        Account senderAccount =
                accountService.findById(accountId);


        // =========================================
        // 6. Check Sender Account Status
        // =========================================

        if (!"ACTIVE".equalsIgnoreCase(
                senderAccount.getStatus())) {

            throw new RuntimeException(
                    "Sender account is not active");
        }


        // =========================================
        // 7. Find Receiver Account
        // =========================================

        Account receiverAccount;

        try {

            receiverAccount =
                    accountService.findByAccountNumber(
                            receiverAccountNumber.trim());

        } catch (Exception e) {

            throw new RuntimeException(
                    "Receiver account not found");
        }


        // =========================================
        // 8. Check Receiver Account
        // =========================================

        if (receiverAccount == null) {

            throw new RuntimeException(
                    "Receiver account not found");
        }


        // =========================================
        // 9. Check Receiver Account Status
        // =========================================

        if (!"ACTIVE".equalsIgnoreCase(
                receiverAccount.getStatus())) {

            throw new RuntimeException(
                    "Receiver account is not active");
        }


        // =========================================
        // 10. Sender Cannot Transfer To Himself
        // =========================================

        if (senderAccount.getId()
                .equals(receiverAccount.getId())) {

            throw new RuntimeException(
                    "You cannot transfer money to your own account");
        }


        // =========================================
        // 11. Check Sender Balance
        // =========================================

        if (senderAccount.getBalance()
                .compareTo(amount) < 0) {

            throw new RuntimeException(
                    "Insufficient account balance");
        }


        // =========================================
        // 12. Generate Transaction ID
        // =========================================

        String transactionId =
                generateTransactionId();


        // =========================================
        // 13. Create Transaction
        // =========================================

        Transaction transaction =
                new Transaction(
                        transactionId,
                        senderAccount,
                        amount,
                        type,
                        location,
                        deviceId
                );

        transaction.setReceiverAccount(
                receiverAccount);

        transaction.setTransactionDate(
                LocalDateTime.now());

        transaction.setStatus("PENDING");

        transaction.setFraudStatus("UNKNOWN");

        transaction.setFraudScore(
                BigDecimal.ZERO);


        // =========================================
        // 14. Prepare ML Request
        // =========================================

        FraudPredictionRequest request =
                new FraudPredictionRequest();

        request.setAmount(
                amount.doubleValue());

        request.setTransactionType(
                type);

        request.setLocation(
                location != null
                        ? location
                        : "UNKNOWN");

        request.setDeviceId(
                deviceId != null
                        ? deviceId
                        : "WEB-CLIENT");

        request.setTransactionHour(
                LocalDateTime.now().getHour());


        // =========================================
        // Previous Transactions
        // =========================================

        List<Transaction> previousTransactions =
                transactionRepository
                        .findByAccountId(accountId);

        request.setPreviousTransactions(
                previousTransactions.size());


        // =========================================
        // Demo Device Information
        // =========================================

        request.setIsNewDevice(0);

        request.setIsInternational(0);


        // =========================================
        // 15. Call Python ML API
        // =========================================

        FraudPredictionResponse prediction;

        try {

            prediction =
                    fraudDetectionService
                            .predictFraud(request);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Fraud detection error: "
                            + e.getClass().getName()
                            + " - "
                            + e.getMessage());
        }


        // =========================================
        // 16. Check ML Response
        // =========================================

        if (prediction == null) {

            throw new RuntimeException(
                    "Fraud detection service returned no response");
        }


        // =========================================
        // 17. Set Fraud Information
        // =========================================

        transaction.setFraudScore(
                BigDecimal.valueOf(
                        prediction.getFraudScore()));

        transaction.setFraudStatus(
                prediction.getFraudStatus());


        // =========================================
        // 18. FRAUD TRANSACTION
        // =========================================

        if ("FRAUD".equalsIgnoreCase(
                prediction.getFraudStatus())) {

            transaction.setStatus("BLOCKED");

        }


        // =========================================
        // 19. GENUINE TRANSACTION
        // =========================================

        else {

            transaction.setStatus("APPROVED");
        }


        // =========================================
        // 20. Save Transaction First
        // =========================================

        Transaction savedTransaction =
                transactionRepository.save(
                        transaction);


        // =========================================
        // 21. FRAUD ALERT
        // =========================================

        if ("FRAUD".equalsIgnoreCase(
                savedTransaction.getFraudStatus())) {

            String reason =
                    "AI-based fraud detection identified a suspicious transaction";

            String riskLevel;


            if (savedTransaction.getFraudScore() != null &&
                    savedTransaction.getFraudScore()
                            .compareTo(
                                    new BigDecimal("80")) >= 0) {

                riskLevel = "HIGH";

            }

            else if (savedTransaction.getFraudScore() != null &&
                    savedTransaction.getFraudScore()
                            .compareTo(
                                    new BigDecimal("50")) >= 0) {

                riskLevel = "MEDIUM";

            }

            else {

                riskLevel = "LOW";
            }


            fraudAlertService.createAlert(
                    savedTransaction.getTransactionId(),
                    reason,
                    riskLevel
            );


            // =====================================
            // IMPORTANT:
            // NO MONEY TRANSFER FOR FRAUD
            // =====================================

            return savedTransaction;
        }


        // =========================================
        // 22. TRANSFER MONEY
        // =========================================

        if ("GENUINE".equalsIgnoreCase(
                savedTransaction.getFraudStatus())
                && "APPROVED".equalsIgnoreCase(
                        savedTransaction.getStatus())) {


            // -------------------------------------
            // Deduct from Sender
            // -------------------------------------

            accountService.deductBalance(
                    senderAccount.getId(),
                    amount
            );


            // -------------------------------------
            // Add to Receiver
            // -------------------------------------

            accountService.addBalance(
                    receiverAccount.getId(),
                    amount
            );
        }


        // =========================================
        // 23. Return Transaction
        // =========================================

        return savedTransaction;
    }


    // =========================================
    // Generate Transaction ID
    // =========================================

    private String generateTransactionId() {

        String transactionId;

        do {

            transactionId =
                    "TXN-"
                    + UUID.randomUUID()
                            .toString()
                            .replace("-", "")
                            .substring(0, 12)
                            .toUpperCase();

        } while (
                transactionRepository
                        .existsByTransactionId(
                                transactionId)
        );

        return transactionId;
    }


    // =========================================
    // Find Transaction
    // =========================================

    public Transaction findByTransactionId(
            String transactionId) {

        return transactionRepository
                .findByTransactionId(transactionId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found: "
                                        + transactionId));
    }


    // =========================================
    // ACCOUNT TRANSACTIONS
    // =========================================

    public List<Transaction>
    getAccountTransactions(Long accountId) {

        Account account =
                accountService.findById(accountId);


        // Sender transactions
        List<Transaction> sentTransactions =
                transactionRepository
                        .findByAccount(account);


        // Receiver transactions
        List<Transaction> receivedTransactions =
                transactionRepository
                        .findByReceiverAccount(account);


        // Combine both
        List<Transaction> allTransactions =
                new ArrayList<>();

        allTransactions.addAll(
                sentTransactions);

        allTransactions.addAll(
                receivedTransactions);


        // Sort newest first
        allTransactions.sort(
                Comparator.comparing(
                        Transaction::getTransactionDate,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()))
        );


        return allTransactions;
    }


    // =========================================
    // FRAUD TRANSACTIONS
    // =========================================

    public List<Transaction>
    getFraudTransactions() {

        return transactionRepository
                .findByFraudStatus("FRAUD");
    }


    // =========================================
    // GENUINE TRANSACTIONS
    // =========================================

    public List<Transaction>
    getGenuineTransactions() {

        return transactionRepository
                .findByFraudStatus("GENUINE");
    }


    // =========================================
    // PENDING TRANSACTIONS
    // =========================================

    public List<Transaction>
    getPendingTransactions() {

        return transactionRepository
                .findByStatus("PENDING");
    }


    // =========================================
    // TRANSACTION STATISTICS
    // =========================================

    public java.util.Map<String, Object>
    getTransactionStatistics() {

        long totalTransactions =
                transactionRepository.count();

        long totalFraudTransactions =
                transactionRepository
                        .countByFraudStatus("FRAUD");

        long totalGenuineTransactions =
                transactionRepository
                        .countByFraudStatus("GENUINE");

        long totalApprovedTransactions =
                transactionRepository
                        .countByStatus("APPROVED");

        long totalBlockedTransactions =
                transactionRepository
                        .countByStatus("BLOCKED");


        java.util.Map<String, Object>
                statistics =
                new java.util.LinkedHashMap<>();


        statistics.put(
                "totalTransactions",
                totalTransactions);

        statistics.put(
                "totalFraudTransactions",
                totalFraudTransactions);

        statistics.put(
                "totalGenuineTransactions",
                totalGenuineTransactions);

        statistics.put(
                "totalApprovedTransactions",
                totalApprovedTransactions);

        statistics.put(
                "totalBlockedTransactions",
                totalBlockedTransactions);


        return statistics;
    }

}