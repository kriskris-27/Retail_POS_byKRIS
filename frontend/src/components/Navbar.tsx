import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const {logout,user} = useAuth();
    return (
        <div className="h-16 bg-gray-200 px-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Retail POS</h2>
          {user && (<button onClick={logout}>
            Logout
          </button>)}
        </div>
      );
}

export default Navbar