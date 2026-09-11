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

import smart_banking.model.Account;
import smart_banking.service.AccountService;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    // =========================
    // CREATE ACCOUNT
    // =========================
    @PostMapping
    public ResponseEntity<?> createAccount(
            @RequestParam Long userId,
            @RequestParam String accountType,
            @RequestParam(required = false) BigDecimal initialBalance
    ) {

        try {

            Account account = accountService.createAccount(
                    userId,
                    accountType,
                    initialBalance
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(account);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // GET ACCOUNT BY ID
    // =========================
    @GetMapping("/{accountId}")
    public ResponseEntity<?> getAccountById(
            @PathVariable Long accountId
    ) {

        try {

            Account account = accountService.findById(accountId);

            return ResponseEntity.ok(account);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================
    // GET ACCOUNT BY ACCOUNT NUMBER
    // =========================
    @GetMapping("/number/{accountNumber}")
    public ResponseEntity<?> getAccountByNumber(
            @PathVariable String accountNumber
    ) {

        try {

            Account account =
                    accountService.findByAccountNumber(accountNumber);

            return ResponseEntity.ok(account);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================
    // GET ALL ACCOUNTS OF USER
    // =========================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserAccounts(
            @PathVariable Long userId
    ) {

        try {

            List<Account> accounts =
                    accountService.getUserAccounts(userId);

            return ResponseEntity.ok(accounts);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================
    // GET ACCOUNT BALANCE
    // =========================
    @GetMapping("/{accountId}/balance")
    public ResponseEntity<?> getBalance(
            @PathVariable Long accountId
    ) {

        try {

            BigDecimal balance =
                    accountService.getBalance(accountId);

            return ResponseEntity.ok(balance);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}