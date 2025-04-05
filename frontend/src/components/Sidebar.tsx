import { NavLink } from "react-router-dom";


const Sidebar = () => {
    const navItems=[
        {name:"Dashboard",path:"/"},
        {name:"Products",path:"/products"},
        {name:"Billing",path:"/billing"},
        {name:"Sales Reports",path:"/reports"},
        {name:"Inventory",path:"/inventory"},
        {name:"Users",path:"/users"},
    ]
    return (
        <aside>
            <h1></h1>
            <nav>
                {navItems.map((item)=>(<NavLink key={item.name}
                to={item.path} end
                className={({isActive})=> `block px-4 py-2 rounded transition ${isActive ? "bg-blue-600 text-white font-semibold":"hover:bg-gray-700"}`}>
                    {item.name}
                </NavLink>))}
           
            </nav>
        </aside>
      );
}

export default Sidebar