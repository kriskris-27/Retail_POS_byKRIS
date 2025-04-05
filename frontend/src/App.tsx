import {Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Layout from "./components/Layout"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./routes/ProtectedRoute"
import Products from "./pages/Products"
import Billing from "./pages/Billing"
import Reports from "./pages/Reports"
import Inventory from "./pages/Inventory"
import Users from "./pages/Users"
import NotFound from "./pages/NotFound"


const App = () => {
  return (
    
    <Routes>
        <Route path="/login" element={<Login/>}/>

         <Route path="/" element={
            <ProtectedRoute>
                <Layout/>
            </ProtectedRoute>}>

        <Route index element={<Dashboard/>}/>
        <Route path="products" element={<Products/>}/>
        <Route path="billing" element={<Billing />} />
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="users" element={<Users />} />
        <Route path="*" element={<NotFound/>}/>
        </Route>
        
    </Routes>
  )
}

export default App