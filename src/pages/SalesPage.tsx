"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api } from "../lib/api"
import { useCartStore } from "../store/cart"
import { useAuthStore } from "../store/auth"
import { useShiftStore } from "../store/shift"
import { formatCurrency } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, ShoppingCart, Trash2, Plus, Minus, Check, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const user = useAuthStore((state) => state.user)
  const currentShift = useShiftStore((state) => state.currentShift)
  const { items, addItem, removeItem, updateQuantity, clearCart, getSubtotal, getTaxAmount, getTotal } = useCartStore()

  const { data: productsResponse } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.products.list(),
  })

  const products = productsResponse?.data || []
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCompleteSale = async () => {
    if (!user || items.length === 0) return

    if (!currentShift) {
      toast.warning("No hay un turno abierto. La venta se registrará sin turno asignado.")
    }

    try {
      const saleData = {
        user_id: user.id,
        shift_id: currentShift?.id,
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discount_amount: item.discount,
          tax_rate: 0.16,
        })),
        subtotal: getSubtotal(),
        tax_amount: getTaxAmount(),
        discount_amount: 0,
        total: getTotal(),
        payment_method: "cash",
      }

      const response = await api.sales.create(saleData)
      if (response.success) {
        toast.success(`Venta completada - Ticket: ${response.data?.sale_number}`)
        clearCart()
        setShowCheckout(false)
      }
    } catch (error) {
      toast.error("No se pudo completar la venta")
    }
  }

  return (
    <div className="flex h-full">
      {/* Products Section */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div>
          <h1 className="text-3xl font-bold">Punto de Venta</h1>
          <p className="text-muted-foreground">Busca y agrega productos al carrito</p>
        </div>

        {!currentShift && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No hay un turno abierto. Ve a la sección de Caja para abrir un turno antes de realizar ventas.
            </AlertDescription>
          </Alert>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, SKU o código de barras..."
            className="pl-10 h-12 text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => addItem(product)}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-primary">{formatCurrency(product.price)}</span>
                  <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 border-l border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold">Ticket Actual</h2>
          <p className="text-sm text-muted-foreground">{items.length} productos</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">El carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm mb-1">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} c/u</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="p-6 border-t border-border space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">{formatCurrency(getSubtotal())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">IVA (16%):</span>
              <span className="font-medium">{formatCurrency(getTaxAmount())}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
          </div>

          <Button className="w-full" size="lg" disabled={items.length === 0} onClick={handleCompleteSale}>
            <Check className="w-5 h-5 mr-2" />
            Cobrar {formatCurrency(getTotal())}
          </Button>

          {items.length > 0 && (
            <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
              Cancelar Venta
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}