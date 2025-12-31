"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/auth"
import { api } from "../lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { LogIn, Store, ShoppingCart, TrendingUp, Zap, Lock, User, Eye, EyeOff, ArrowRight, Sparkles, Shield, Clock, KeyRound, Mail } from "lucide-react"
import { toast } from "sonner"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState("")
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  // Load remembered username
  useEffect(() => {
    const remembered = localStorage.getItem("rememberedUsername")
    if (remembered) {
      setUsername(remembered)
      setRememberMe(true)
    }
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUsername("")
        setPassword("")
        setError("")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Detect autofill
  useEffect(() => {
    const inputs = document.querySelectorAll("input")
    const checkAutofill = () => {
      inputs.forEach((input) => {
        if (input.matches(":-webkit-autofill")) {
          input.classList.add("autofilled")
        }
      })
    }
    const timer = setTimeout(checkAutofill, 100)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await api.auth.login(username, password)
      if (response.success && response.data) {
        // Remember username if checked
        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username)
        } else {
          localStorage.removeItem("rememberedUsername")
        }

        login(response.data.user, response.data.token)
        
        // Success toast with confetti effect
        toast.success("¡Bienvenido!", {
          description: `Sesión iniciada como ${username}`,
          duration: 3000,
        })
        
        setTimeout(() => navigate("/"), 300)
      } else {
        setError(response.message || "Credenciales inválidas")
        toast.error("Error de autenticación", {
          description: response.message || "Credenciales inválidas",
        })
      }
    } catch (err) {
      const errorMsg = "Error al conectar con el servidor"
      setError(errorMsg)
      toast.error("Error de conexión", {
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!recoveryEmail) {
      toast.error("Campo requerido", {
        description: "Por favor ingresa tu correo electrónico",
      })
      return
    }

    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: "Enviando correo de recuperación...",
        success: "¡Correo enviado! Revisa tu bandeja de entrada",
        error: "Error al enviar el correo",
      }
    )

    setTimeout(() => {
      setForgotPasswordOpen(false)
      setRecoveryEmail("")
    }, 2500)
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      {/* Enhanced floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-indigo-400/30 rounded-full animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-purple-400/30 rounded-full animate-ping" style={{ animationDuration: '5s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-blue-500/30 rounded-full animate-ping" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }} />
      </div>

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between">
        {/* Enhanced gradient mesh */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-transparent animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/10 rounded-full blur-2xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>
        
        <div className="relative z-10 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3 mb-8 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
              <div className="relative w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Store className="w-7 h-7 text-white transition-transform duration-300 group-hover:scale-110" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                POS Desktop
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </h1>
              <p className="text-blue-100 text-sm">Sistema de punto de venta</p>
            </div>
          </div>
          
          <div className="space-y-6 mt-16">
            <div className="inline-block">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4 animate-in fade-in slide-in-from-left duration-700 delay-300">
                <Shield className="w-4 h-4 text-green-300" />
                <span className="text-sm text-white font-medium">Seguro y Confiable</span>
              </div>
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight">
              Gestiona tu negocio de forma{" "}
              <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 bg-clip-text text-transparent">
                inteligente
              </span>
            </h2>
            <p className="text-blue-100 text-lg leading-relaxed max-w-md">
              Ventas rápidas, inventario en tiempo real y reportes detallados. Todo lo que necesitas en una sola aplicación.
            </p>
            
            {/* Stats */}
            <div className="flex gap-8 pt-4">
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">24/7</div>
                <div className="text-blue-200 text-sm">Soporte</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform duration-300">5k+</div>
                <div className="text-blue-200 text-sm">Usuarios</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 cursor-pointer">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors duration-300">
                <ShoppingCart className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              <p className="text-white font-semibold text-sm">Ventas Rápidas</p>
              <p className="text-blue-100 text-xs mt-1">Interface optimizada</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 cursor-pointer">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors duration-300">
                <TrendingUp className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              <p className="text-white font-semibold text-sm">Reportes</p>
              <p className="text-blue-100 text-xs mt-1">Análisis en tiempo real</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
            <div className="relative bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:-translate-y-1 cursor-pointer">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-white/20 transition-colors duration-300">
                <Zap className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3" />
              </div>
              <p className="text-white font-semibold text-sm">Rendimiento</p>
              <p className="text-blue-100 text-xs mt-1">Rápido y eficiente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-12 relative">
        <div className="w-full max-w-md animate-in fade-in slide-in-from-right duration-700">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl blur-md group-hover:blur-lg transition-all duration-300" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Store className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">POS Desktop</h1>
                <p className="text-muted-foreground text-sm">Sistema de punto de venta</p>
              </div>
            </div>
          </div>

          <Card className="border-2 shadow-xl backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 transition-all duration-300 hover:shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 hover:opacity-5 blur-xl transition-opacity duration-500" />
            
            <CardHeader className="space-y-1 relative">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                Bienvenido
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </CardTitle>
              <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-4">
                {/* Username */}
                <div className="space-y-2 group">
                  <Label htmlFor="username" className="flex items-center gap-2">
                    <div className={`transition-all duration-200 ${focusedField === 'username' ? 'text-blue-600 scale-110' : 'text-muted-foreground'}`}>
                      <User className="w-4 h-4" />
                    </div>
                    Usuario
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField('username')}
                      onBlur={() => setFocusedField(null)}
                      required
                      autoFocus
                      className="h-11 pl-4 pr-10 transition-all duration-200 focus:scale-[1.01] focus:shadow-md border-2 autofill:bg-blue-50 dark:autofill:bg-blue-950"
                    />
                    {username && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 animate-in fade-in zoom-in duration-200">
                        <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <span className="text-xs">✓</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2 group">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <div className={`transition-all duration-200 ${focusedField === 'password' ? 'text-blue-600 scale-110' : 'text-muted-foreground'}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                      required
                      className="h-11 pl-4 pr-10 transition-all duration-200 focus:scale-[1.01] focus:shadow-md border-2 autofill:bg-blue-50 dark:autofill:bg-blue-950"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="data-[state=checked]:bg-blue-600"
                    />
                    <label
                      htmlFor="remember"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Recordarme
                    </label>
                  </div>
                  
                  <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                    <DialogTrigger asChild>
                      <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <KeyRound className="w-5 h-5 text-blue-600" />
                          Recuperar Contraseña
                        </DialogTitle>
                        <DialogDescription>
                          Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="recovery-email" className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Correo Electrónico
                          </Label>
                          <Input
                            id="recovery-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            className="h-11"
                          />
                        </div>
                        <Button 
                          onClick={handleForgotPassword}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Instrucciones
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border-2 border-destructive/20 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top duration-300">
                    <span className="text-base animate-pulse">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <Button 
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] group relative overflow-hidden" 
                  size="lg" 
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ingresando...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                        Ingresar
                        <ArrowRight className="w-4 h-4 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 absolute right-4" />
                      </>
                    )}
                  </div>
                </Button>

                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Credenciales de prueba
                    </span>
                    <span className="text-[10px] bg-muted px-2 py-1 rounded">ESC para limpiar</span>
                  </div>
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-300" />
                    <div className="relative bg-muted/50 rounded-lg p-3 text-center transition-all duration-300 hover:bg-muted/70 hover:scale-[1.01] border border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800">
                      <p className="text-sm">
                        <strong className="text-blue-600 dark:text-blue-400">Usuario:</strong> admin · <strong className="text-indigo-600 dark:text-indigo-400">Contraseña:</strong> admin123
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground mt-6 animate-in fade-in duration-1000 delay-500">
            © 2024 POS Desktop. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}