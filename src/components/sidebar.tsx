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
  X,
  Sparkles,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  ChevronsLeft,
  ChevronsRight
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
          "fixed lg:relative h-screen flex flex-col z-50 transition-all duration-300 ease-out shadow-2xl",
          // Usar las variables CSS del tema
          "bg-sidebar-background border-r border-sidebar-border",
          isMobile 
            ? isOpen 
              ? "translate-x-0 w-72" 
              : "-translate-x-full w-72"
            : isOpen 
              ? "w-72" 
              : "w-20"
        )}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.05),rgba(255,255,255,0))] pointer-events-none dark:opacity-50" />

        {/* Header */}
        <div className="relative h-20 flex items-center justify-between px-5 border-b border-sidebar-border backdrop-blur-sm flex-shrink-0">
          <div className={cn(
            "flex items-center gap-3 transition-all duration-300",
            !isOpen && !isMobile && "justify-center w-full"
          )}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-all duration-300 animate-pulse" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Store className="w-7 h-7 text-primary-foreground drop-shadow-lg" />
              </div>
            </div>
            
            {(isOpen || isMobile) && (
              <div className="animate-in slide-in-from-left duration-300">
                <h1 className="text-xl font-black text-sidebar-foreground flex items-center gap-2 tracking-tight">
                  POS Desktop
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                </h1>
                <p className="text-xs text-sidebar-muted-foreground font-medium">Sistema Profesional</p>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Navigation - Con scrollbar del tema */}
        <nav className={cn(
          "flex-1 space-y-2 overflow-y-auto overflow-x-hidden",
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
                      ? "bg-sidebar-accent shadow-lg scale-105" 
                      : "hover:bg-sidebar-accent/50",
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
                    {/* Icon with gradient background */}
                    <div className={cn(
                      "relative flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 flex-shrink-0",
                      isOpen || isMobile 
                        ? "w-12 h-12" 
                        : "w-11 h-11",
                      isActive 
                        ? `bg-gradient-to-br ${item.iconBg} ring-2 ring-white/20 dark:ring-white/10 scale-110` 
                        : "bg-sidebar-muted group-hover:bg-sidebar-accent",
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
                          : "text-sidebar-muted-foreground group-hover:text-sidebar-foreground group-hover:scale-110"
                      )} />
                    </div>

                    {/* Label and description */}
                    {(isOpen || isMobile) && (
                      <div className="flex-1 min-w-0 animate-in slide-in-from-left duration-300">
                        <p className={cn(
                          "text-sm font-bold transition-colors duration-200 truncate",
                          isActive 
                            ? "text-sidebar-foreground" 
                            : "text-sidebar-muted-foreground group-hover:text-sidebar-foreground"
                        )}>
                          {item.name}
                        </p>
                        <p className="text-xs text-sidebar-muted-foreground/70 truncate mt-0.5">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Arrow indicator */}
                    {(isOpen || isMobile) && isActive && (
                      <ChevronRight className="w-5 h-5 text-sidebar-foreground animate-pulse flex-shrink-0" />
                    )}

                    {/* Badge for collapsed state */}
                    {!isOpen && !isMobile && isActive && (
                      <div className={cn(
                        "absolute -right-1 -top-1 w-3 h-3 rounded-full border-2 border-sidebar-background bg-gradient-to-br animate-pulse",
                        item.iconBg
                      )} />
                    )}
                  </div>

                  {/* Tooltip for collapsed state */}
                  {!isOpen && !isMobile && (
                    <div className="absolute left-full ml-6 px-4 py-3 bg-popover border border-border text-popover-foreground text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl backdrop-blur-sm">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-popover" />
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        {(isOpen || isMobile) && (
          <div className="relative px-4 pb-4 space-y-2 border-t border-sidebar-border pt-4 backdrop-blur-sm flex-shrink-0">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent gap-3"
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm font-medium">Configuración</span>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent gap-3"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Ayuda</span>
            </Button>
          </div>
        )}

        {/* User Profile */}
        <div className="relative border-t border-sidebar-border backdrop-blur-sm flex-shrink-0">
          {(isOpen || isMobile) ? (
            <div className="p-4 space-y-3 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center gap-3 p-3 bg-sidebar-accent rounded-2xl backdrop-blur-sm ring-1 ring-sidebar-border">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-11 h-11 ring-2 ring-primary/50 shadow-lg">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                      {user?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-sidebar-background rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-sidebar-foreground truncate">
                    {user?.full_name || "Usuario"}
                  </p>
                  <p className="text-xs text-sidebar-muted-foreground truncate">
                    {user?.email || "user@pos.com"}
                  </p>
                </div>
              </div>
              <Button 
                onClick={logout}
                variant="ghost" 
                className="w-full bg-destructive/10 hover:bg-destructive/20 text-destructive hover:text-destructive gap-2 justify-start font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          ) : (
            <div className="flex justify-center p-4">
              <div className="relative group cursor-pointer">
                <Avatar className="w-12 h-12 ring-2 ring-primary/50 shadow-lg hover:scale-110 transition-transform duration-300">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                    {user?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-sidebar-background rounded-full" />
                
                {/* Tooltip para usuario en modo colapsado */}
                <div className="absolute left-full ml-6 px-4 py-3 bg-popover border border-border text-popover-foreground text-sm rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-50 shadow-2xl backdrop-blur-sm bottom-0">
                  <div className="font-bold">{user?.full_name || "Usuario"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{user?.email || "user@pos.com"}</div>
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-popover" />
                </div>
              </div>
            </div>
          )}

          {/* Desktop toggle button - MOVIDO AQUÍ */}
          {!isMobile && (
            <div className="p-4 pt-0">
              <Button
                onClick={onToggle}
                variant="ghost"
                className={cn(
                  "w-full bg-sidebar-muted hover:bg-sidebar-accent text-sidebar-foreground gap-2 justify-center font-medium transition-all duration-300 border border-sidebar-border hover:border-primary/50",
                  !isOpen && "px-0"
                )}
              >
                {isOpen ? (
                  <>
                    <ChevronsLeft className="w-4 h-4" />
                    <span>Colapsar</span>
                  </>
                ) : (
                  <ChevronsRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}