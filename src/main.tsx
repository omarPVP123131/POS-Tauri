import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import App from "./App"
import "./styles/globals.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function Root() {
  const [ready, setReady] = React.useState(false)
  
  React.useEffect(() => {
    (async () => {
      try {
        // Espera a que el backend confirme que está listo (init_app hace SELECT 1)
        await invoke("init_app")
        // Luego pide a Tauri que cierre el splash y muestre la ventana principal
        await invoke("close_splash")
        setReady(true)
      } catch (error) {
        console.error("Error en init sequence:", error)
      }
    })()
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>
)
