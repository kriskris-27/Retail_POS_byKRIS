import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", roles: ["admin", "manager", "cashier"] },
    { name: "Products", path: "/products", roles: ["admin","manager"] },
    { name: "Billing", path: "/billing", roles: ["admin", "cashier"] },
    {name:"Total Bills",path:"/allbills",roles:["admin", "manager","cashier",]},
    { name: "Sales Reports", path: "/reports", roles: ["admin", "manager"] },
    { name: "Inventory", path: "/inventory", roles: ["admin", "manager","cashier"] },
    { name: "Users", path: "/users", roles: ["admin"] },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Retail POS</h1>
      <nav className="space-y-1">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end
            className={({ isActive }) =>
              `block px-4 py-2 rounded transition ${
                isActive
                  ? "bg-blue-600 text-white font-semibold"
                  : "hover:bg-gray-700 text-gray-200"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
