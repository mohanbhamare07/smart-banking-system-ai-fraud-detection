import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FraudAlerts() {

  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resolvingId, setResolvingId] = useState(null);


  // =========================================
  // LOAD LOGGED-IN USER FRAUD ALERTS
  // =========================================

  useEffect(() => {

    fetchAlerts();

  }, []);


  const fetchAlerts = async () => {

    try {

      setLoading(true);
      setError("");


      // =========================================
      // GET LOGGED-IN USER
      // =========================================

      const storedUser =
        localStorage.getItem("loggedInUser");


      if (!storedUser) {

        navigate("/login");

        return;

      }


      const user = JSON.parse(storedUser);


      if (!user.id) {

        setError(
          "User information not found. Please login again."
        );

        setLoading(false);

        return;

      }


      const userId = user.id;


      // =========================================
      // GET USER ACCOUNTS
      // =========================================

      const accountResponse = await axios.get(
        `http://localhost:8080/api/accounts/user/${userId}`
      );


      const accounts = accountResponse.data;


      if (!accounts || accounts.length === 0) {

        setAlerts([]);
        setLoading(false);

        return;

      }


      // Prefer ACTIVE account
      const activeAccount =
        accounts.find(
          (account) => account.status === "ACTIVE"
        ) || accounts[0];


      // =========================================
      // GET USER TRANSACTIONS
      // =========================================

      const transactionResponse = await axios.get(
        `http://localhost:8080/api/transactions/account/${activeAccount.id}`
      );


      const userTransactions =
        transactionResponse.data || [];


      // =========================================
      // GET ALL FRAUD ALERTS
      // =========================================

      const alertResponse = await axios.get(
        "http://localhost:8080/api/fraud-alerts"
      );


      const allAlerts =
        alertResponse.data || [];


      // =========================================
      // GET USER TRANSACTION IDs
      // =========================================

      const userTransactionIds =
        new Set(
          userTransactions.map(
            (transaction) =>
              transaction.transactionId
          )
        );


      // =========================================
      // FILTER ONLY LOGGED-IN USER ALERTS
      // =========================================

      const userAlerts =
        allAlerts.filter((alert) => {

          const transactionId =
            alert.transaction?.transactionId ||
            alert.transactionId;


          return userTransactionIds.has(
            transactionId
          );

        });


      // Latest alerts first
      userAlerts.sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      );


      setAlerts(userAlerts);

    } catch (err) {

      console.error(
        "Fraud alerts error:",
        err
      );


      setError(
        "Unable to load fraud alerts. Please make sure Spring Boot is running."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // RESOLVE ALERT
  // =========================================

  const resolveAlert = async (alertId) => {

    try {

      setResolvingId(alertId);


      await axios.put(
        `http://localhost:8080/api/fraud-alerts/${alertId}/resolve`
      );


      await fetchAlerts();

    } catch (err) {

      console.error(
        "Resolve alert error:",
        err
      );

      alert(
        "Unable to resolve this fraud alert."
      );

    } finally {

      setResolvingId(null);

    }

  };


  // =========================================
  // FORMAT AMOUNT
  // =========================================

  const formatAmount = (amount) => {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency: "INR",

      minimumFractionDigits: 2

    }).format(amount || 0);

  };


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) {
      return "N/A";
    }


    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  // =========================================
  // RISK CLASS
  // =========================================

  const getRiskClass = (riskLevel) => {

    if (riskLevel === "HIGH") {
      return "risk-high";
    }

    if (riskLevel === "MEDIUM") {
      return "risk-medium";
    }

    if (riskLevel === "LOW") {
      return "risk-low";
    }

    return "risk-unknown";

  };


  // =========================================
  // RISK ICON
  // =========================================

  const getRiskIcon = (riskLevel) => {

    if (riskLevel === "HIGH") {
      return "🔴";
    }

    if (riskLevel === "MEDIUM") {
      return "🟠";
    }

    if (riskLevel === "LOW") {
      return "🟢";
    }

    return "⚪";

  };


  // =========================================
  // SUMMARY
  // =========================================

  const unresolvedAlerts =
    alerts.filter(
      (alert) => !alert.resolved
    ).length;


  const resolvedAlerts =
    alerts.filter(
      (alert) => alert.resolved
    ).length;


  const highRiskAlerts =
    alerts.filter(
      (alert) => alert.riskLevel === "HIGH"
    ).length;


  return (

    <div className="page-container">


      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>

          <h1>
            Fraud Alerts
          </h1>

          <p>
            Monitor and manage suspicious transactions detected by AI.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={fetchAlerts}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      <div className="fraud-summary">


        <div className="fraud-summary-card">

          <div className="fraud-summary-icon red">
            🚨
          </div>

          <div>

            <span>
              Total Alerts
            </span>

            <h2>
              {alerts.length}
            </h2>

          </div>

        </div>


        <div className="fraud-summary-card">

          <div className="fraud-summary-icon orange">
            ⚠️
          </div>

          <div>

            <span>
              Unresolved
            </span>

            <h2>
              {unresolvedAlerts}
            </h2>

          </div>

        </div>


        <div className="fraud-summary-card">

          <div className="fraud-summary-icon dark-red">
            🔴
          </div>

          <div>

            <span>
              High Risk
            </span>

            <h2>
              {highRiskAlerts}
            </h2>

          </div>

        </div>


        <div className="fraud-summary-card">

          <div className="fraud-summary-icon green">
            ✓
          </div>

          <div>

            <span>
              Resolved
            </span>

            <h2>
              {resolvedAlerts}
            </h2>

          </div>

        </div>


      </div>


      {/* =====================================
          AI PROTECTION BANNER
      ====================================== */}

      <div className="fraud-protection-banner">

        <div className="fraud-protection-icon">
          🛡️
        </div>


        <div className="fraud-protection-content">

          <h3>
            AI Fraud Protection Active
          </h3>

          <p>
            Our AI system continuously analyzes your transactions
            and automatically detects suspicious activities.
          </p>

        </div>


        <div className="protection-status">

          <span className="status-dot"></span>

          Active

        </div>

      </div>


      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (

        <div className="fraud-message">

          <div className="loading-spinner"></div>

          <p>
            Loading fraud alerts...
          </p>

        </div>

      )}


      {/* =====================================
          ERROR
      ====================================== */}

      {!loading && error && (

        <div className="fraud-message error-message">

          <div className="message-icon">
            ⚠️
          </div>

          <p>
            {error}
          </p>


          <button
            onClick={fetchAlerts}
            className="retry-button"
          >
            Try Again
          </button>

        </div>

      )}


      {/* =====================================
          NO ALERTS
      ====================================== */}

      {!loading &&
        !error &&
        alerts.length === 0 && (

          <div className="fraud-message">

            <div className="message-icon">
              🛡️
            </div>

            <h3>
              No Fraud Alerts
            </h3>

            <p>
              Great! No suspicious transactions have been detected.
            </p>

          </div>

        )}


      {/* =====================================
          ALERTS
      ====================================== */}

      {!loading &&
        !error &&
        alerts.length > 0 && (

          <div className="fraud-alerts-card">


            <div className="fraud-alerts-header">

              <div>

                <h2>
                  Fraud Alert History
                </h2>

                <p>
                  AI-detected suspicious transaction alerts.
                </p>

              </div>


              <span className="alert-count-badge">
                {alerts.length} Alerts
              </span>

            </div>


            <div className="fraud-alert-list">


              {alerts.map((alert) => (

                <div
                  key={alert.id}
                  className={`fraud-alert-item ${
                    alert.resolved
                      ? "resolved-alert"
                      : ""
                  }`}
                >


                  {/* ALERT ICON */}

                  <div
                    className={`fraud-alert-icon ${getRiskClass(
                      alert.riskLevel
                    )}`}
                  >
                    🚨
                  </div>


                  {/* ALERT CONTENT */}

                  <div className="fraud-alert-content">


                    <div className="fraud-alert-top">

                      <div>

                        <h3>
                          Suspicious Transaction Detected
                        </h3>


                        <span className="fraud-transaction-id">

                          Transaction ID:{" "}

                          {alert.transaction?.transactionId ||
                            alert.transactionId ||
                            "N/A"}

                        </span>

                      </div>


                      <span
                        className={`risk-badge ${getRiskClass(
                          alert.riskLevel
                        )}`}
                      >

                        {getRiskIcon(
                          alert.riskLevel
                        )}{" "}

                        {alert.riskLevel ||
                          "UNKNOWN"} RISK

                      </span>

                    </div>


                    {/* DETAILS */}

                    <div className="fraud-alert-details">


                      <div className="fraud-detail">

                        <span>
                          💰 Amount
                        </span>

                        <strong>

                          {formatAmount(
                            alert.transaction?.amount ||
                              alert.amount
                          )}

                        </strong>

                      </div>


                      <div className="fraud-detail">

                        <span>
                          📊 Fraud Score
                        </span>

                        <strong className="fraud-score-value">

                          {alert.transaction?.fraudScore ??
                            alert.fraudScore ??
                            0}

                          %

                        </strong>

                      </div>


                      <div className="fraud-detail">

                        <span>
                          💳 Type
                        </span>

                        <strong>

                          {alert.transaction?.transactionType ||
                            alert.transactionType ||
                            "N/A"}

                        </strong>

                      </div>


                      <div className="fraud-detail">

                        <span>
                          📍 Location
                        </span>

                        <strong>

                          {alert.transaction?.location ||
                            alert.location ||
                            "N/A"}

                        </strong>

                      </div>


                      <div className="fraud-detail">

                        <span>
                          📅 Detected
                        </span>

                        <strong>

                          {formatDate(
                            alert.createdAt
                          )}

                        </strong>

                      </div>


                    </div>


                    {/* REASON */}

                    <div className="fraud-reason">

                      <strong>
                        Reason:
                      </strong>

                      <span>

                        {alert.reason ||
                          "Suspicious transaction detected by AI fraud detection system."}

                      </span>

                    </div>


                    {/* BOTTOM */}

                    <div className="fraud-alert-bottom">


                      {alert.resolved ? (

                        <span className="resolved-badge">
                          ✓ Resolved
                        </span>

                      ) : (

                        <button
                          className="resolve-button"
                          onClick={() =>
                            resolveAlert(alert.id)
                          }
                          disabled={
                            resolvingId === alert.id
                          }
                        >

                          {resolvingId === alert.id
                            ? "Resolving..."
                            : "✓ Resolve Alert"}

                        </button>

                      )}

                    </div>


                  </div>

                </div>

              ))}


            </div>

          </div>

        )}

    </div>

  );

}

export default FraudAlerts;