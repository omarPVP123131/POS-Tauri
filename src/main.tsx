import React from "react"
import ReactDOM from "react-dom/client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { invoke } from "@tauri-apps/api/core"
import App from "./App"
import "./styles/globals.css"

console.log("🚀 main.tsx ejecutándose...")

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
  // ⌨️ F11 para fullscreen
  React.useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.key === "F11") {
        e.preventDefault()
        
        try {
          const newState = await invoke<boolean>("toggle_fullscreen")
          console.log(`✅ Fullscreen: ${newState}`)
        } catch (err) {
          console.error("❌ Error toggling fullscreen:", err)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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