import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">🏦</div>

        <div>
          <h2>Smart Banking</h2>
          <span>AI Powered Security</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-menu">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>🏠</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/accounts"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>🏦</span>
          <span>Accounts</span>
        </NavLink>

        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>💳</span>
          <span>Transactions</span>
        </NavLink>

        <NavLink
          to="/new-transaction"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>➕</span>
          <span>New Transaction</span>
        </NavLink>

        <NavLink
          to="/fraud-alerts"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>🚨</span>
          <span>Fraud Alerts</span>

          <span className="alert-count">3</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "menu-item active" : "menu-item"
          }
        >
          <span>👤</span>
          <span>Profile</span>
        </NavLink>

      </nav>

      {/* AI Protection */}
      <div className="ai-protection">

        <div className="ai-icon">
          🛡️
        </div>

        <div>
          <h4>AI Protection</h4>

          <p>
            <span className="status-dot"></span>
            Active
          </p>

          <small>
            Your account is protected by
            AI fraud detection
          </small>
        </div>

      </div>

      {/* Logout */}
      <div className="sidebar-bottom">

        <button
          type="button"
          className="menu-item logout"
          onClick={() => {

            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("token");

            sessionStorage.clear();

            window.location.href = "/login";

          }}
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;