import { useState } from "react"
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
  Zap
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
}

export default function TopBar({ darkMode, onToggleDarkMode }: TopBarProps) {
  const { user, logout } = useAuthStore()
  const [searchFocused, setSearchFocused] = useState(false)
  const [notifications] = useState(3)

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95">
      {/* Left Section - Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl lg:ml-0 ml-12">
        <div className={cn(
          "relative w-full group transition-all duration-300",
          searchFocused && "scale-[1.02]"
        )}>
          <div className={cn(
            "absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-0 transition-opacity duration-300",
            searchFocused && "opacity-20"
          )} />
          <Search className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300",
            searchFocused 
              ? "text-blue-600 dark:text-blue-400 scale-110" 
              : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
          )} />
          <Input
            type="text"
            placeholder="Buscar..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "pl-11 pr-4 h-11 w-full border-2 transition-all duration-300 bg-gray-50 dark:bg-slate-800/50",
              searchFocused 
                ? "border-blue-500 shadow-lg bg-white dark:bg-slate-800" 
                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
            )}
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded hidden sm:block">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-1 lg:gap-2">
        {/* Quick Actions - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all duration-200 hidden sm:flex"
        >
          <Zap className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </Button>

        {/* Help - Hidden on mobile */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all duration-200 hidden md:flex"
        >
          <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200" />
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          onClick={onToggleDarkMode}
          variant="ghost"
          size="icon"
          className="relative group hover:bg-yellow-50 dark:hover:bg-yellow-950/30 transition-all duration-200"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500 group-hover:rotate-180 transition-all duration-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 group-hover:rotate-180 transition-all duration-500" />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg opacity-0 group-hover:opacity-10 transition-opacity duration-200" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative group hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200 group-hover:animate-pulse" />
          {notifications > 0 && (
            <>
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] border-2 border-white dark:border-slate-900 shadow-lg animate-pulse">
                {notifications}
              </Badge>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75" />
            </>
          )}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-3 h-11 px-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
              
              <div className="relative">
                <Avatar className="w-8 h-8 border-2 border-blue-500 group-hover:border-indigo-600 transition-all duration-300 group-hover:scale-110 shadow-md">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>

              <div className="text-left hidden lg:block">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.full_name || "Usuario"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "user@pos.com"}
                </p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-200 group-hover:translate-y-0.5 hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-blue-500">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                    {user?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email || "user@pos.com"}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-[10px] px-2 py-0">
                    Administrador
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem className="cursor-pointer py-2 group">
              <User className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2 group">
              <CreditCard className="w-4 h-4 mr-3 text-green-600 group-hover:scale-110 transition-transform duration-200" />
              <span>Suscripción</span>
            </DropdownMenuItem>

            <DropdownMenuItem className="cursor-pointer py-2 group">
              <Settings className="w-4 h-4 mr-3 text-gray-600 group-hover:scale-110 transition-transform duration-200" />
              <span>Configuración</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={logout}
              className="cursor-pointer py-2 group text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}