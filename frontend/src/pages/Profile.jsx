import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =========================================
  // LOAD LOGGED-IN USER PROFILE
  // =========================================

  useEffect(() => {

    fetchProfile();

  }, []);


  const fetchProfile = async () => {

    try {

      setLoading(true);
      setError("");


      // =========================================
      // GET LOGGED-IN USER FROM LOCAL STORAGE
      // =========================================

      const storedUser =
        localStorage.getItem("loggedInUser");


      if (!storedUser) {

        navigate("/login");

        return;

      }


      const loggedInUser =
        JSON.parse(storedUser);


      if (!loggedInUser.id) {

        setError(
          "User information not found. Please login again."
        );

        setLoading(false);

        return;

      }


      const userId = loggedInUser.id;


      // =========================================
      // GET USER INFORMATION
      // =========================================

      const userResponse = await axios.get(
        `http://localhost:8080/api/users/${userId}`
      );


      setUser(userResponse.data);


      // =========================================
      // GET USER ACCOUNTS
      // =========================================

      const accountResponse = await axios.get(
        `http://localhost:8080/api/accounts/user/${userId}`
      );


      const accounts = accountResponse.data;


      if (accounts && accounts.length > 0) {

        // Prefer ACTIVE account
        const activeAccount =
          accounts.find(
            (acc) => acc.status === "ACTIVE"
          ) || accounts[0];


        setAccount(activeAccount);

      } else {

        setAccount(null);

      }


    } catch (err) {

      console.error(
        "Profile error:",
        err
      );


      // =========================================
      // IF USER NOT FOUND
      // =========================================

      if (err.response?.status === 404) {

        setError(
          "User profile could not be found."
        );

      } else {

        setError(
          "Unable to load profile information. Please make sure Spring Boot is running."
        );

      }

    } finally {

      setLoading(false);

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
  // LOADING
  // =========================================

  if (loading) {

    return (

      <div className="page-container">

        <div className="profile-message">

          <div className="loading-spinner"></div>

          <p>
            Loading profile...
          </p>

        </div>

      </div>

    );

  }


  // =========================================
  // ERROR
  // =========================================

  if (error) {

    return (

      <div className="page-container">

        <div className="profile-message error-message">

          <div className="message-icon">
            ⚠️
          </div>

          <p>
            {error}
          </p>


          <button
            onClick={fetchProfile}
            className="retry-button"
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  // =========================================
  // PROFILE PAGE
  // =========================================

  return (

    <div className="page-container">


      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal and banking information.
          </p>

        </div>


        <button
          className="refresh-button"
          onClick={fetchProfile}
        >
          🔄 Refresh
        </button>

      </div>


      {/* =====================================
          PROFILE HEADER CARD
      ====================================== */}

      <div className="profile-header-card">

        <div className="profile-large-avatar">
          👤
        </div>


        <div className="profile-header-info">

          <h2>
            {user?.name || "User"}
          </h2>


          <p>
            {user?.email || "Email not available"}
          </p>


          <span className="customer-badge">
            Customer
          </span>

        </div>


        <div className="profile-security-status">

          <span className="status-dot"></span>

          {account?.status === "ACTIVE"
            ? "Account Active"
            : "Account Inactive"}

        </div>

      </div>


      {/* =====================================
          PROFILE GRID
      ====================================== */}

      <div className="profile-grid">


        {/* ===================================
            PERSONAL INFORMATION
        ==================================== */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              👤
            </div>


            <div>

              <h3>
                Personal Information
              </h3>

              <p>
                Your registered personal details.
              </p>

            </div>

          </div>


          <div className="profile-details">


            <div className="profile-detail-row">

              <span>
                Full Name
              </span>

              <strong>
                {user?.name || "N/A"}
              </strong>

            </div>


            <div className="profile-detail-row">

              <span>
                Email Address
              </span>

              <strong>
                {user?.email || "N/A"}
              </strong>

            </div>


            <div className="profile-detail-row">

              <span>
                Phone Number
              </span>

              <strong>
                {user?.phone || "N/A"}
              </strong>

            </div>


            <div className="profile-detail-row">

              <span>
                Customer ID
              </span>

              <strong>
                #{user?.id || "N/A"}
              </strong>

            </div>


          </div>

        </div>


        {/* ===================================
            ACCOUNT INFORMATION
        ==================================== */}

        <div className="profile-card">

          <div className="profile-card-header">

            <div className="profile-card-icon">
              🏦
            </div>


            <div>

              <h3>
                Account Information
              </h3>

              <p>
                Your banking account details.
              </p>

            </div>

          </div>


          <div className="profile-details">


            <div className="profile-detail-row">

              <span>
                Account Number
              </span>

              <strong>
                {account?.accountNumber || "N/A"}
              </strong>

            </div>


            <div className="profile-detail-row">

              <span>
                Account Type
              </span>

              <strong>
                {account?.accountType || "N/A"}
              </strong>

            </div>


            <div className="profile-detail-row">

              <span>
                Account Status
              </span>


              <span className="account-active-badge">

                {account?.status || "N/A"}

              </span>

            </div>


            <div className="profile-detail-row balance-row">

              <span>
                Available Balance
              </span>


              <strong className="profile-balance">

                {formatAmount(
                  account?.balance
                )}

              </strong>

            </div>


          </div>

        </div>

      </div>


      {/* =====================================
          SECURITY CARD
      ====================================== */}

      <div className="profile-security-card">

        <div className="security-card-icon">
          🛡️
        </div>


        <div className="security-card-content">

          <h3>
            AI Fraud Protection
          </h3>


          <p>
            Your transactions are continuously monitored
            by our AI-powered fraud detection system.
          </p>


          <div className="security-features">

            <span>
              ✓ Real-time monitoring
            </span>

            <span>
              ✓ AI fraud detection
            </span>

            <span>
              ✓ Suspicious transaction alerts
            </span>

          </div>

        </div>


        <div className="security-active">

          <span className="status-dot"></span>

          Protected

        </div>

      </div>


    </div>

  );

}

export default Profile;