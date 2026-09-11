import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function NewTransaction() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    accountId: "",
    amount: "",
    transactionType: "TRANSFER",
    location: "",
    receiverAccountNumber: ""
  });

  const [account, setAccount] = useState(null);

  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transaction, setTransaction] = useState(null);


  // =========================================
  // LOAD LOGGED-IN USER ACCOUNT
  // =========================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem("loggedInUser");

    if (!storedUser) {

      navigate("/login");

      return;
    }

    try {

      const user = JSON.parse(storedUser);

      if (!user.id) {

        setError(
          "User information not found. Please login again."
        );

        setAccountLoading(false);

        return;
      }

      const userId = user.id;


      // =========================================
      // GET USER ACCOUNT
      // =========================================

      axios
        .get(
          `http://localhost:8080/api/accounts/user/${userId}`
        )
        .then((response) => {

          const accounts =
            response.data || [];

          if (accounts.length === 0) {

            setError(
              "No bank account found for this user."
            );

            setAccountLoading(false);

            return;
          }


          // Prefer ACTIVE account

          const activeAccount =
            accounts.find(
              (acc) =>
                acc.status === "ACTIVE"
            ) || accounts[0];


          setAccount(activeAccount);


          // Set account ID automatically

          setFormData((previousData) => ({
            ...previousData,
            accountId: activeAccount.id
          }));


          setAccountLoading(false);

        })
        .catch((err) => {

          console.error(
            "Error fetching account:",
            err
          );

          setError(
            "Unable to load your account information."
          );

          setAccountLoading(false);

        });

    } catch (err) {

      console.error(
        "Invalid logged-in user data:",
        err
      );

      localStorage.removeItem(
        "loggedInUser"
      );

      navigate("/login");

    }

  }, [navigate]);


  // =========================================
  // HANDLE INPUT CHANGE
  // =========================================

  const handleChange = (event) => {

    const { name, value } =
      event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value
    }));

  };


  // =========================================
  // SUBMIT TRANSACTION
  // =========================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setMessage("");
    setError("");
    setTransaction(null);


    // -----------------------------------------
    // CHECK ACCOUNT
    // -----------------------------------------

    if (!formData.accountId) {

      setError(
        "Bank account is not available."
      );

      return;
    }


    // -----------------------------------------
    // BASIC AMOUNT VALIDATION
    // -----------------------------------------

    if (
      !formData.amount ||
      Number(formData.amount) <= 0
    ) {

      setError(
        "Please enter a valid transaction amount."
      );

      return;
    }


    // -----------------------------------------
    // LOCATION VALIDATION
    // -----------------------------------------

    if (!formData.location.trim()) {

      setError(
        "Please enter transaction location."
      );

      return;
    }


    // -----------------------------------------
    // RECEIVER ACCOUNT VALIDATION
    // -----------------------------------------

    if (
      !formData.receiverAccountNumber.trim()
    ) {

      setError(
        "Please enter receiver account number."
      );

      return;
    }


    // -----------------------------------------
    // SAME ACCOUNT CHECK
    // -----------------------------------------

    if (
      account &&
      formData.receiverAccountNumber.trim()
        .toUpperCase() ===
        account.accountNumber.toUpperCase()
    ) {

      setError(
        "You cannot transfer money to your own account."
      );

      return;
    }


    try {

      setLoading(true);


      // =========================================
      // CREATE TRANSFER
      // =========================================

      const response = await axios.post(
        "http://localhost:8080/api/transactions",
        null,
        {
          params: {

            accountId:
              formData.accountId,

            amount:
              formData.amount,

            transactionType:
              formData.transactionType,

            location:
              formData.location,

            receiverAccountNumber:
              formData.receiverAccountNumber

          }
        }
      );


      // =========================================
      // SUCCESS
      // =========================================

      setTransaction(
        response.data
      );


      if (
        response.data.fraudStatus ===
        "FRAUD"
      ) {

        setMessage(
          "Transaction blocked because suspicious activity was detected."
        );

      } else {

        setMessage(
          "Money transferred successfully."
        );

      }


      // =========================================
      // RESET FORM
      // =========================================

      setFormData({

        accountId:
          account
            ? account.id
            : "",

        amount: "",

        transactionType:
          "TRANSFER",

        location: "",

        receiverAccountNumber: ""

      });


      // =========================================
      // REFRESH SENDER BALANCE
      // =========================================

      if (account) {

        try {

          const accountResponse =
            await axios.get(
              `http://localhost:8080/api/accounts/${account.id}`
            );

          setAccount(
            accountResponse.data
          );

        } catch (balanceError) {

          console.error(
            "Error refreshing account balance:",
            balanceError
          );

        }

      }


    } catch (err) {

      console.error(
        "Transaction error:",
        err
      );


      let errorMessage =
        "Unable to process transaction.";


      if (err.response?.data) {

        if (
          typeof err.response.data ===
          "string"
        ) {

          errorMessage =
            err.response.data;

        } else if (
          err.response.data.message
        ) {

          errorMessage =
            err.response.data.message;

        }

      }


      setError(
        errorMessage
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================
  // FORMAT AMOUNT
  // =========================================

  const formatAmount = (amount) => {

    if (
      amount === null ||
      amount === undefined
    ) {

      return "₹0.00";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
      }
    ).format(amount);

  };


  return (

    <section className="page-container">


      {/* =====================================
          PAGE HEADER
      ====================================== */}

      <div className="page-header">

        <div>

          <h1>
            New Transaction
          </h1>

          <p>
            Create a new banking transaction securely.
          </p>

        </div>

      </div>


      {/* =====================================
          MAIN TRANSACTION GRID
      ====================================== */}

      <div className="new-transaction-grid">


        {/* ===================================
            TRANSACTION FORM
        ==================================== */}

        <div className="dashboard-card transaction-form-card">

          <div className="card-header">

            <div>

              <h3>
                Transaction Details
              </h3>

              <p>
                Enter the transaction information
              </p>

            </div>

            <span className="card-icon">
              💳
            </span>

          </div>


          <form
            onSubmit={handleSubmit}
            className="transaction-form"
          >


            {/* ACCOUNT */}

            <div className="form-group">

              <label>
                Account
              </label>

              <select
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                disabled={accountLoading}
              >

                {accountLoading ? (

                  <option value="">
                    Loading account...
                  </option>

                ) : account ? (

                  <option
                    value={account.id}
                  >
                    {account.accountType} -{" "}
                    {account.accountNumber}
                  </option>

                ) : (

                  <option value="">
                    No account available
                  </option>

                )}

              </select>

            </div>


            {/* TRANSACTION TYPE */}

            <div className="form-group">

              <label>
                Transaction Type
              </label>

              <select
                name="transactionType"
                value={
                  formData.transactionType
                }
                onChange={handleChange}
              >

                <option value="TRANSFER">
                  Transfer
                </option>

              </select>

            </div>


            {/* AMOUNT */}

            <div className="form-group">

              <label>
                Amount
              </label>

              <div className="amount-input">

                <span>
                  ₹
                </span>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                />

              </div>

            </div>


            {/* LOCATION */}

            <div className="form-group">

              <label>
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Pune"
              />

            </div>


            {/* RECEIVER ACCOUNT NUMBER */}

            <div className="form-group">

              <label>
                To Account Number
              </label>

              <input
                type="text"
                name="receiverAccountNumber"
                value={
                  formData.receiverAccountNumber
                }
                onChange={handleChange}
                placeholder="Enter receiver account number"
              />

            </div>


            {/* ERROR */}

            {error && (

              <div className="transaction-form-error">

                <span>
                  ⚠️
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}


            {/* SUCCESS / MESSAGE */}

            {message && transaction && (

              <div
                className={
                  transaction.fraudStatus ===
                  "FRAUD"
                    ? "transaction-form-fraud"
                    : "transaction-form-success"
                }
              >

                <span>

                  {transaction.fraudStatus ===
                  "FRAUD"
                    ? "🚨"
                    : "✅"}

                </span>

                <p>
                  {message}
                </p>

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="submit-transaction-button"
              disabled={
                loading ||
                accountLoading ||
                !account
              }
            >

              {loading
                ? "Analyzing Transaction..."
                : "Submit Transaction"}

            </button>


          </form>

        </div>


        {/* ===================================
            AI SECURITY CARD
        ==================================== */}

        <div className="dashboard-card transaction-security-card">

          <div className="card-header">

            <div>

              <h3>
                AI Fraud Protection
              </h3>

              <p>
                Real-time transaction analysis
              </p>

            </div>

            <span className="card-icon">
              🛡️
            </span>

          </div>


          <div className="security-active-box">

            <div className="security-active-icon">
              🤖
            </div>

            <div>

              <strong>
                AI System Active
              </strong>

              <p>
                Your transaction will be analyzed
                before approval.
              </p>

            </div>

          </div>


          <div className="security-features">

            <div className="security-feature">

              <span>
                ✓
              </span>

              <p>
                Fraud score analysis
              </p>

            </div>


            <div className="security-feature">

              <span>
                ✓
              </span>

              <p>
                Suspicious activity detection
              </p>

            </div>


            <div className="security-feature">

              <span>
                ✓
              </span>

              <p>
                Automatic transaction blocking
              </p>

            </div>


            <div className="security-feature">

              <span>
                ✓
              </span>

              <p>
                Real-time fraud alerts
              </p>

            </div>

          </div>


          {/* RESULT */}

          {transaction && (

            <div className="transaction-result-box">

              <h4>
                Transaction Result
              </h4>


              <div className="result-row">

                <span>
                  Transaction ID
                </span>

                <strong>
                  {transaction.transactionId}
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Amount
                </span>

                <strong>
                  {formatAmount(
                    transaction.amount
                  )}
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Fraud Score
                </span>

                <strong
                  className={
                    transaction.fraudStatus ===
                    "FRAUD"
                      ? "result-fraud"
                      : "result-genuine"
                  }
                >
                  {transaction.fraudScore ?? 0}%
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Fraud Status
                </span>

                <strong
                  className={
                    transaction.fraudStatus ===
                    "FRAUD"
                      ? "result-fraud"
                      : "result-genuine"
                  }
                >
                  {transaction.fraudStatus}
                </strong>

              </div>


              <div className="result-row">

                <span>
                  Transaction Status
                </span>

                <strong
                  className={
                    transaction.status ===
                    "BLOCKED"
                      ? "result-fraud"
                      : "result-genuine"
                  }
                >
                  {transaction.status}
                </strong>

              </div>

            </div>

          )}

        </div>

      </div>

    </section>

  );

}

export default NewTransaction;