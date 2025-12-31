import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft, Compass } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* 404 Number with gradient */}
        <div className="relative">
          <div className="text-[12rem] font-bold leading-none tracking-tighter">
            <span className="bg-gradient-to-br from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
              404
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-24 h-24 text-muted-foreground/20 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Página no encontrada
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver atrás</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="group flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Ir al inicio</span>
          </button>
        </div>

        {/* Helpful links */}
        <div className="pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground mb-4">
            Enlaces útiles:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: 'Ventas', path: '/sales' },
              { label: 'Inventario', path: '/inventory' },
              { label: 'Reportes', path: '/reports' },
              { label: 'Clientes', path: '/customers' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 rounded-md bg-card hover:bg-accent/10 text-sm text-muted-foreground hover:text-foreground transition-colors border border-border/50 hover:border-accent/50"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search suggestion */}
        <div className="pt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
            <Search className="w-4 h-4" />
            <span>¿Necesitas ayuda? Contacta a soporte</span>
          </div>
        </div>
      </div>
    </div>
  )
}