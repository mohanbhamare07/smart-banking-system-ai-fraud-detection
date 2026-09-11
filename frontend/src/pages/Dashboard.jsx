import { useEffect, useState } from "react";
import axios from "axios";

import StatCard from "../components/StatCard";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    totalFraudTransactions: 0,
    totalGenuineTransactions: 0,
    totalApprovedTransactions: 0,
    totalBlockedTransactions: 0
  });

  const [transactions, setTransactions] = useState([]);

  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();


  // =========================================
  // LOAD DASHBOARD DATA
  // =========================================

  useEffect(() => {

    const loggedInUser =
      JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser || !loggedInUser.id) {

      console.error("Logged-in user not found.");

      navigate("/login", {
        replace: true
      });

      return;
    }

    const userId = loggedInUser.id;


    // =========================================
    // GET USER ACCOUNTS
    // =========================================

    axios
      .get(
        `http://localhost:8080/api/accounts/user/${userId}`
      )
      .then((response) => {

        const accounts = response.data || [];

        if (accounts.length === 0) {

          console.warn(
            "No bank account found for this user."
          );

          setAccount(null);
          setTransactions([]);

          setStatistics({
            totalTransactions: 0,
            totalFraudTransactions: 0,
            totalGenuineTransactions: 0,
            totalApprovedTransactions: 0,
            totalBlockedTransactions: 0
          });

          setLoading(false);

          return;
        }


        // =========================================
        // GET ACTIVE ACCOUNT
        // =========================================

        const activeAccount =
          accounts.find(
            (acc) => acc.status === "ACTIVE"
          ) || accounts[0];

        setAccount(activeAccount);

        const accountId = activeAccount.id;


        // =========================================
        // GET CURRENT USER TRANSACTIONS
        // =========================================

        return axios.get(
          `http://localhost:8080/api/transactions/account/${accountId}`
        );

      })
      .then((transactionResponse) => {

        if (!transactionResponse) {
          return;
        }

        const data =
          transactionResponse.data || [];


        // =========================================
        // SET RECENT TRANSACTIONS
        // =========================================

        const latestTransactions = [...data]
          .reverse()
          .slice(0, 5);

        setTransactions(latestTransactions);


        // =========================================
        // CALCULATE USER STATISTICS
        // =========================================

        const totalTransactions = data.length;

        const totalFraudTransactions =
          data.filter(
            (transaction) =>
              transaction.fraudStatus === "FRAUD"
          ).length;

        const totalGenuineTransactions =
          data.filter(
            (transaction) =>
              transaction.fraudStatus === "GENUINE"
          ).length;

        const totalApprovedTransactions =
          data.filter(
            (transaction) =>
              transaction.status === "APPROVED"
          ).length;

        const totalBlockedTransactions =
          data.filter(
            (transaction) =>
              transaction.status === "BLOCKED"
          ).length;


        // =========================================
        // UPDATE DASHBOARD STATISTICS
        // =========================================

        setStatistics({

          totalTransactions,

          totalFraudTransactions,

          totalGenuineTransactions,

          totalApprovedTransactions,

          totalBlockedTransactions

        });

      })
      .catch((error) => {

        console.error(
          "Error fetching dashboard data:",
          error
        );

      })
      .finally(() => {

        setLoading(false);

      });

  }, [navigate]);


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
  // TRANSACTION STATUS
  // =========================================

  const getStatusClass = (status) => {

    if (status === "APPROVED") {
      return "transaction-approved";
    }

    if (status === "BLOCKED") {
      return "transaction-blocked";
    }

    return "transaction-pending";

  };


  return (

    <section className="dashboard-content">


      {/* =====================================
          PAGE HEADING
      ====================================== */}

      <div className="page-heading">

        <div>

          <h2>
            Dashboard
          </h2>

          <p>
            Monitor your banking activity and
            account security.
          </p>

        </div>


        <div className="security-status">

          <span className="status-dot"></span>

          AI Protection Active

        </div>

      </div>


      {/* =====================================
          STATISTICS
      ====================================== */}

      <div className="stats-grid">


        <StatCard
          title="Total Transactions"
          value={statistics.totalTransactions}
          description="All transactions"
          icon="💳"
          type="total"
        />


        <StatCard
          title="Genuine Transactions"
          value={statistics.totalGenuineTransactions}
          description="Safe transactions"
          icon="🛡️"
          type="genuine"
        />


        <StatCard
          title="Fraud Transactions"
          value={statistics.totalFraudTransactions}
          description="Detected by AI"
          icon="🚨"
          type="fraud"
        />


        <StatCard
          title="Approved Transactions"
          value={statistics.totalApprovedTransactions}
          description="Successfully approved"
          icon="✓"
          type="approved"
        />


        <StatCard
          title="Blocked Transactions"
          value={statistics.totalBlockedTransactions}
          description="Blocked by security"
          icon="🔒"
          type="blocked"
        />

      </div>


      {/* =====================================
          ACCOUNT + AI SECURITY
      ====================================== */}

      <div className="dashboard-grid">


        {/* ACCOUNT BALANCE */}

        <div className="dashboard-card balance-card">

          <div className="card-header">

            <div>

              <h3>
                Account Balance
              </h3>

              <p>
                Available balance
              </p>

            </div>

            <span className="card-icon">
              💰
            </span>

          </div>


          <h2>

            {loading
              ? "Loading..."
              : account
                ? formatAmount(account.balance)
                : "No Account"}

          </h2>


          <p className="account-number">

            Account{" "}
            ••••{" "}

            {account?.accountNumber
              ? account.accountNumber.slice(-4)
              : "0000"}

          </p>

        </div>


        {/* AI SECURITY */}

        <div className="dashboard-card ai-card">

          <div className="card-header">

            <div>

              <h3>
                AI Fraud Detection
              </h3>

              <p>
                Real-time transaction protection
              </p>

            </div>

            <span className="card-icon">
              🤖
            </span>

          </div>


          <div className="ai-status">

            <span className="status-dot"></span>

            <strong>
              System Active
            </strong>

          </div>


          <p>
            Every transaction is analyzed by the
            AI fraud detection system.
          </p>

        </div>

      </div>


      {/* =====================================
          RECENT TRANSACTIONS
      ====================================== */}

      <div className="dashboard-card recent-card">


        <div className="card-header">

          <div>

            <h3>
              Recent Transactions
            </h3>

            <p>
              Your latest banking activity
            </p>

          </div>


          <button
            className="view-all-button"
            onClick={() => navigate("/transactions")}
          >
            View All
          </button>

        </div>


        {/* TRANSACTION LIST */}

        <div className="transaction-list">

          {transactions.length === 0 ? (

            <div className="empty-activity">

              <span>
                💳
              </span>

              <h4>
                No Transactions
              </h4>

              <p>
                Your recent transactions will
                appear here.
              </p>

            </div>

          ) : (

            transactions.map((transaction) => (

              <div
                className="transaction-row"
                key={transaction.id}
              >


                {/* ICON */}

                <div className="transaction-icon">

                  {transaction.fraudStatus === "FRAUD"
                    ? "🚨"
                    : "💳"}

                </div>


                {/* DETAILS */}

                <div className="transaction-details">

                  <strong>
                    {transaction.transactionType}
                  </strong>

                  <span>
                    {transaction.transactionId}
                  </span>

                </div>


                {/* LOCATION */}

                <div className="transaction-location">

                  <strong>
                    {transaction.location || "Unknown"}
                  </strong>

                  <span>
                    {transaction.deviceId || "Unknown device"}
                  </span>

                </div>


                {/* AMOUNT */}

                <div className="transaction-amount">

                  <strong>
                    {formatAmount(transaction.amount)}
                  </strong>

                </div>


                {/* STATUS */}

                <div>

                  <span
                    className={`transaction-status ${getStatusClass(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>

                </div>


              </div>

            ))

          )}

        </div>

      </div>


    </section>

  );
}

export default Dashboard;