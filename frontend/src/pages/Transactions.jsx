import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Transactions() {

  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================
  // LOAD CURRENT USER TRANSACTIONS
  // =========================================

  useEffect(() => {

    const loggedInUser =
      localStorage.getItem("loggedInUser");

    if (!loggedInUser) {

      navigate("/login");

      return;
    }

    let user;

    try {

      user = JSON.parse(loggedInUser);

    } catch (error) {

      console.error(
        "Invalid loggedInUser:",
        error
      );

      localStorage.removeItem(
        "loggedInUser"
      );

      navigate("/login");

      return;
    }

    if (!user || !user.id) {

      navigate("/login");

      return;
    }

    const userId = user.id;


    const loadTransactions = async () => {

      try {

        setLoading(true);
        setError("");


        // =========================================
        // GET CURRENT USER ACCOUNTS
        // =========================================

        const accountResponse =
          await axios.get(
            `http://localhost:8080/api/accounts/user/${userId}`
          );


        const accounts =
          accountResponse.data || [];


        if (accounts.length === 0) {

          setAccount(null);
          setTransactions([]);
          setLoading(false);

          return;
        }


        // =========================================
        // GET ACTIVE ACCOUNT
        // =========================================

        const activeAccount =
          accounts.find(
            (acc) =>
              acc.status === "ACTIVE"
          ) || accounts[0];


        setAccount(activeAccount);


        // =========================================
        // GET ACCOUNT TRANSACTIONS
        // =========================================

        const transactionResponse =
          await axios.get(
            `http://localhost:8080/api/transactions/account/${activeAccount.id}`
          );


        const allTransactions =
          transactionResponse.data || [];


        // =========================================
        // ONLY TRANSFER TRANSACTIONS
        // =========================================

        const transferTransactions =
          allTransactions.filter(
            (transaction) =>
              transaction.transactionType ===
              "TRANSFER"
          );


        setTransactions(
          transferTransactions
        );


        setLoading(false);

      } catch (error) {

        console.error(
          "Error fetching transactions:",
          error
        );

        setError(
          "Unable to load transactions."
        );

        setLoading(false);
      }

    };


    loadTransactions();

  }, [navigate]);


  // =========================================
  // FORMAT AMOUNT
  // =========================================

  const formatAmount = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
      }
    ).format(amount || 0);

  };


  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (date) => {

    if (!date) {

      return "Unknown";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short"
      }
    );

  };


  // =========================================
  // GET TRANSACTION DIRECTION
  // =========================================

  const getTransactionDirection = (
    transaction
  ) => {

    // -----------------------------------------
    // RECEIVED
    // -----------------------------------------

    if (
      transaction.receiverAccount &&
      account &&
      Number(
        transaction.receiverAccount.id
      ) === Number(account.id)
    ) {

      return "RECEIVED";
    }


    // -----------------------------------------
    // SENT
    // -----------------------------------------

    if (
      transaction.account &&
      account &&
      Number(
        transaction.account.id
      ) === Number(account.id)
    ) {

      return "SENT";
    }


    return "UNKNOWN";

  };


  // =========================================
  // GET AMOUNT DISPLAY
  // =========================================

  const getAmountDisplay = (
    transaction
  ) => {

    const amount =
      Number(transaction.amount || 0);


    const direction =
      getTransactionDirection(
        transaction
      );


    // -----------------------------------------
    // BLOCKED TRANSACTION
    // -----------------------------------------

    // Money was NOT transferred,
    // so don't show + or -.

    if (
      transaction.status ===
      "BLOCKED"
    ) {

      return formatAmount(amount);
    }


    // -----------------------------------------
    // RECEIVED
    // -----------------------------------------

    if (
      direction ===
      "RECEIVED"
    ) {

      return `+${formatAmount(amount)}`;
    }


    // -----------------------------------------
    // SENT
    // -----------------------------------------

    if (
      direction ===
      "SENT"
    ) {

      return `-${formatAmount(amount)}`;
    }


    return formatAmount(amount);

  };


  // =========================================
  // AMOUNT CLASS
  // =========================================

  const getAmountClass = (
    transaction
  ) => {

    if (
      transaction.status ===
      "BLOCKED"
    ) {

      return "transaction-amount-blocked";
    }


    const direction =
      getTransactionDirection(
        transaction
      );


    if (
      direction ===
      "RECEIVED"
    ) {

      return "transaction-amount-received";
    }


    if (
      direction ===
      "SENT"
    ) {

      return "transaction-amount-sent";
    }


    return "";

  };


  // =========================================
  // DIRECTION CLASS
  // =========================================

  const getDirectionClass = (
    transaction
  ) => {

    const direction =
      getTransactionDirection(
        transaction
      );


    if (
      direction ===
      "RECEIVED"
    ) {

      return "transaction-direction-received";
    }


    if (
      direction ===
      "SENT"
    ) {

      return "transaction-direction-sent";
    }


    return "transaction-direction-unknown";

  };


  // =========================================
  // STATUS CLASS
  // =========================================

  const getStatusClass = (
    status
  ) => {

    if (
      status ===
      "APPROVED"
    ) {

      return "transaction-approved";
    }


    if (
      status ===
      "BLOCKED"
    ) {

      return "transaction-blocked";
    }


    return "transaction-pending";

  };


  // =========================================
  // FRAUD CLASS
  // =========================================

  const getFraudClass = (
    fraudStatus
  ) => {

    if (
      fraudStatus ===
      "FRAUD"
    ) {

      return "fraud-danger";
    }


    if (
      fraudStatus ===
      "GENUINE"
    ) {

      return "fraud-safe";
    }


    return "fraud-unknown";

  };


  return (

    <section className="transactions-content">


      {/* =====================================
          PAGE HEADING
      ====================================== */}

      <div className="page-heading">

        <div>

          <h2>
            Transactions
          </h2>

          <p>
            View and monitor all your banking
            transactions.
          </p>

        </div>


        <div className="security-status">

          <span className="status-dot"></span>

          AI Protection Active

        </div>

      </div>


      {/* =====================================
          ACCOUNT INFORMATION
      ====================================== */}

      {account && (

        <div className="dashboard-card">

          <div className="card-header">

            <div>

              <h3>
                {account.accountType ||
                  "SAVINGS"} Account
              </h3>

              <p>
                Account Number:{" "}
                {account.accountNumber}
              </p>

            </div>

            <div className="account-icon">
              🏦
            </div>

          </div>

        </div>

      )}


      {/* =====================================
          TRANSACTION SUMMARY
      ====================================== */}

      <div className="transaction-summary">


        {/* TOTAL */}

        <div className="summary-card">

          <span className="summary-icon">
            💳
          </span>

          <div>

            <span>
              Total Transactions
            </span>

            <strong>
              {transactions.length}
            </strong>

          </div>

        </div>


        {/* GENUINE */}

        <div className="summary-card">

          <span className="summary-icon">
            🛡️
          </span>

          <div>

            <span>
              Genuine
            </span>

            <strong>

              {
                transactions.filter(
                  (t) =>
                    t.fraudStatus ===
                    "GENUINE"
                ).length
              }

            </strong>

          </div>

        </div>


        {/* FRAUD */}

        <div className="summary-card">

          <span className="summary-icon">
            🚨
          </span>

          <div>

            <span>
              Fraud
            </span>

            <strong>

              {
                transactions.filter(
                  (t) =>
                    t.fraudStatus ===
                    "FRAUD"
                ).length
              }

            </strong>

          </div>

        </div>


        {/* BLOCKED */}

        <div className="summary-card">

          <span className="summary-icon">
            🔒
          </span>

          <div>

            <span>
              Blocked
            </span>

            <strong>

              {
                transactions.filter(
                  (t) =>
                    t.status ===
                    "BLOCKED"
                ).length
              }

            </strong>

          </div>

        </div>

      </div>


      {/* =====================================
          TRANSACTION TABLE
      ====================================== */}

      <div className="dashboard-card transactions-table-card">

        <div className="card-header">

          <div>

            <h3>
              Transaction History
            </h3>

            <p>
              Complete transfer activity
            </p>

          </div>

        </div>


        {/* =====================================
            LOADING
        ====================================== */}

        {loading && (

          <div className="transaction-message">

            <span>
              ⏳
            </span>

            <p>
              Loading transactions...
            </p>

          </div>

        )}


        {/* =====================================
            ERROR
        ====================================== */}

        {!loading &&
          error && (

            <div className="transaction-message error-message">

              <span>
                ⚠️
              </span>

              <p>
                {error}
              </p>

            </div>

          )}


        {/* =====================================
            EMPTY
        ====================================== */}

        {!loading &&
          !error &&
          transactions.length === 0 && (

            <div className="transaction-message">

              <span>
                💳
              </span>

              <h4>
                No Transactions Found
              </h4>

              <p>
                Your transfer transactions will
                appear here.
              </p>

            </div>

          )}


        {/* =====================================
            TABLE
        ====================================== */}

        {!loading &&
          !error &&
          transactions.length > 0 && (

            <div className="transactions-table-wrapper">

              <table className="transactions-table">

                <thead>

                  <tr>

                    <th>
                      Transaction ID
                    </th>

                    <th>
                      Direction
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Device
                    </th>

                    <th>
                      AI Score
                    </th>

                    <th>
                      Fraud Status
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {transactions.map(
                    (transaction) => {

                      const direction =
                        getTransactionDirection(
                          transaction
                        );


                      return (

                        <tr
                          key={
                            transaction.id
                          }
                        >

                          {/* TRANSACTION ID */}

                          <td>

                            <strong>
                              {
                                transaction.transactionId
                              }
                            </strong>

                          </td>


                          {/* DIRECTION */}

                          <td>

                            <span
                              className={`transaction-direction ${getDirectionClass(
                                transaction
                              )}`}
                            >

                              {direction ===
                              "SENT"
                                ? "↗ SENT"
                                : direction ===
                                  "RECEIVED"
                                ? "↙ RECEIVED"
                                : "UNKNOWN"}

                            </span>

                          </td>


                          {/* TYPE */}

                          <td>

                            <span className="transaction-type">

                              {
                                transaction.transactionType
                              }

                            </span>

                          </td>


                          {/* AMOUNT */}

                          <td>

                            <strong
                              className={
                                getAmountClass(
                                  transaction
                                )
                              }
                            >

                              {
                                getAmountDisplay(
                                  transaction
                                )
                              }

                            </strong>

                          </td>


                          {/* LOCATION */}

                          <td>

                            {
                              transaction.location ||
                              "Unknown"
                            }

                          </td>


                          {/* DEVICE */}

                          <td>

                            {
                              transaction.deviceId ||
                              "Unknown"
                            }

                          </td>


                          {/* AI SCORE */}

                          <td>

                            <span className="ai-score">

                              {
                                transaction.fraudScore ??
                                0
                              }%

                            </span>

                          </td>


                          {/* FRAUD STATUS */}

                          <td>

                            <span
                              className={`fraud-status ${getFraudClass(
                                transaction.fraudStatus
                              )}`}
                            >

                              {
                                transaction.fraudStatus ||
                                "UNKNOWN"
                              }

                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`transaction-status ${getStatusClass(
                                transaction.status
                              )}`}
                            >

                              {
                                transaction.status
                              }

                            </span>

                          </td>


                          {/* DATE */}

                          <td>

                            {
                              formatDate(
                                transaction.transactionDate
                              )
                            }

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </section>

  );

}

export default Transactions;