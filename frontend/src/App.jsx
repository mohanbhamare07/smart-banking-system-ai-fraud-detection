import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import NewTransaction from "./pages/NewTransaction";
import FraudAlerts from "./pages/FraudAlerts";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* =====================================
            LOGIN
        ====================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route path="/register" element={<Register />} />

        {/* =====================================
            PROTECTED PAGES
        ====================================== */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <Layout>
                <Accounts />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Layout>
                <Transactions />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/new-transaction"
          element={
            <ProtectedRoute>
              <Layout>
                <NewTransaction />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/fraud-alerts"
          element={
            <ProtectedRoute>
              <Layout>
                <FraudAlerts />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />


        {/* =====================================
            DEFAULT
        ====================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =====================================
            UNKNOWN URL
        ====================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>

  );
}

export default App;