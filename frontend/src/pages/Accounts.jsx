import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Accounts() {

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // =========================================
  // LOAD LOGGED-IN USER ACCOUNT
  // =========================================

  useEffect(() => {

    const storedUser = localStorage.getItem("loggedInUser");

    // User login nahi hai
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {

      const user = JSON.parse(storedUser);

      // User ID check
      if (!user.id) {

        setError("User information not found. Please login again.");
        setLoading(false);
        return;

      }

      const userId = user.id;

      // =========================================
      // GET LOGGED-IN USER ACCOUNTS
      // =========================================

      axios
        .get(`http://localhost:8080/api/accounts/user/${userId}`)
        .then((response) => {

          const accounts = response.data;

          if (!accounts || accounts.length === 0) {

            setError("No bank account found for this user.");
            setLoading(false);
            return;

          }

          // Prefer ACTIVE account
          const activeAccount =
            accounts.find(
              (acc) => acc.status === "ACTIVE"
            ) || accounts[0];

          setAccount(activeAccount);
          setLoading(false);

        })
        .catch((error) => {

          console.error(
            "Error fetching account:",
            error
          );

          setError(
            "Unable to load account information."
          );

          setLoading(false);

        });

    } catch (error) {

      console.error(
        "Invalid logged-in user data:",
        error
      );

      localStorage.removeItem("loggedInUser");

      navigate("/login");

    }

  }, [navigate]);


  // =========================================
  // FORMAT BALANCE
  // =========================================

  const formatAmount = (amount) => {

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2
    }).format(amount || 0);

  };


  return (

    <section className="dashboard-content">

      {/* =====================================
          PAGE HEADING
      ====================================== */}

      <div className="page-heading">

        <div>

          <h2>
            My Accounts
          </h2>

          <p>
            View your account details and balance.
          </p>

        </div>

      </div>


      {/* =====================================
          LOADING
      ====================================== */}

      {loading && (

        <div className="dashboard-card">

          <p>
            Loading account information...
          </p>

        </div>

      )}


      {/* =====================================
          ERROR
      ====================================== */}

      {!loading && error && (

        <div className="dashboard-card">

          <p>
            {error}
          </p>

        </div>

      )}


      {/* =====================================
          ACCOUNT
      ====================================== */}

      {!loading && !error && account && (

        <div className="account-page-grid">


          {/* =================================
              MAIN ACCOUNT CARD
          ================================= */}

          <div className="account-main-card">

            <div className="account-card-top">

              <div className="account-bank-icon">
                🏦
              </div>

              <span className="account-active">
                ● {account.status}
              </span>

            </div>


            <div className="account-type">

              <p>
                {account.accountType}
              </p>

              <h2>
                {formatAmount(account.balance)}
              </h2>

              <span>
                Available Balance
              </span>

            </div>


            <div className="account-number-box">

              <span>
                Account Number
              </span>

              <strong>
                {account.accountNumber}
              </strong>

            </div>

          </div>


          {/* =================================
              ACCOUNT DETAILS
          ================================= */}

          <div className="dashboard-card account-details-card">

            <div className="card-header">

              <div>

                <h3>
                  Account Details
                </h3>

                <p>
                  Your account information
                </p>

              </div>

              <span className="card-icon">
                📋
              </span>

            </div>


            <div className="account-detail-row">

              <span>
                Account Type
              </span>

              <strong>
                {account.accountType}
              </strong>

            </div>


            <div className="account-detail-row">

              <span>
                Account Number
              </span>

              <strong>
                {account.accountNumber}
              </strong>

            </div>


            <div className="account-detail-row">

              <span>
                Current Balance
              </span>

              <strong>
                {formatAmount(account.balance)}
              </strong>

            </div>


            <div className="account-detail-row">

              <span>
                Account Status
              </span>

              <strong className="account-status-text">
                {account.status}
              </strong>

            </div>

          </div>


        </div>

      )}

    </section>

  );

}

export default Accounts;