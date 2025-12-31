"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, type Customer } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, User, ShoppingBag, Gift, Mail, Phone, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function CustomersPage() {
  const queryClient = useQueryClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [addCustomerDialog, setAddCustomerDialog] = useState(false)
  const [viewCustomerDialog, setViewCustomerDialog] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    rfc: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    credit_limit: "",
    notes: "",
  })

  // Fetch customers
  const { data: customersResponse } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.customers.list(),
  })

  // Fetch customer details when selected
  const { data: customerStatsResponse } = useQuery({
    queryKey: ["customer-stats", selectedCustomer?.id],
    queryFn: () => api.customers.getStats(selectedCustomer!.id),
    enabled: !!selectedCustomer,
  })

  const { data: customerPurchasesResponse } = useQuery({
    queryKey: ["customer-purchases", selectedCustomer?.id],
    queryFn: () => api.customers.getPurchases(selectedCustomer!.id),
    enabled: !!selectedCustomer,
  })

  const customers = customersResponse?.data || []
  const customerStats = customerStatsResponse?.data
  const customerPurchases = customerPurchasesResponse?.data || []

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rfc?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: any) => api.customers.create(data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("El cliente ha sido agregado exitosamente")
        setAddCustomerDialog(false)
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          rfc: "",
          address: "",
          city: "",
          state: "",
          postal_code: "",
          credit_limit: "",
          notes: "",
        })
        queryClient.invalidateQueries({ queryKey: ["customers"] })
      }
    },
  })

  // Add loyalty points mutation
  const addPointsMutation = useMutation({
    mutationFn: ({ id, points }: { id: string; points: number }) => api.customers.addLoyaltyPoints(id, points),
    onSuccess: () => {
      toast.success("Los puntos de lealtad han sido actualizados")
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] })
    },
  })

  const handleCreateCustomer = () => {
    if (!newCustomer.name) {
      toast.error("El nombre es requerido")
      return
    }

    createCustomerMutation.mutate({
      name: newCustomer.name,
      email: newCustomer.email || undefined,
      phone: newCustomer.phone || undefined,
      rfc: newCustomer.rfc || undefined,
      address: newCustomer.address || undefined,
      city: newCustomer.city || undefined,
      state: newCustomer.state || undefined,
      postal_code: newCustomer.postal_code || undefined,
      credit_limit: newCustomer.credit_limit ? Number.parseFloat(newCustomer.credit_limit) : undefined,
      notes: newCustomer.notes || undefined,
    })
  }

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewCustomerDialog(true)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Clientes</h1>
          <p className="text-muted-foreground">Control de clientes y programa de lealtad</p>
        </div>
        <Dialog open={addCustomerDialog} onOpenChange={setAddCustomerDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Cliente</DialogTitle>
              <DialogDescription>Completa la información del nuevo cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Juan Pérez García"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="cliente@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="5512345678"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  value={newCustomer.rfc}
                  onChange={(e) => setNewCustomer({ ...newCustomer, rfc: e.target.value })}
                  placeholder="XAXX010101000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Calle y número"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={newCustomer.city}
                    onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={newCustomer.state}
                    onChange={(e) => setNewCustomer({ ...newCustomer, state: e.target.value })}
                    placeholder="Estado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postal">C.P.</Label>
                  <Input
                    id="postal"
                    value={newCustomer.postal_code}
                    onChange={(e) => setNewCustomer({ ...newCustomer, postal_code: e.target.value })}
                    placeholder="00000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit-limit">Límite de Crédito</Label>
                <Input
                  id="credit-limit"
                  type="number"
                  step="0.01"
                  value={newCustomer.credit_limit}
                  onChange={(e) => setNewCustomer({ ...newCustomer, credit_limit: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Notas adicionales sobre el cliente..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCustomerDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCustomer} disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? "Creando..." : "Crear Cliente"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nombre, email, teléfono o RFC..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>RFC</TableHead>
                <TableHead className="text-right">Puntos</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Cliente desde {new Date(customer.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {customer.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{customer.rfc || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="secondary">{customer.loyalty_points} pts</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(customer.current_balance)}</TableCell>
                  <TableCell>
                    <Badge variant={customer.is_active ? "default" : "secondary"}>
                      {customer.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => handleViewCustomer(customer)}>
                      Ver Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={viewCustomerDialog} onOpenChange={setViewCustomerDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>Información detallada del cliente y historial de compras</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información de Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {selectedCustomer.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.email}</span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedCustomer.phone}</span>
                      </div>
                    )}
                    {(selectedCustomer.address || selectedCustomer.city) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          {selectedCustomer.address && <p>{selectedCustomer.address}</p>}
                          {selectedCustomer.city && (
                            <p className="text-muted-foreground">
                              {selectedCustomer.city}
                              {selectedCustomer.state && `, ${selectedCustomer.state}`}
                              {selectedCustomer.postal_code && ` ${selectedCustomer.postal_code}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedCustomer.rfc && (
                      <div>
                        <p className="text-muted-foreground">RFC</p>
                        <p className="font-medium">{selectedCustomer.rfc}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Programa de Lealtad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-primary" />
                        <span className="text-sm text-muted-foreground">Puntos Acumulados</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">{selectedCustomer.loyalty_points}</span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => addPointsMutation.mutate({ id: selectedCustomer.id, points: 100 })}
                    >
                      Agregar 100 Puntos
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Stats */}
              {customerStats && (
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Compras</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{customerStats.total_purchases}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Gastado</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(customerStats.total_spent)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Ticket Promedio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(customerStats.average_purchase)}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Última Compra</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm font-medium">
                        {customerStats.last_purchase_date
                          ? new Date(customerStats.last_purchase_date).toLocaleDateString()
                          : "Sin compras"}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Purchase History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Historial de Compras</CardTitle>
                  <CardDescription>Últimas 50 transacciones</CardDescription>
                </CardHeader>
                <CardContent>
                  {customerPurchases.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ticket</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Items</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerPurchases.map((purchase) => (
                          <TableRow key={purchase.sale_id}>
                            <TableCell className="font-mono text-sm">{purchase.sale_number}</TableCell>
                            <TableCell className="text-sm">{formatDate(purchase.date)}</TableCell>
                            <TableCell className="text-right">{purchase.items_count}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(purchase.total)}</TableCell>
                            <TableCell>
                              <Badge variant={purchase.payment_status === "paid" ? "default" : "secondary"}>
                                {purchase.payment_status === "paid" ? "Pagado" : "Pendiente"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Este cliente aún no ha realizado compras</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}