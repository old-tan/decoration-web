import RootRoute from "./router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
// Create a client
const queryClient = new QueryClient()

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RootRoute />
    </QueryClientProvider>
  )
}

export default App
