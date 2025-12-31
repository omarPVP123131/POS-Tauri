import { useState, useEffect } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import Sidebar from "../components/sidebar"
import TopBar from "../components/topbar"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode")
    if (savedDarkMode === "true") {
      setDarkMode(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Handle dark mode toggle
  const handleToggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem("darkMode", String(newDarkMode))
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Load sidebar state (only for desktop)
  useEffect(() => {
    if (!isMobile) {
      const savedSidebarState = localStorage.getItem("sidebarOpen")
      if (savedSidebarState !== null) {
        setSidebarOpen(savedSidebarState === "true")
      }
    }
  }, [isMobile])

  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    if (!isMobile) {
      localStorage.setItem("sidebarOpen", String(newState))
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={handleToggleSidebar}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar with Mobile Menu Button */}
        <div className="relative">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              onClick={handleToggleSidebar}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 lg:hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          <TopBar darkMode={darkMode} onToggleDarkMode={handleToggleDarkMode} />
        </div>

        {/* Main Content with smooth transitions */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-slate-950 scroll-smooth">
          <div className="animate-in fade-in duration-300">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}