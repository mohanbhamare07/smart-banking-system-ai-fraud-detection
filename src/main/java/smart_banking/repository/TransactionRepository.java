package smart_banking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import smart_banking.model.Account;
import smart_banking.model.Transaction;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {


    // =========================================
    // FIND BY TRANSACTION ID
    // =========================================

    Optional<Transaction> findByTransactionId(String transactionId);


    // =========================================
    // CHECK TRANSACTION ID
    // =========================================

    boolean existsByTransactionId(String transactionId);


    // =========================================
    // SENDER ACCOUNT TRANSACTIONS
    // =========================================

    List<Transaction> findByAccount(Account account);

    List<Transaction> findByAccountId(Long accountId);


    // =========================================
    // RECEIVER ACCOUNT TRANSACTIONS
    // =========================================

    List<Transaction> findByReceiverAccount(Account account);

    List<Transaction> findByReceiverAccountId(Long accountId);


    // =========================================
    // FRAUD STATUS
    // =========================================

    List<Transaction> findByFraudStatus(String fraudStatus);


    // =========================================
    // TRANSACTION STATUS
    // =========================================

    List<Transaction> findByStatus(String status);


    // =========================================
    // DASHBOARD STATISTICS
    // =========================================

    long countByFraudStatus(String fraudStatus);

    long countByStatus(String status);

    long countByAccountId(Long accountId);


    // =========================================
    // RECEIVER TRANSACTION COUNT
    // =========================================

    long countByReceiverAccountId(Long accountId);

}