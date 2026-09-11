package smart_banking.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================
    // TRANSACTION ID
    // =========================================

    @Column(nullable = false, unique = true, length = 50)
    private String transactionId;


    // =========================================
    // SENDER ACCOUNT
    // =========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;


    // =========================================
    // RECEIVER ACCOUNT
    // =========================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_account_id")
    private Account receiverAccount;


    // =========================================
    // AMOUNT
    // =========================================

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;


    // =========================================
    // TRANSACTION TYPE
    // =========================================

    @Column(nullable = false, length = 30)
    private String transactionType;


    // =========================================
    // LOCATION
    // =========================================

    @Column(length = 100)
    private String location;


    // =========================================
    // DEVICE ID
    // =========================================

    @Column(length = 100)
    private String deviceId;


    // =========================================
    // TRANSACTION DATE
    // =========================================

    @Column(nullable = false)
    private LocalDateTime transactionDate;


    // =========================================
    // TRANSACTION STATUS
    // =========================================

    @Column(nullable = false, length = 20)
    private String status;


    // =========================================
    // AI FRAUD SCORE
    // =========================================

    @Column(precision = 5, scale = 2)
    private BigDecimal fraudScore;


    // =========================================
    // FRAUD STATUS
    // =========================================

    @Column(nullable = false, length = 20)
    private String fraudStatus;


    // =========================================
    // DEFAULT CONSTRUCTOR
    // =========================================

    public Transaction() {
    }


    // =========================================
    // CONSTRUCTOR
    // =========================================

    public Transaction(
            String transactionId,
            Account account,
            BigDecimal amount,
            String transactionType,
            String location,
            String deviceId
    ) {

        this.transactionId = transactionId;
        this.account = account;
        this.amount = amount;
        this.transactionType = transactionType;
        this.location = location;
        this.deviceId = deviceId;

        this.transactionDate = LocalDateTime.now();

        this.status = "PENDING";

        this.fraudStatus = "UNKNOWN";

        this.fraudScore = BigDecimal.ZERO;
    }


    // =========================================
    // PRE PERSIST
    // =========================================

    @PrePersist
    protected void onCreate() {

        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }

        if (status == null) {
            status = "PENDING";
        }

        if (fraudStatus == null) {
            fraudStatus = "UNKNOWN";
        }

        if (fraudScore == null) {
            fraudScore = BigDecimal.ZERO;
        }
    }


    // =========================================
    // GET ID
    // =========================================

    public Long getId() {
        return id;
    }


    // =========================================
    // SET ID
    // =========================================

    public void setId(Long id) {
        this.id = id;
    }


    // =========================================
    // GET TRANSACTION ID
    // =========================================

    public String getTransactionId() {
        return transactionId;
    }


    // =========================================
    // SET TRANSACTION ID
    // =========================================

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }


    // =========================================
    // GET SENDER ACCOUNT
    // =========================================

    public Account getAccount() {
        return account;
    }


    // =========================================
    // SET SENDER ACCOUNT
    // =========================================

    public void setAccount(Account account) {
        this.account = account;
    }


    // =========================================
    // GET RECEIVER ACCOUNT
    // =========================================

    public Account getReceiverAccount() {
        return receiverAccount;
    }


    // =========================================
    // SET RECEIVER ACCOUNT
    // =========================================

    public void setReceiverAccount(Account receiverAccount) {
        this.receiverAccount = receiverAccount;
    }


    // =========================================
    // GET AMOUNT
    // =========================================

    public BigDecimal getAmount() {
        return amount;
    }


    // =========================================
    // SET AMOUNT
    // =========================================

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }


    // =========================================
    // GET TRANSACTION TYPE
    // =========================================

    public String getTransactionType() {
        return transactionType;
    }


    // =========================================
    // SET TRANSACTION TYPE
    // =========================================

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }


    // =========================================
    // GET LOCATION
    // =========================================

    public String getLocation() {
        return location;
    }


    // =========================================
    // SET LOCATION
    // =========================================

    public void setLocation(String location) {
        this.location = location;
    }


    // =========================================
    // GET DEVICE ID
    // =========================================

    public String getDeviceId() {
        return deviceId;
    }


    // =========================================
    // SET DEVICE ID
    // =========================================

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }


    // =========================================
    // GET TRANSACTION DATE
    // =========================================

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }


    // =========================================
    // SET TRANSACTION DATE
    // =========================================

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }


    // =========================================
    // GET STATUS
    // =========================================

    public String getStatus() {
        return status;
    }


    // =========================================
    // SET STATUS
    // =========================================

    public void setStatus(String status) {
        this.status = status;
    }


    // =========================================
    // GET FRAUD SCORE
    // =========================================

    public BigDecimal getFraudScore() {
        return fraudScore;
    }


    // =========================================
    // SET FRAUD SCORE
    // =========================================

    public void setFraudScore(BigDecimal fraudScore) {
        this.fraudScore = fraudScore;
    }


    // =========================================
    // GET FRAUD STATUS
    // =========================================

    public String getFraudStatus() {
        return fraudStatus;
    }


    // =========================================
    // SET FRAUD STATUS
    // =========================================

    public void setFraudStatus(String fraudStatus) {
        this.fraudStatus = fraudStatus;
    }

}