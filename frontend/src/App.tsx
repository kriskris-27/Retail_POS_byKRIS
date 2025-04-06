import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Products from "./pages/Products";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Inventory from "./pages/Inventory";
import Users from "./pages/Users";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const App = () => {
  return (
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />


      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="billing" element={<Billing />} />
      </Route>

     
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "manager"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="products" element={<Products />} />
      </Route>

     
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin", "manager","cashier"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<Inventory />} />
      </Route>

      
      <Route
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="users" element={<Users />} />
      </Route>

    
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
