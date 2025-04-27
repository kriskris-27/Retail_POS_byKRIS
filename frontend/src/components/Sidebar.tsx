import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
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
    <aside 
      className={`bg-gray-800 text-white h-full transition-all duration-300 ease-in-out ${
        isOpen ? "w-64" : "w-0 md:w-16"
      } overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        <div className={`p-4 ${!isOpen && "md:justify-center"} flex items-center`}>
          <h1 className={`text-2xl font-bold ${!isOpen && "md:hidden"}`}>Bill Vision</h1>
          {!isOpen && <span className="hidden md:block text-xl font-bold">BV</span>}
        </div>
        
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded transition ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold"
                    : "hover:bg-gray-700 text-gray-200"
                } ${!isOpen && "md:justify-center"}`
              }
            >
              <span className={`${!isOpen && "md:hidden"}`}>{item.name}</span>
              {!isOpen && (
                <span className="hidden md:block font-bold">
                  {item.name.charAt(0)}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
