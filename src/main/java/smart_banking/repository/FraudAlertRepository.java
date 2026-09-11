package smart_banking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import smart_banking.model.FraudAlert;
import smart_banking.model.Transaction;

@Repository
public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {

    Optional<FraudAlert> findByTransaction(Transaction transaction);

    Optional<FraudAlert> findByTransaction_Id(Long transactionId);

    List<FraudAlert> findByRiskLevel(String riskLevel);

    List<FraudAlert> findByResolved(boolean resolved);
}