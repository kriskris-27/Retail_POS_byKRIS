import { createContext , ReactNode, useContext ,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


type User = {
    email: string;
    role: string;
    token?: string;
    userId?: string;
};

type AuthContextType = {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    verifyAuth: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({children}:{children:ReactNode}) => {
    const [user,setUser] = useState<User | null>(()=>{
        const stored = sessionStorage.getItem("user");
        return stored ? JSON.parse(stored):null;
    });
    const navigate = useNavigate();

    useEffect(()=>{
        if(user){
            sessionStorage.setItem("user",JSON.stringify(user));
        }else{
            sessionStorage.removeItem("user");
        }
    },[user]);

    const verifyAuth = async () => {
        try {
            const token = sessionStorage.getItem("token");
            console.log("Verifying auth with token:", token ? "Token exists" : "No token");
            
            const res = await fetch(`${BASE_URL}/users/verify`, {
                method: "GET",
                credentials: "include",
                headers: token ? {
                    "Authorization": `Bearer ${token}`
                } : {}
            });

            console.log("Verify response status:", res.status);
            const data = await res.json();
            console.log("Verify response data:", data);

            if (!res.ok) {
                console.log("Auth verification failed");
                setUser(null);
                sessionStorage.removeItem("user");
                sessionStorage.removeItem("token");
                return false;
            }

            return true;
        } catch (err) {
            console.error("Auth verification failed:", err);
            return false;
        }
    };
 
    const login = async(email:string ,password:string)=>{
        try{
            console.log("Attempting login...");
            const res= await fetch(`${BASE_URL}/users/login`, {
                method:"POST",
                headers:{"Content-Type" : "application/json"},
                credentials:"include",
                body:JSON.stringify({email,password})
            });
            
            console.log("Login response status:", res.status);
            
            if(!res.ok) {
                const errorData = await res.json();
                console.log("Login error data:", errorData);
                throw new Error(errorData.message || "Login Failed");
            }
            
            const data = await res.json();
            console.log("Login successful, received data:", data);
            
            const userData = {
                email,
                role: data.role,
                token: data.token,
                userId: data.userId
            };
            
            // Validate token before storing
            if (!data.token) {
                console.log("No token received from server");
                throw new Error("No token received from server");
            }
            
            console.log("Storing user data and token");
            setUser(userData);
            // Store token in sessionStorage for mobile
            sessionStorage.setItem("token", data.token);
            console.log("Token stored in sessionStorage");
            
            // Verify auth immediately after login
            const isVerified = await verifyAuth();
            console.log("Initial auth verification:", isVerified ? "Success" : "Failed");
            
            navigate("/");
        }
        catch(err) {
            console.error("Login failed:", err);
            alert(err instanceof Error ? err.message : "Login failed: Invalid credentials or network issue");
        }
    };

    const logout = async() =>{
        try{
            const token = sessionStorage.getItem("token");
            console.log("Logging out with token:", token ? "Token exists" : "No token");
            
            if (!token) {
                throw new Error("No token found");
            }
            
            const res = await fetch(`${BASE_URL}/users/logout`,{
                method:"POST",
                credentials:"include",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            console.log("Logout response status:", res.status);
            
            setUser(null);
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            console.log("User data and token cleared");
            
            navigate("/login");
        }catch(err){
            console.error("Logout failed:", err);
            alert(err instanceof Error ? err.message : "Logout failed. Try again.");
        }
    };

    return (
        <AuthContext.Provider value={{user, login, logout, verifyAuth}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};

