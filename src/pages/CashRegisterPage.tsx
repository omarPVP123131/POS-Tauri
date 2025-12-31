"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "../store/auth"
import { useShiftStore } from "../store/shift"
import { api } from "../lib/api"
import { formatCurrency, formatDate } from "../lib/utils"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, LogIn, LogOut } from "lucide-react"
import { toast } from "sonner"

export default function CashRegisterPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const { currentShift, setCurrentShift, clearCurrentShift } = useShiftStore()

  const [openShiftDialog, setOpenShiftDialog] = useState(false)
  const [closeShiftDialog, setCloseShiftDialog] = useState(false)
  const [selectedRegister, setSelectedRegister] = useState("")
  const [openingBalance, setOpeningBalance] = useState("")
  const [closingBalance, setClosingBalance] = useState("")
  const [closeNotes, setCloseNotes] = useState("")

  // Fetch cash registers
  const { data: registersResponse } = useQuery({
    queryKey: ["cash-registers"],
    queryFn: () => api.cashRegister.listRegisters(),
  })

  // Fetch current shift
  const { data: currentShiftResponse } = useQuery({
    queryKey: ["current-shift", user?.id],
    queryFn: () => api.cashRegister.getCurrentShift(user!.id),
    enabled: !!user && !currentShift,
  })

  // Fetch shift history
  const { data: shiftsResponse } = useQuery({
    queryKey: ["shifts"],
    queryFn: () => api.cashRegister.listShifts(),
  })

  // Open shift mutation
  const openShiftMutation = useMutation({
    mutationFn: (data: { user_id: string; register_id: string; opening_balance: number }) =>
      api.cashRegister.openShift(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setCurrentShift(response.data)
        toast.success("Tu turno ha sido abierto exitosamente")
        setOpenShiftDialog(false)
        setOpeningBalance("")
        queryClient.invalidateQueries({ queryKey: ["current-shift"] })
        queryClient.invalidateQueries({ queryKey: ["shifts"] })
      } else {
        toast.error(response.message || "No se pudo abrir el turno")
      }
    },
  })

  // Close shift mutation
  const closeShiftMutation = useMutation({
    mutationFn: (data: { shiftId: string; closing_balance: number; notes?: string }) =>
      api.cashRegister.closeShift(data.shiftId, { closing_balance: data.closing_balance, notes: data.notes }),
    onSuccess: (response) => {
      if (response.success) {
        clearCurrentShift()
        toast.success(`Turno cerrado - Diferencia: ${formatCurrency(response.data?.shift.difference || 0)}`)
        setCloseShiftDialog(false)
        setClosingBalance("")
        setCloseNotes("")
        queryClient.invalidateQueries({ queryKey: ["current-shift"] })
        queryClient.invalidateQueries({ queryKey: ["shifts"] })
      }
    },
  })

  const registers = registersResponse?.data || []
  const shifts = shiftsResponse?.data || []

  // Update current shift from query if not in store
  if (currentShiftResponse?.success && currentShiftResponse.data && !currentShift) {
    setCurrentShift(currentShiftResponse.data)
  }

  const handleOpenShift = () => {
    if (!user || !selectedRegister || !openingBalance) return

    openShiftMutation.mutate({
      user_id: user.id,
      register_id: selectedRegister,
      opening_balance: Number.parseFloat(openingBalance),
    })
  }

  const handleCloseShift = () => {
    if (!currentShift || !closingBalance) return

    closeShiftMutation.mutate({
      shiftId: currentShift.id,
      closing_balance: Number.parseFloat(closingBalance),
      notes: closeNotes || undefined,
    })
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Caja</h1>
          <p className="text-muted-foreground">Control de turnos y movimientos de efectivo</p>
        </div>
        {currentShift ? (
          <Dialog open={closeShiftDialog} onOpenChange={setCloseShiftDialog}>
            <DialogTrigger asChild>
              <Button size="lg" variant="destructive">
                <LogOut className="w-5 h-5 mr-2" />
                Cerrar Turno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cerrar Turno</DialogTitle>
                <DialogDescription>Ingresa el monto final en caja para cerrar tu turno</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Saldo inicial:</span>
                      <span className="font-medium">{formatCurrency(currentShift.opening_balance)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Caja:</span>
                      <span className="font-medium">{currentShift.register_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Inicio:</span>
                      <span className="font-medium">{formatDate(currentShift.opened_at)}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-2">
                  <Label htmlFor="closing-balance">Saldo Final *</Label>
                  <Input
                    id="closing-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={closingBalance}
                    onChange={(e) => setClosingBalance(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Agregar notas sobre el cierre..."
                    value={closeNotes}
                    onChange={(e) => setCloseNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCloseShiftDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCloseShift} disabled={!closingBalance || closeShiftMutation.isPending}>
                  {closeShiftMutation.isPending ? "Cerrando..." : "Cerrar Turno"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={openShiftDialog} onOpenChange={setOpenShiftDialog}>
            <DialogTrigger asChild>
              <Button size="lg">
                <LogIn className="w-5 h-5 mr-2" />
                Abrir Turno
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Abrir Turno</DialogTitle>
                <DialogDescription>Selecciona la caja e ingresa el saldo inicial</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="register">Caja Registradora *</Label>
                  <Select value={selectedRegister} onValueChange={setSelectedRegister}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar caja..." />
                    </SelectTrigger>
                    <SelectContent>
                      {registers.map((register) => (
                        <SelectItem key={register.id} value={register.id}>
                          {register.name} {register.location && `- ${register.location}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opening-balance">Saldo Inicial *</Label>
                  <Input
                    id="opening-balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenShiftDialog(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleOpenShift}
                  disabled={!selectedRegister || !openingBalance || openShiftMutation.isPending}
                >
                  {openShiftMutation.isPending ? "Abriendo..." : "Abrir Turno"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {currentShift && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Turno Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Caja</p>
                <p className="font-bold">{currentShift.register_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Hora de Inicio</p>
                <p className="font-bold">{new Date(currentShift.opened_at).toLocaleTimeString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo Inicial</p>
                <p className="font-bold text-primary">{formatCurrency(currentShift.opening_balance)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estado</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                  <p className="font-bold text-accent">Activo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Turnos</CardTitle>
              <CardDescription>Últimos 50 turnos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shifts.map((shift) => (
                  <Card key={shift.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-medium">{shift.user_name}</p>
                          <p className="text-sm text-muted-foreground">{shift.register_name}</p>
                        </div>
                        {shift.status === "open" ? (
                          <div className="flex items-center gap-2 text-accent">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Abierto</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Cerrado</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Inicio</p>
                          <p className="font-medium">{formatDate(shift.opened_at)}</p>
                        </div>
                        {shift.closed_at && (
                          <div>
                            <p className="text-muted-foreground">Cierre</p>
                            <p className="font-medium">{formatDate(shift.closed_at)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-muted-foreground">Saldo Inicial</p>
                          <p className="font-medium">{formatCurrency(shift.opening_balance)}</p>
                        </div>
                        {shift.closing_balance !== undefined && (
                          <div>
                            <p className="text-muted-foreground">Saldo Final</p>
                            <p className="font-medium">{formatCurrency(shift.closing_balance)}</p>
                          </div>
                        )}
                        {shift.difference !== undefined && (
                          <div className="col-span-2">
                            <p className="text-muted-foreground">Diferencia</p>
                            <div className="flex items-center gap-2">
                              {shift.difference > 0 ? (
                                <TrendingUp className="w-4 h-4 text-accent" />
                              ) : shift.difference < 0 ? (
                                <TrendingDown className="w-4 h-4 text-destructive" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-muted-foreground" />
                              )}
                              <p
                                className={`font-bold ${
                                  shift.difference > 0
                                    ? "text-accent"
                                    : shift.difference < 0
                                      ? "text-destructive"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {formatCurrency(shift.difference)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Turnos Hoy</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">2 completados, 1 activo</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total en Caja</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatCurrency(8540)}</div>
                <p className="text-xs text-muted-foreground mt-1">Promedio por turno</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Diferencias</CardTitle>
                <TrendingUp className="w-4 h-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{formatCurrency(45.5)}</div>
                <p className="text-xs text-muted-foreground mt-1">Sobrantes del día</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}