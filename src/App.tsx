import { lazy, Suspense } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "./store/auth"

// 🔥 Eager loading para componentes críticos (primera carga)
import LoginPage from "./pages/LoginPage"
import DashboardLayout from "./layouts/DashboardLayout"

// 🚀 Lazy loading para páginas (code splitting automático)
const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const SalesPage = lazy(() => import("./pages/SalesPage"))
const CashRegisterPage = lazy(() => import("./pages/CashRegisterPage"))
const InventoryPage = lazy(() => import("./pages/InventoryPage"))
const ReportsPage = lazy(() => import("./pages/ReportsPage"))
const CustomersPage = lazy(() => import("./pages/CustomersPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))
const NotFoundPage = lazy(() => import("./components/not_found_page"))

// ⚡ Componente de carga optimizado y elegante
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
    <div className="flex flex-col items-center gap-4">
      {/* Spinner con doble anillo */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-accent/30 border-b-transparent rounded-full animate-spin" 
             style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
      </div>
      
      {/* Texto con animación */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-muted-foreground">Cargando</p>
        <div className="flex gap-1">
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" />
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <span className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  </div>
)

function App() {
  // 🎯 Selector específico - Solo re-render cuando cambia isAuthenticated
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Router>
      <Routes>
        {/* Ruta pública - Sin lazy loading para primera carga rápida */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rutas protegidas - Con lazy loading para reducir bundle inicial */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <DashboardLayout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Dashboard como ruta principal */}
                    <Route path="/" element={<DashboardPage />} />
                    
                    {/* Rutas de funcionalidad principal */}
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/cash-register" element={<CashRegisterPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* 404 - Debe ir al final para capturar rutas no encontradas */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
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