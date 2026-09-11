package smart_banking.service;

import java.math.BigDecimal;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import smart_banking.model.Account;
import smart_banking.model.User;
import smart_banking.repository.AccountRepository;
import smart_banking.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // REGISTER USER
    // =========================

    @Transactional
    public User registerUser(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException(
                    "Email already registered"
            );
        }

        if (userRepository.existsByPhone(user.getPhone())) {
            throw new RuntimeException(
                    "Phone number already registered"
            );
        }

        if (user.getPassword() == null
                || user.getPassword().isBlank()) {

            throw new RuntimeException(
                    "Password is required"
            );
        }

        // =========================
        // PASSWORD ENCRYPTION
        // =========================

        String encodedPassword =
                passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);


        // =========================
        // CREATED DATE
        // =========================

        if (user.getCreatedAt() == null) {

            user.setCreatedAt(
                    java.time.LocalDateTime.now()
            );
        }


        // =========================
        // SAVE USER FIRST
        // =========================

        User savedUser =
                userRepository.save(user);


        // =========================
        // CREATE SAVINGS ACCOUNT
        // =========================

        String accountNumber =
                generateAccountNumber();

        Account account = new Account(
                accountNumber,
                "SAVINGS",
                BigDecimal.ZERO,
                savedUser
        );

        accountRepository.save(account);


        // =========================
        // RETURN USER
        // =========================

        return savedUser;
    }


    // =========================
    // GENERATE ACCOUNT NUMBER
    // =========================

    private String generateAccountNumber() {

        String accountNumber;

        do {

            accountNumber =
                    "SB"
                    + java.util.UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();

        } while (
                accountRepository.existsByAccountNumber(
                        accountNumber
                )
        );

        return accountNumber;
    }


    // =========================
    // FIND USER BY EMAIL
    // =========================

    public User findByEmail(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with email: "
                                        + email
                        )
                );
    }


    // =========================
    // FIND USER BY ID
    // =========================

    public User findById(Long id) {

        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found with ID: "
                                        + id
                        )
                );
    }
}