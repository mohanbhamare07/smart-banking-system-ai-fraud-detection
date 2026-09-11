package smart_banking.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import smart_banking.dto.LoginRequest;
import smart_banking.model.User;
import smart_banking.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserService userService,
            PasswordEncoder passwordEncoder
    ) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest loginRequest
    ) {

        try {

            String email = loginRequest.getEmail();
            String password = loginRequest.getPassword();

            if (email == null || email.trim().isEmpty()
                    || password == null || password.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Email and password are required");
            }

            User user = userService.findByEmail(email.trim());

            // =========================
            // BCrypt PASSWORD CHECK
            // =========================

            boolean passwordMatches =
                    passwordEncoder.matches(
                            password,
                            user.getPassword()
                    );

            if (!passwordMatches) {

                return ResponseEntity
                        .badRequest()
                        .body("Invalid email or password");
            }

            // =========================
            // PASSWORD HIDE
            // =========================

            user.setPassword(null);

            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body("Invalid email or password");
        }
    }
}