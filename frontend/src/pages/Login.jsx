import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  // =========================================
  // LOGIN
  // =========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {

      setError("Please enter email and password.");

      return;
    }

    try {

      setLoading(true);

      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        formData
      );

      console.log("Login response:", response.data);

      // =====================================
      // SAVE LOGGED-IN USER
      // =====================================

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(response.data)
      );

      // Remove old token if any
      localStorage.removeItem("token");

      // =====================================
      // GO TO DASHBOARD
      // =====================================

      navigate("/dashboard", {
        replace: true
      });

    } catch (err) {

      console.error("Login error:", err);

      if (typeof err.response?.data === "string") {

        setError(err.response.data);

      } else if (err.response?.data?.message) {

        setError(err.response.data.message);

      } else {

        setError(
          "Invalid email or password. Please check your details."
        );
      }

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="login-page">

      <div className="login-card">

        {/* LOGO */}

        <div className="login-logo">
          🏦
        </div>


        <h1>
          Smart Banking
        </h1>

        <p className="login-subtitle">
          AI Powered Secure Banking
        </p>


        {/* HEADING */}

        <div className="login-heading">

          <h2>
            Welcome Back 👋
          </h2>

          <p>
            Sign in to access your account
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div className="login-error">

            ⚠️ {error}

          </div>

        )}


        {/* LOGIN FORM */}

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}

          <div className="login-form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

          </div>


          {/* PASSWORD */}

          <div className="login-form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >

            {loading
              ? "Signing in..."
              : "🔐 Sign In"}

          </button>

        </form>


        {/* =========================================
            REGISTER OPTION
        ========================================= */}

        <div className="register-login-link">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Register
          </Link>

        </div>


        {/* SECURITY */}

        <div className="login-security">

          <span>
            🛡️
          </span>

          <div>

            <strong>
              AI Security Enabled
            </strong>

            <p>
              Your transactions are protected by
              AI-powered fraud detection.
            </p>

          </div>

        </div>

      </div>

    </div>

  );
}

export default Login;