import { useState, useEffect } from "react"
import { 
  Search, 
  Bell, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings,
  ChevronDown,
  HelpCircle,
  CreditCard,
  Zap,
  Menu
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "../store/auth"
import { cn } from "@/lib/utils"

interface TopBarProps {
  darkMode: boolean
  onToggleDarkMode: () => void
  onToggleSidebar?: () => void
}

export default function TopBar({ darkMode, onToggleDarkMode, onToggleSidebar }: TopBarProps) {
  const { user, logout } = useAuthStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications] = useState(3)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Actualizar hora cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-md bg-card/95 shadow-sm">
      {/* Left Section - Menu Mobile + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-2xl">
        {/* Mobile Menu Button */}
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Search Bar */}
        <div className={cn(
          "relative w-full group transition-all duration-300",
          searchFocused && "scale-[1.01]"
        )}>
          {/* Glow effect */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/50 to-accent/50 rounded-lg blur-md opacity-0 transition-opacity duration-300 -z-10",
            searchFocused && "opacity-30"
          )} />
          
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-all duration-300 pointer-events-none",
            searchFocused 
              ? "text-primary scale-110" 
              : "text-muted-foreground group-hover:text-foreground"
          )} />
          
          <Input
            type="text"
            placeholder="Buscar productos, clientes, ventas..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "pl-10 pr-16 h-10 w-full border transition-all duration-300 bg-background/50",
              searchFocused 
                ? "border-primary shadow-md bg-background ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50 hover:bg-background"
            )}
          />
          
          {/* Keyboard shortcut */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1">
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded">
              Ctrl
            </kbd>
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1 lg:gap-1.5">
        {/* Time Display - Hidden on mobile */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 mr-2">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-foreground">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Quick Action */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-primary/10 transition-all duration-200 hidden md:flex"
          title="Acciones rápidas"
        >
          <Zap className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
          <div className="absolute inset-0 bg-primary/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Button>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-accent transition-all duration-200 hidden lg:flex"
          title="Centro de ayuda"
        >
          <HelpCircle className="w-4 h-4 text-muted-foreground group-hover:text-accent-foreground transition-colors duration-200" />
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          onClick={onToggleDarkMode}
          variant="ghost"
          size="icon"
          className="relative group hover:bg-accent transition-all duration-200"
          title={darkMode ? "Modo claro" : "Modo oscuro"}
        >
          <div className="relative">
            {darkMode ? (
              <Sun className="w-4 h-4 text-yellow-500 group-hover:rotate-90 transition-all duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:-rotate-12 transition-all duration-300" />
            )}
          </div>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-accent transition-all duration-200"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
          {notifications > 0 && (
            <div className="absolute top-1 right-1">
              <Badge className="w-4 h-4 flex items-center justify-center p-0 bg-destructive text-destructive-foreground text-[9px] font-bold border-2 border-card animate-pulse">
                {notifications > 9 ? '9+' : notifications}
              </Badge>
            </div>
          )}
        </Button>

        {/* Divider */}
        <div className="w-px h-6 bg-border mx-1 hidden sm:block" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-10 px-2 lg:px-3 hover:bg-accent transition-all duration-200 group relative"
            >
              <div className="relative">
                <Avatar className="w-8 h-8 border-2 border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-sm">
                  <AvatarImage src="https://github.com/shadcn.png" alt={user?.full_name} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
              </div>

              <div className="text-left hidden lg:block min-w-0">
                <p className="text-sm font-semibold text-foreground truncate max-w-[120px]">
                  {user?.full_name || "Usuario"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  Administrador
                </p>
              </div>

              <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-hover:translate-y-0.5 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-72 p-2">
            {/* User Info Header */}
            <DropdownMenuLabel className="pb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-primary shadow-md">
                    <AvatarImage src="https://github.com/shadcn.png" alt={user?.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                      {user?.full_name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-card rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || "user@pos.com"}
                  </p>
                  <Badge variant="secondary" className="mt-1.5 text-[10px] px-2 py-0.5 font-medium">
                    👑 Administrador
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Menu Items */}
            <DropdownMenuItem className="cursor-pointer py-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 mr-3 group-hover:bg-primary/20 transition-colors">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Mi Perfil</p>
                <p className="text-xs text-muted-foreground">Ver y editar perfil</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/10 mr-3 group-hover:bg-green-500/20 transition-colors">
                <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Suscripción</p>
                <p className="text-xs text-muted-foreground">Plan Pro • Activo</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/50 mr-3 group-hover:bg-accent transition-colors">
                <Settings className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">Configuración</p>
                <p className="text-xs text-muted-foreground">Preferencias del sistema</p>
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-2" />

            {/* Logout */}
            <DropdownMenuItem 
              onClick={logout}
              className="cursor-pointer py-2.5 group text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/10 mr-3 group-hover:bg-destructive/20 transition-colors">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Cerrar Sesión</p>
                <p className="text-xs opacity-80">Hasta pronto 👋</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}