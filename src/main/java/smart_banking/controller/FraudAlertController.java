package smart_banking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import smart_banking.model.FraudAlert;
import smart_banking.service.FraudAlertService;

import java.util.List;

@RestController
@RequestMapping("/api/fraud-alerts")
@CrossOrigin(origins = "*")
public class FraudAlertController {

    private final FraudAlertService fraudAlertService;

    public FraudAlertController(FraudAlertService fraudAlertService) {
        this.fraudAlertService = fraudAlertService;
    }

    // =========================
    // CREATE FRAUD ALERT
    // =========================
    @PostMapping
    public ResponseEntity<?> createAlert(
            @RequestParam String transactionId,
            @RequestParam String reason,
            @RequestParam String riskLevel
    ) {

        try {

            FraudAlert alert =
                    fraudAlertService.createAlert(
                            transactionId,
                            reason,
                            riskLevel
                    );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(alert);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // GET ALL FRAUD ALERTS
    // =========================
    @GetMapping
    public ResponseEntity<List<FraudAlert>> getAllAlerts() {

        return ResponseEntity.ok(
                fraudAlertService.getAllAlerts()
        );
    }

    // =========================
    // GET UNRESOLVED ALERTS
    // =========================
    @GetMapping("/unresolved")
    public ResponseEntity<List<FraudAlert>> getUnresolvedAlerts() {

        return ResponseEntity.ok(
                fraudAlertService.getUnresolvedAlerts()
        );
    }

    // =========================
    // GET RESOLVED ALERTS
    // =========================
    @GetMapping("/resolved")
    public ResponseEntity<List<FraudAlert>> getResolvedAlerts() {

        return ResponseEntity.ok(
                fraudAlertService.getResolvedAlerts()
        );
    }

    // =========================
    // GET ALERTS BY RISK LEVEL
    // =========================
    @GetMapping("/risk/{riskLevel}")
    public ResponseEntity<List<FraudAlert>> getAlertsByRiskLevel(
            @PathVariable String riskLevel
    ) {

        return ResponseEntity.ok(
                fraudAlertService.getAlertsByRiskLevel(riskLevel)
        );
    }

    // =========================
    // GET ALERT BY TRANSACTION ID
    // =========================
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getAlertByTransactionId(
            @PathVariable Long transactionId
    ) {

        try {

            FraudAlert alert =
                    fraudAlertService.findByTransactionId(transactionId);

            return ResponseEntity.ok(alert);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }

    // =========================
    // RESOLVE FRAUD ALERT
    // =========================
    @PutMapping("/{alertId}/resolve")
    public ResponseEntity<?> resolveAlert(
            @PathVariable Long alertId
    ) {

        try {

            FraudAlert alert =
                    fraudAlertService.resolveAlert(alertId);

            return ResponseEntity.ok(alert);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(e.getMessage());
        }
    }
}