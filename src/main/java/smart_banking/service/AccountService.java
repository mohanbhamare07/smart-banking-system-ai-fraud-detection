package smart_banking.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import smart_banking.model.Account;
import smart_banking.model.User;
import smart_banking.repository.AccountRepository;

@Service
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserService userService;

    public AccountService(
            AccountRepository accountRepository,
            UserService userService
    ) {
        this.accountRepository = accountRepository;
        this.userService = userService;
    }

    // Create new bank account
    public Account createAccount(
            Long userId,
            String accountType,
            BigDecimal initialBalance
    ) {

        User user = userService.findById(userId);

        if (initialBalance == null) {
            initialBalance = BigDecimal.ZERO;
        }

        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException(
                    "Initial balance cannot be negative"
            );
        }

        String accountNumber = generateAccountNumber();

        Account account = new Account(
                accountNumber,
                accountType,
                initialBalance,
                user
        );

        return accountRepository.save(account);
    }

    // Generate unique account number
    private String generateAccountNumber() {

        String accountNumber;

        do {
            accountNumber = "SB"
                    + UUID.randomUUID()
                    .toString()
                    .replace("-", "")
                    .substring(0, 12)
                    .toUpperCase();

        } while (
                accountRepository.existsByAccountNumber(accountNumber)
        );

        return accountNumber;
    }

    // Find account by account number
    public Account findByAccountNumber(String accountNumber) {

        return accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found: " + accountNumber
                        )
                );
    }

    // Find account by ID
    public Account findById(Long accountId) {

        return accountRepository
                .findById(accountId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Account not found with ID: " + accountId
                        )
                );
    }

    // Get all accounts of a user
    public List<Account> getUserAccounts(Long userId) {

        User user = userService.findById(userId);

        return accountRepository.findByUser(user);
    }

    // Check account balance
    public BigDecimal getBalance(Long accountId) {

        Account account = findById(accountId);

        return account.getBalance();
    }
    
// ==========================================
// Deduct Amount From Account
// ==========================================

public Account deductBalance(
        Long accountId,
        BigDecimal amount) {

    if (amount == null ||
            amount.compareTo(BigDecimal.ZERO) <= 0) {

        throw new RuntimeException(
                "Deduction amount must be greater than zero");
    }

    Account account = findById(accountId);

    if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {

        throw new RuntimeException(
                "Account is not active");
    }

    if (account.getBalance().compareTo(amount) < 0) {

        throw new RuntimeException(
                "Insufficient account balance");
    }

    BigDecimal newBalance =
            account.getBalance().subtract(amount);

    account.setBalance(newBalance);

    return accountRepository.save(account);
}

// ==========================================
// Add Balance For Deposit Transaction
// ==========================================

public Account addBalance(Long accountId, BigDecimal amount) {

    if (amount == null ||
            amount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new RuntimeException(
                "Deposit amount must be greater than zero");
    }

    Account account = findById(accountId);

    if (!"ACTIVE".equalsIgnoreCase(account.getStatus())) {
        throw new RuntimeException("Account is not active");
    }

    BigDecimal newBalance =
            account.getBalance().add(amount);

    account.setBalance(newBalance);

    return accountRepository.save(account);
}

}