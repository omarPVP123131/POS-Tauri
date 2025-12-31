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
        await invoke("init_app")
        await invoke("close_splash")
        setReady(true)
      } catch (error) {
        console.error("Error en init sequence:", error)
      }
    })()
  }, [])

  // ⌨️ F11 usando el comando de Rust
  React.useEffect(() => {
    if (!ready) return

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        console.log("🎯 F11 pressed")
        
        try {
          const newState = await invoke<boolean>("toggle_fullscreen")
          console.log(`✅ Fullscreen: ${newState}`)
        } catch (err) {
          console.error("❌ Error toggling fullscreen:", err)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    console.log("✅ F11 listener registered")

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [ready])

  return <App />
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>
)