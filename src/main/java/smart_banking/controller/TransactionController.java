package smart_banking.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import smart_banking.model.Transaction;
import smart_banking.service.TransactionService;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(
            TransactionService transactionService) {

        this.transactionService = transactionService;
    }


    // =========================================
    // CREATE TRANSACTION
    // =========================================

    @PostMapping
    public ResponseEntity<?> createTransaction(

            @RequestParam Long accountId,

            @RequestParam BigDecimal amount,

            @RequestParam String transactionType,

            @RequestParam(required = false)
            String location,

            @RequestParam(required = false)
            String deviceId,

            @RequestParam(required = false)
            String receiverAccountNumber

    ) {

        try {

            Transaction transaction =
                    transactionService.createTransaction(

                            accountId,

                            amount,

                            transactionType,

                            location,

                            deviceId,

                            receiverAccountNumber
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(transaction);


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =========================================
    // GET TRANSACTION BY ID
    // =========================================

    @GetMapping("/{transactionId}")
    public ResponseEntity<?> getTransaction(

            @PathVariable String transactionId

    ) {

        try {

            Transaction transaction =
                    transactionService
                            .findByTransactionId(
                                    transactionId
                            );


            return ResponseEntity.ok(transaction);


        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================
    // GET ACCOUNT TRANSACTIONS
    // =========================================

    @GetMapping("/account/{accountId}")
    public ResponseEntity<?> getAccountTransactions(

            @PathVariable Long accountId

    ) {

        try {

            List<Transaction> transactions =
                    transactionService
                            .getAccountTransactions(
                                    accountId
                            );


            return ResponseEntity.ok(
                    transactions
            );


        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }


    // =========================================
    // GET FRAUD TRANSACTIONS
    // =========================================

    @GetMapping("/fraud")
    public ResponseEntity<List<Transaction>>
    getFraudTransactions() {

        return ResponseEntity.ok(
                transactionService
                        .getFraudTransactions()
        );
    }


    // =========================================
    // GET GENUINE TRANSACTIONS
    // =========================================

    @GetMapping("/genuine")
    public ResponseEntity<List<Transaction>>
    getGenuineTransactions() {

        return ResponseEntity.ok(
                transactionService
                        .getGenuineTransactions()
        );
    }


    // =========================================
    // GET PENDING TRANSACTIONS
    // =========================================

    @GetMapping("/pending")
    public ResponseEntity<List<Transaction>>
    getPendingTransactions() {

        return ResponseEntity.ok(
                transactionService
                        .getPendingTransactions()
        );
    }


    // =========================================
    // GET TRANSACTION STATISTICS
    // =========================================

    @GetMapping("/statistics")
    public ResponseEntity<?> getTransactionStatistics() {

        try {

            return ResponseEntity.ok(
                    transactionService
                            .getTransactionStatistics()
            );


        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

}