"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { formatCurrency } from "../lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import type { PieLabelRenderProps } from "recharts"
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"]

// Types for chart data
interface ChartDataEntry {
  name: string
  value: number
  [key: string]: string | number // Index signature for Recharts
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("today")

  const getDateRange = () => {
    const now = new Date()
    const today = now.toISOString().split("T")[0]

    switch (dateRange) {
      case "today":
        return { start: `${today} 00:00:00`, end: `${today} 23:59:59` }
      case "week": {
        const weekAgo = new Date(now.setDate(now.getDate() - 7))
        return { start: weekAgo.toISOString().split("T")[0] + " 00:00:00", end: today + " 23:59:59" }
      }
      case "month": {
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1))
        return { start: monthAgo.toISOString().split("T")[0] + " 00:00:00", end: today + " 23:59:59" }
      }
      default:
        return { start: undefined, end: undefined }
    }
  }

  const { start, end } = getDateRange()

  // Fetch all reports data
  const { data: summaryResponse } = useQuery({
    queryKey: ["sales-summary", start, end],
    queryFn: () => api.reports.getSalesSummary(start, end),
  })

  const { data: topProductsResponse } = useQuery({
    queryKey: ["top-products", start, end],
    queryFn: () => api.reports.getTopProducts(start, end),
  })

  const { data: salesByDayResponse } = useQuery({
    queryKey: ["sales-by-day", start, end],
    queryFn: () => api.reports.getSalesByDay(start, end),
  })

  const { data: salesByHourResponse } = useQuery({
    queryKey: ["sales-by-hour"],
    queryFn: () => api.reports.getSalesByHour(),
    enabled: dateRange === "today",
  })

  const { data: paymentMethodsResponse } = useQuery({
    queryKey: ["payment-methods", start, end],
    queryFn: () => api.reports.getSalesByPaymentMethod(start, end),
  })

  const { data: inventoryValueResponse } = useQuery({
    queryKey: ["inventory-value"],
    queryFn: () => api.reports.getInventoryValue(),
  })

  const { data: categorySalesResponse } = useQuery({
    queryKey: ["category-sales", start, end],
    queryFn: () => api.reports.getCategorySales(start, end),
  })

  const { data: userPerformanceResponse } = useQuery({
    queryKey: ["user-performance", start, end],
    queryFn: () => api.reports.getUserPerformance(start, end),
  })

  const summary = summaryResponse?.data
  const topProducts = topProductsResponse?.data || []
  const salesByDay = salesByDayResponse?.data || []
  const salesByHour = salesByHourResponse?.data || []
  const paymentMethods = paymentMethodsResponse?.data || []
  const inventoryValue = inventoryValueResponse?.data
  const categorySales = categorySalesResponse?.data || []
  const userPerformance = userPerformanceResponse?.data || []

  const paymentChartData: ChartDataEntry[] = paymentMethods.map((pm) => ({
    name: pm.method === "cash" ? "Efectivo" : pm.method === "card" ? "Tarjeta" : pm.method,
    value: pm.total,
  }))

  const categoryChartData: ChartDataEntry[] = categorySales.map((cs) => ({
    name: cs.category_name,
    value: cs.total_sales,
  }))

  // Export to CSV function
  const exportToCSV = () => {
    const csvContent = [
      ["Reporte de Ventas", dateRange],
      [""],
      ["Resumen"],
      ["Total Ventas", summary?.total_sales || 0],
      ["Transacciones", summary?.total_transactions || 0],
      ["Ticket Promedio", summary?.average_ticket || 0],
      [""],
      ["Top Productos"],
      ["Producto", "Cantidad", "Ingresos"],
      ...topProducts.map((p) => [p.product_name, p.quantity_sold, p.total_revenue]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reporte-ventas-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  // Calculate trend compared to previous period
  const getTrend = () => {
    if (!summary) return null
    // This would need historical data - placeholder for now
    return {
      percentage: 12.5,
      isPositive: true,
    }
  }

  const trend = getTrend()

  // Custom formatter for tooltips
  const currencyFormatter = (value: number | string | Array<number | string> | undefined): string => {
    if (value === undefined || value === null) return "$0.00"
    if (Array.isArray(value)) return formatCurrency(value[0] as number)
    return formatCurrency(typeof value === "string" ? parseFloat(value) : value)
  }

  // Custom label for pie chart
  const renderPieLabel = (props: PieLabelRenderProps): string => {
    const { name, value } = props
    if (!name || value === undefined) return ""
    return `${name}: ${formatCurrency(Number(value))}`
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Análisis</h1>
          <p className="text-muted-foreground mt-1">Estadísticas y métricas del negocio</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Hoy
                </div>
              </SelectItem>
              <SelectItem value="week">Últimos 7 días</SelectItem>
              <SelectItem value="month">Último mes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ventas Totales</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(summary.total_sales)}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-muted-foreground">{summary.total_transactions} transacciones</p>
                {trend && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      trend.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend.isPositive ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {trend.percentage}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(summary.average_ticket)}</div>
              <p className="text-xs text-muted-foreground mt-2">Por transacción</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Items Vendidos</CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(summary.total_items_sold)}</div>
              <p className="text-xs text-muted-foreground mt-2">Unidades totales</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Métodos de Pago</CardTitle>
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efectivo:</span>
                  <span className="font-medium">{formatCurrency(summary.cash_sales)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tarjeta:</span>
                  <span className="font-medium">{formatCurrency(summary.card_sales)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="col-span-full lg:col-span-2">
              <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
                <CardDescription>Tendencia de ventas en el período seleccionado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={salesByDay.slice(0, 30).reverse()}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-gray-600 dark:text-gray-400" />
                    <YAxis className="text-gray-600 dark:text-gray-400" />
                    <Tooltip
                      formatter={currencyFormatter}
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="total_sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {dateRange === "today" && salesByHour.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Hora</CardTitle>
                  <CardDescription>Distribución de ventas durante el día</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesByHour}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip
                        formatter={currencyFormatter}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="total_sales" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {paymentChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pago</CardTitle>
                  <CardDescription>Distribución por forma de pago</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={renderPieLabel}
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={currencyFormatter}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {categoryChartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ventas por Categoría</CardTitle>
                  <CardDescription>Rendimiento de categorías de productos</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip
                        formatter={currencyFormatter}
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>Top 10 productos por ingresos generados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Posición</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Veces Vendido</TableHead>
                    <TableHead className="text-right">Ingresos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <TableRow key={product.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                : index === 1
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                : index === 2
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{product.product_name}</TableCell>
                        <TableCell className="text-right">{Math.round(product.quantity_sold)}</TableCell>
                        <TableCell className="text-right">{product.times_sold}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(product.total_revenue)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No hay datos de productos para el período seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          {inventoryValue && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Productos</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{inventoryValue.total_products}</div>
                  <p className="text-xs text-muted-foreground mt-2">Productos activos</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Valor de Inventario</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{formatCurrency(inventoryValue.total_stock_value)}</div>
                  <p className="text-xs text-muted-foreground mt-2">Valor al costo</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-orange-200 dark:border-orange-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Stock Bajo</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Tag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {inventoryValue.low_stock_items}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Requieren reabasto</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-red-200 dark:border-red-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Sin Stock</CardTitle>
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                    <Package className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {inventoryValue.out_of_stock_items}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Productos agotados</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Usuario</CardTitle>
              <CardDescription>Desempeño de ventas del equipo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Transacciones</TableHead>
                    <TableHead className="text-right">Ticket Promedio</TableHead>
                    <TableHead className="text-right">Total Ventas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userPerformance.length > 0 ? (
                    userPerformance.map((user, index) => (
                      <TableRow key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                index === 0
                                  ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                                  : "bg-primary"
                              }`}
                            >
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{user.user_name}</p>
                              {index === 0 && (
                                <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                                  Top Vendedor
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{user.transactions}</TableCell>
                        <TableCell className="text-right">{formatCurrency(user.average_ticket)}</TableCell>
                        <TableCell className="text-right font-bold text-primary">
                          {formatCurrency(user.total_sales)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No hay datos de rendimiento para el período seleccionado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}