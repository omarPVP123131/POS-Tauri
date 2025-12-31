import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, DollarSign, Package, ShoppingCart, TrendingUp, TrendingDown, Users, ArrowUpRight, ArrowDownRight, Clock, Star, Zap, Target, Calendar, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

// Mock function - replace with your actual formatCurrency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount)
}

export default function DashboardPage() {
  const stats = [
    {
      title: "Ventas Hoy",
      value: formatCurrency(45820),
      change: "+12.5%",
      changeValue: "+5,120",
      icon: DollarSign,
      trend: "up",
      color: "blue",
      bgGradient: "from-blue-500 to-blue-600",
    },
    {
      title: "Transacciones",
      value: "127",
      change: "+8.2%",
      changeValue: "+12",
      icon: ShoppingCart,
      trend: "up",
      color: "green",
      bgGradient: "from-green-500 to-green-600",
    },
    {
      title: "Productos Bajo Stock",
      value: "8",
      change: "-2",
      changeValue: "Crítico",
      icon: Package,
      trend: "down",
      color: "orange",
      bgGradient: "from-orange-500 to-orange-600",
    },
    {
      title: "Clientes Activos",
      value: "342",
      change: "+23",
      changeValue: "Este mes",
      icon: Users,
      trend: "up",
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
    },
  ]

  const recentTransactions = [
    { id: 2024001, time: "5 min", amount: 350, customer: "Juan Pérez", items: 3 },
    { id: 2024002, time: "10 min", amount: 450, customer: "María García", items: 5 },
    { id: 2024003, time: "15 min", amount: 250, customer: "Carlos López", items: 2 },
    { id: 2024004, time: "20 min", amount: 550, customer: "Ana Martínez", items: 7 },
    { id: 2024005, time: "25 min", amount: 350, customer: "Pedro Sánchez", items: 4 },
  ]

  const topProducts = [
    { name: "Coca-Cola 600ml", units: 25, revenue: 625, trend: 12, category: "Bebidas" },
    { name: "Pan Blanco", units: 22, revenue: 264, trend: 8, category: "Panadería" },
    { name: "Leche Entera 1L", units: 19, revenue: 380, trend: -3, category: "Lácteos" },
    { name: "Huevo Rojo 18pz", units: 16, revenue: 960, trend: 15, category: "Abarrotes" },
    { name: "Café Instantáneo", units: 13, revenue: 910, trend: 5, category: "Bebidas" },
  ]

  const dailyGoals = [
    { name: "Meta de Ventas", current: 45820, target: 60000, percentage: 76 },
    { name: "Meta de Transacciones", current: 127, target: 150, percentage: 85 },
    { name: "Satisfacción Cliente", current: 4.8, target: 5, percentage: 96 },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <Zap className="w-7 h-7 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="px-3 py-1.5 text-sm border-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
            En tiempo real
          </Badge>
          <Button variant="outline" size="sm" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Ver Reportes
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.title}
              className="group animate-in fade-in slide-in-from-bottom duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden relative h-full">
                {/* Background gradient effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-12 h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {stat.trend === "up" ? (
                        <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <ArrowUpRight className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        </div>
                      )}
                      <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {stat.change}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{stat.changeValue}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Daily Goals */}
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                Metas del Día
              </CardTitle>
              <CardDescription className="mt-1">Progreso de objetivos diarios</CardDescription>
            </div>
            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 self-start sm:self-auto">
              En progreso
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {dailyGoals.map((goal, index) => (
              <div key={index} className="space-y-2 group">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">{goal.name}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {typeof goal.current === 'number' && goal.current > 100 
                      ? formatCurrency(goal.current) 
                      : goal.current}
                    <span className="text-gray-400 dark:text-gray-500 mx-1">/</span>
                    {typeof goal.target === 'number' && goal.target > 100 
                      ? formatCurrency(goal.target) 
                      : goal.target}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={goal.percentage} className="h-3 group-hover:h-4 transition-all duration-300" />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white drop-shadow-lg">
                    {goal.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  Actividad Reciente
                </CardTitle>
                <CardDescription className="mt-1">Últimas transacciones realizadas</CardDescription>
              </div>
              <Button variant="ghost" size="sm">Ver todas</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction, i) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg flex-shrink-0">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        Venta #{transaction.id}
                      </p>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {transaction.items} items
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>Hace {transaction.time}</span>
                      <span>•</span>
                      <span className="truncate">{transaction.customer}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  Productos Más Vendidos
                </CardTitle>
                <CardDescription className="mt-1">Top 5 productos del día</CardDescription>
              </div>
              <Button variant="ghost" size="sm">Ver todos</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-yellow-200 dark:hover:border-yellow-800"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg flex-shrink-0">
                    <span className="font-bold text-white text-xl">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                        {product.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{product.units} unidades</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        {product.trend > 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-600" />
                        )}
                        <span className={product.trend > 0 ? "text-green-600" : "text-red-600"}>
                          {product.trend > 0 ? "+" : ""}{product.trend}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-white">
                      {formatCurrency(product.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}