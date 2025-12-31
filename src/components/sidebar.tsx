import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  TruckIcon, 
  Package, 
  ShoppingCart,
  Store,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuthStore } from "../store/auth"
import { cn } from "@/lib/utils"

const navigation = [
  { 
    name: "Administración", 
    icon: LayoutDashboard, 
    path: "/", 
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    iconBg: "from-violet-500 to-fuchsia-600",
    description: "Panel de control y estadísticas"
  },
  { 
    name: "Punto de Venta", 
    icon: ShoppingBag, 
    path: "/pdv", 
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    iconBg: "from-emerald-500 to-teal-600",
    description: "Sistema de ventas rápidas"
  },
  { 
    name: "Clientes", 
    icon: Users, 
    path: "/customers", 
    gradient: "from-blue-500 via-cyan-500 to-sky-500",
    iconBg: "from-blue-500 to-sky-600",
    description: "Gestión de clientes"
  },
  { 
    name: "Proveedores", 
    icon: TruckIcon, 
    path: "/suppliers", 
    gradient: "from-orange-500 via-amber-500 to-yellow-500",
    iconBg: "from-orange-500 to-yellow-600",
    description: "Gestión de proveedores"
  },
  { 
    name: "Inventario", 
    icon: Package, 
    path: "/inventory", 
    gradient: "from-pink-500 via-rose-500 to-red-500",
    iconBg: "from-pink-500 to-red-600",
    description: "Control de stock y productos"
  },
  { 
    name: "Compras", 
    icon: ShoppingCart, 
    path: "/purchases", 
    gradient: "from-indigo-500 via-blue-500 to-purple-500",
    iconBg: "from-indigo-500 to-purple-600",
    description: "Órdenes y pedidos"
  },
]

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
  isMobile?: boolean
}

export default function Sidebar({ isOpen, onToggle, isMobile = false }: SidebarProps) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-black flex flex-col z-50 transition-all duration-300 ease-out shadow-2xl",
          isMobile 
            ? isOpen 
              ? "translate-x-0 w-72" 
              : "-translate-x-full w-72"
            : isOpen 
              ? "w-72" 
              : "w-20",
          "border-r border-slate-700/50 dark:border-slate-800/50"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))] pointer-events-none" />

        {/* Header */}
        <div className="relative h-20 flex items-center justify-between px-5 border-b border-slate-700/50 dark:border-slate-800/50 backdrop-blur-sm flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            !isOpen && !isMobile && "justify-center w-full"
          )}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-all duration-300 animate-pulse" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-white/20 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
            </div>
            
            {(isOpen || isMobile) && (
              <div className="animate-in slide-in-from-left duration-300">
                <h1 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                  POS Desktop
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-xs text-slate-400 font-medium">Sistema Profesional</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation - Sin scrollbar visible */}
        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto overflow-x-hidden",
          // Ocultar scrollbar en todos los navegadores
          "[&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0",
          "[scrollbar-width:none] [-ms-overflow-style:none]",
          isOpen || isMobile ? "p-4" : "py-4 px-2"
        )}>
          {navigation.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            const isHovered = hoveredItem === item.path
            
            return (
              <Link key={item.path} to={item.path} onClick={isMobile ? onToggle : undefined}>
                <div
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "relative group rounded-2xl transition-all duration-300 animate-in slide-in-from-left",
                    isActive 
                      ? "bg-gradient-to-r from-white/10 to-white/5 shadow-2xl scale-105" 
                      : "hover:bg-white/5",
                    // Centrado perfecto en modo colapsado
                    !isOpen && !isMobile && "mx-auto"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Active indicator line */}
                  {isActive && (isOpen || isMobile) && (
                    <div className={cn(
                      "absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-r-full bg-gradient-to-b animate-in slide-in-from-left duration-300",
                      item.gradient
                    )} />
                  )}

                  {/* Hover glow effect */}
                  {(isActive || isHovered) && (
                    <div className={cn(
                      "absolute inset-0 rounded-2xl blur-2xl opacity-20 transition-opacity duration-500 bg-gradient-to-r",
                      item.gradient
                    )} />
                  )}

                  <div className={cn(
                    "relative flex items-center cursor-pointer",
                    isOpen || isMobile 
                      ? "gap-4 p-4" 
                      : "justify-center p-3"
                  )}>
                    {/* Icon with gradient background - Tamaño fijo en modo colapsado */}
                    <div className={cn(
                      "relative flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 flex-shrink-0",
                      isOpen || isMobile 
                        ? "w-12 h-12" 
                        : "w-11 h-11",
                      isActive 
                        ? `bg-gradient-to-br ${item.iconBg} ring-2 ring-white/20 scale-110` 
                        : "bg-slate-800/50 group-hover:bg-slate-700/50",
                      (isHovered || isActive) && "shadow-2xl"
                    )}>
                      {isActive && (
                        <div className={cn(
                          "absolute inset-0 rounded-xl blur-lg opacity-50 bg-gradient-to-br",
                          item.iconBg
                        )} />
                      )}
                      <Icon className={cn(
                        "relative z-10 transition-all duration-300",
                        isOpen || isMobile ? "w-6 h-6" : "w-5 h-5",
                        isActive 
                          ? "text-white drop-shadow-lg" 
                          : "text-slate-400 group-hover:text-white group-hover:scale-110"
                      )} />
                    </div>

                    {/* Label and description */}
                    {(isOpen || isMobile) && (
                      <div className="flex-1 min-w-0 animate-in slide-in-from-left duration-300">
                        <p className={cn(
                          "text-sm font-bold transition-colors duration-200 truncate",
                          isActive 
                            ? "text-white" 
                            : "text-slate-300 group-hover:text-white"
                        )}>
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Arrow indicator */}
                    {(isOpen || isMobile) && isActive && (
                      <ChevronRight className="w-5 h-5 text-white animate-pulse flex-shrink-0" />
                    )}

                    {/* Badge for collapsed state */}
                    {!isOpen && !isMobile && isActive && (
                      <div className={cn(
                        "absolute -right-1 -top-1 w-3 h-3 rounded-full border-2 border-slate-900 bg-gradient-to-br animate-pulse",
                        item.iconBg
                      )} />
                    )}
                  </div>

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobile && (
                    <div className="absolute left-full ml-6 px-4 py-3 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl backdrop-blur-sm">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-slate-400 mt-1">{item.description}</div>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        {(isOpen || isMobile) && (
          <div className="relative px-4 pb-4 space-y-2 border-t border-slate-700/50 pt-4 backdrop-blur-sm flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 gap-3"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Configuración</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5 gap-3"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Ayuda</span>
            </Button>
          </div>
        )}

        {/* User Profile */}
        <div className="relative p-4 border-t border-slate-700/50 backdrop-blur-sm flex-shrink-0">
          {(isOpen || isMobile) ? (
            <div className="space-y-3 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl backdrop-blur-sm ring-1 ring-white/10">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11 ring-2 ring-purple-500/50 shadow-lg">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || "user@pos.com"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={logout}
                variant="ghost" 
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 gap-2 justify-start font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="relative group cursor-pointer">
                <Avatar className="w-12 h-12 ring-2 ring-purple-500/50 shadow-lg hover:scale-110 transition-transform duration-300">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-slate-900 rounded-full" />
                
                {/* Tooltip para usuario en modo colapsado */}
                <div className="absolute left-full ml-6 px-4 py-3 bg-slate-800 border border-slate-700 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl backdrop-blur-sm bottom-0">
                  <div className="font-bold">{user?.full_name || "Usuario"}</div>
                  <div className="text-xs text-slate-400 mt-1">{user?.email || "user@pos.com"}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop toggle button */}
        {!isMobile && (
          <button
            title={isOpen ? "Colapsar" : "Expandir"}
            onClick={onToggle}
            className="absolute -right-4 top-24 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-300 ring-4 ring-slate-900 z-50"
          >
            <ChevronRight className={cn(
              "w-4 h-4 text-white transition-transform duration-300",
              isOpen && "rotate-180"
            )} />
          </button>
        )}
      </aside>
    </>
  )
}