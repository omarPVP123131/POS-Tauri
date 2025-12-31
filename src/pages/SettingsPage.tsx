import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema y preferencias</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Módulo en Construcción</CardTitle>
          <CardDescription>Esta funcionalidad estará disponible próximamente</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Aquí podrás configurar impresoras, cajas, impuestos, permisos de usuarios y más.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
