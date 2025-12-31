"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../store/auth"
import { api } from "../lib/api"
import { formatCurrency } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Search, AlertTriangle, TrendingUp, TrendingDown, ArrowUpDown, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const [searchTerm, setSearchTerm] = useState("")
  const [addProductDialog, setAddProductDialog] = useState(false)
  const [editProductDialog, setEditProductDialog] = useState(false)
  const [adjustStockDialog, setAdjustStockDialog] = useState(false)
  const [addCategoryDialog, setAddCategoryDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  // Form states for new product
  const [newProduct, setNewProduct] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    category_id: "",
    price: "",
    cost: "",
    stock: "",
    min_stock: "",
    max_stock: "",
    unit: "pz",
  })

  // Form states for stock adjustment
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: "",
    type: "in",
    notes: "",
  })

  // Form state for new category
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })

  // Fetch products
  const { data: productsResponse, isLoading: productsLoading } = useQuery({
    queryKey: ["inventory-products"],
    queryFn: () => api.inventory.listProducts(),
  })

  // Fetch categories
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.inventory.listCategories(),
  })

  // Fetch low stock products
  const { data: lowStockResponse } = useQuery({
    queryKey: ["low-stock"],
    queryFn: () => api.inventory.getLowStock(),
  })

  // Fetch movements
  const { data: movementsResponse } = useQuery({
    queryKey: ["inventory-movements"],
    queryFn: () => api.inventory.listMovements(),
  })

  const products = productsResponse?.data || []
  const categories = categoriesResponse?.data || []
  const lowStockProducts = lowStockResponse?.data || []
  const movements = movementsResponse?.data || []

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: (data: any) => api.inventory.createProduct(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Producto creado", {
          description: "El producto ha sido agregado exitosamente",
          duration: 3000,
        })
        setAddProductDialog(false)
        setNewProduct({
          sku: "",
          barcode: "",
          name: "",
          description: "",
          category_id: "",
          price: "",
          cost: "",
          stock: "",
          min_stock: "",
          max_stock: "",
          unit: "pz",
        })
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] })
        queryClient.invalidateQueries({ queryKey: ["low-stock"] })
      }
    },
    onError: (error: any) => {
      toast.error("Error al crear producto", {
        description: error.message || "Ocurrió un error inesperado",
      })
    },
  })

  // Adjust stock mutation
  const adjustStockMutation = useMutation({
    mutationFn: (data: any) => api.inventory.adjustStock(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Stock ajustado", {
          description: `El inventario de ${selectedProduct?.name} ha sido actualizado`,
          duration: 3000,
        })
        setAdjustStockDialog(false)
        setStockAdjustment({ quantity: "", type: "in", notes: "" })
        queryClient.invalidateQueries({ queryKey: ["inventory-products"] })
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] })
        queryClient.invalidateQueries({ queryKey: ["low-stock"] })
      }
    },
    onError: (error: any) => {
      toast.error("Error al ajustar stock", {
        description: error.message || "Ocurrió un error inesperado",
      })
    },
  })

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => api.inventory.createCategory(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Categoría creada", {
          description: "La categoría ha sido agregada exitosamente",
          duration: 3000,
        })
        setAddCategoryDialog(false)
        setNewCategory({ name: "", description: "", color: "#3b82f6" })
        queryClient.invalidateQueries({ queryKey: ["categories"] })
      }
    },
    onError: (error: any) => {
      toast.error("Error al crear categoría", {
        description: error.message || "Ocurrió un error inesperado",
      })
    },
  })

  const handleCreateProduct = () => {
    if (!newProduct.sku || !newProduct.name || !newProduct.price || !newProduct.cost) {
      toast.error("Campos requeridos", {
        description: "Por favor completa SKU, nombre, precio y costo",
      })
      return
    }

    // Validar que precio sea mayor que costo
    const price = Number.parseFloat(newProduct.price)
    const cost = Number.parseFloat(newProduct.cost)
    
    if (price < cost) {
      toast.warning("Advertencia de precio", {
        description: "El precio de venta es menor que el costo. ¿Estás seguro?",
      })
    }

    const loadingToast = toast.loading("Creando producto...")

    createProductMutation.mutate(
      {
        sku: newProduct.sku,
        barcode: newProduct.barcode || undefined,
        name: newProduct.name,
        description: newProduct.description || undefined,
        category_id: newProduct.category_id || undefined,
        price,
        cost,
        stock: Number.parseInt(newProduct.stock) || 0,
        min_stock: Number.parseInt(newProduct.min_stock) || 0,
        max_stock: newProduct.max_stock ? Number.parseInt(newProduct.max_stock) : undefined,
        unit: newProduct.unit,
      },
      {
        onSettled: () => {
          toast.dismiss(loadingToast)
        },
      },
    )
  }

  const handleAdjustStock = () => {
    if (!selectedProduct || !stockAdjustment.quantity || !user) {
      toast.error("Error", {
        description: "Por favor completa todos los campos requeridos",
      })
      return
    }

    const quantity = Number.parseInt(stockAdjustment.quantity)
    const newStock = stockAdjustment.type === "in" 
      ? selectedProduct.stock + quantity 
      : selectedProduct.stock - quantity

    if (newStock < 0) {
      toast.error("Stock insuficiente", {
        description: "No puedes reducir el stock por debajo de 0",
      })
      return
    }

    const loadingToast = toast.loading("Ajustando stock...")

    adjustStockMutation.mutate(
      {
        product_id: selectedProduct.id,
        quantity,
        adjustment_type: stockAdjustment.type,
        notes: stockAdjustment.notes || undefined,
        user_id: user.id,
      },
      {
        onSettled: () => {
          toast.dismiss(loadingToast)
        },
      },
    )
  }

  const handleCreateCategory = () => {
    if (!newCategory.name) {
      toast.error("Error", {
        description: "El nombre de la categoría es requerido",
      })
      return
    }

    createCategoryMutation.mutate({
      name: newCategory.name,
      description: newCategory.description || undefined,
      color: newCategory.color,
    })
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Sin stock", variant: "destructive" as const }
    if (stock <= minStock) return { label: "Stock bajo", variant: "destructive" as const }
    if (stock <= minStock * 1.5) return { label: "Stock medio", variant: "secondary" as const }
    return { label: "Stock normal", variant: "default" as const }
  }

  const resetNewProductForm = () => {
    setNewProduct({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      category_id: "",
      price: "",
      cost: "",
      stock: "",
      min_stock: "",
      max_stock: "",
      unit: "pz",
    })
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Inventario</h1>
          <p className="text-muted-foreground mt-1">Control de productos, categorías y stock</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Categoría</DialogTitle>
                <DialogDescription>Agrega una nueva categoría de productos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cat-name">Nombre *</Label>
                  <Input
                    id="cat-name"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ej: Bebidas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-desc">Descripción</Label>
                  <Textarea
                    id="cat-desc"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cat-color">Color</Label>
                  <Input
                    id="cat-color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCategory} disabled={createCategoryMutation.isPending}>
                  {createCategoryMutation.isPending ? "Creando..." : "Crear"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog 
            open={addProductDialog} 
            onOpenChange={(open) => {
              setAddProductDialog(open)
              if (!open) resetNewProductForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Producto</DialogTitle>
                <DialogDescription>Completa la información del nuevo producto</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input
                      id="sku"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="Código único"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Código de Barras</Label>
                    <Input
                      id="barcode"
                      value={newProduct.barcode}
                      onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Nombre del producto"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Descripción opcional"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newProduct.category_id}
                    onValueChange={(v) => setNewProduct({ ...newProduct, category_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Costo *</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={newProduct.cost}
                      onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad</Label>
                    <Select value={newProduct.unit} onValueChange={(v) => setNewProduct({ ...newProduct, unit: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pz">Pieza</SelectItem>
                        <SelectItem value="kg">Kilogramo</SelectItem>
                        <SelectItem value="lt">Litro</SelectItem>
                        <SelectItem value="mt">Metro</SelectItem>
                        <SelectItem value="paq">Paquete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Inicial</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="min-stock">Stock Mínimo</Label>
                    <Input
                      id="min-stock"
                      type="number"
                      value={newProduct.min_stock}
                      onChange={(e) => setNewProduct({ ...newProduct, min_stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-stock">Stock Máximo</Label>
                    <Input
                      id="max-stock"
                      type="number"
                      value={newProduct.max_stock}
                      onChange={(e) => setNewProduct({ ...newProduct, max_stock: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddProductDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProduct} disabled={createProductMutation.isPending}>
                  {createProductMutation.isPending ? "Creando..." : "Crear Producto"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-5 h-5" />
              Productos con Stock Bajo
            </CardTitle>
            <CardDescription>{lowStockProducts.length} productos necesitan reabastecimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock actual: {product.stock} {product.unit} | Mínimo: {product.min_stock} {product.unit}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedProduct(product)
                      setAdjustStockDialog(true)
                    }}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ajustar Stock
                  </Button>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{lowStockProducts.length - 5} productos más con stock bajo
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos ({filteredProducts.length})</CardTitle>
              <CardDescription>
                {productsLoading ? "Cargando productos..." : `${products.length} productos en total`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product.stock, product.min_stock)
                      return (
                        <TableRow key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {product.category_name && <Badge variant="outline">{product.category_name}</Badge>}
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-right">
                            {product.stock} {product.unit}
                          </TableCell>
                          <TableCell>
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setAdjustStockDialog(true)
                                }}
                                title="Ajustar stock"
                              >
                                <ArrowUpDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {productsLoading ? "Cargando..." : "No se encontraron productos"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Movimientos</CardTitle>
              <CardDescription>Últimos 100 movimientos de inventario</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.length > 0 ? (
                    movements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell className="text-sm">
                          {new Date(movement.created_at).toLocaleString("es-MX", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{movement.product_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {movement.movement_type.includes("in") ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className="text-sm capitalize">{movement.movement_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{movement.quantity}</TableCell>
                        <TableCell className="text-sm">{movement.user_name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{movement.notes || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No hay movimientos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categorías ({categories.length})</CardTitle>
              <CardDescription>Organiza tus productos por categorías</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Card key={category.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: category.color || "#3b82f6" }}
                          >
                            <Package className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1">{category.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {category.description || "Sin descripción"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    No hay categorías. Crea una para empezar.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stock Adjustment Dialog */}
      <Dialog open={adjustStockDialog} onOpenChange={setAdjustStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <span>
                  Stock actual: <strong>{selectedProduct.stock} {selectedProduct.unit}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Producto</Label>
              <Input value={selectedProduct?.name || ""} disabled className="bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Tipo de Ajuste</Label>
              <Select
                value={stockAdjustment.type}
                onValueChange={(v) => setStockAdjustment({ ...stockAdjustment, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      Entrada (Agregar stock)
                    </div>
                  </SelectItem>
                  <SelectItem value="out">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      Salida (Quitar stock)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={stockAdjustment.quantity}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: e.target.value })}
                placeholder="0"
              />
              {selectedProduct && stockAdjustment.quantity && (
                <p className="text-sm text-muted-foreground">
                  Nuevo stock: {" "}
                  <strong>
                    {stockAdjustment.type === "in"
                      ? selectedProduct.stock + Number.parseInt(stockAdjustment.quantity)
                      : selectedProduct.stock - Number.parseInt(stockAdjustment.quantity)}{" "}
                    {selectedProduct.unit}
                  </strong>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="adj-notes">Notas</Label>
              <Textarea
                id="adj-notes"
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
                placeholder="Motivo del ajuste (recomendado)..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustStockDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdjustStock} disabled={adjustStockMutation.isPending || !stockAdjustment.quantity}>
              {adjustStockMutation.isPending ? "Ajustando..." : "Confirmar Ajuste"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}