import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/auth"
import LoginPage from "./pages/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import SalesPage from "./pages/SalesPage"
import CashRegisterPage from "./pages/CashRegisterPage"
import InventoryPage from "./pages/InventoryPage"
import ReportsPage from "./pages/ReportsPage"
import CustomersPage from "./pages/CustomersPage"
import SettingsPage from "./pages/SettingsPage"

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/cash-register" element={<CashRegisterPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
