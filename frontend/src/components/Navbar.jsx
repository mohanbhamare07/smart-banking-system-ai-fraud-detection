import { useEffect, useState } from "react";

function Navbar() {

  const [user, setUser] = useState(null);

  // =========================================
  // LOAD CURRENT LOGGED-IN USER
  // =========================================

  useEffect(() => {

    const loggedInUser =
      localStorage.getItem("loggedInUser");

    if (loggedInUser) {

      try {

        const parsedUser =
          JSON.parse(loggedInUser);

        setUser(parsedUser);

      } catch (error) {

        console.error(
          "Error reading logged-in user:",
          error
        );

      }

    }

  }, []);


  // =========================================
  // USER NAME
  // =========================================

  const userName =
    user?.name || "User";


  return (

    <header className="navbar">

      <div className="navbar-left">

        <button className="menu-button">
          ☰
        </button>

        <div className="welcome-text">

          <h1>
            Welcome back, {userName}! 👋
          </h1>

          <p>
            Here's what's happening with your accounts today.
          </p>

        </div>

      </div>


      <div className="navbar-right">

        <button className="notification-button">

          🔔

          <span className="notification-count">
            5
          </span>

        </button>


        <div className="navbar-profile">

          <div className="profile-avatar">
            👤
          </div>


          <div className="profile-info">

            <strong>
              {userName}
            </strong>

            <span>
              Customer
            </span>

          </div>


          <span className="profile-arrow">
            ▼
          </span>

        </div>

      </div>

    </header>

  );

}

export default Navbar;