import { createContext , ReactNode, useContext ,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;


type User = {email: string;role: string};

type AuthContextType={
    user:User|null;
    login:(email: string,password: string)=>Promise<void>;
    logout:()=>Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider = ({children}:{children:ReactNode}) => {
    const [user,setUser] = useState<User | null>(()=>{
        const stored = sessionStorage.getItem("user");
        return stored ? JSON.parse(stored):null;
    })
    const navigate =useNavigate();

    useEffect(()=>{
        if(user){
            sessionStorage.setItem("user",JSON.stringify(user));
        }else{
            sessionStorage.removeItem("user");
        }
    },[user]);
 
    
    const login = async(email:string ,password:string)=>{
        try{
            const res= await fetch(`${BASE_URL}/users/login`, {
                method:"POST",
                headers:{"Content-Type" : "application/json"},
                credentials:"include",
                body:JSON.stringify({email,password})
            });
            
            if(!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Login Failed");
            }
            
            const data = await res.json();
            const userData = {
                email,
                role: data.role,
                token: data.token // Store token for mobile
            };
            
            // Validate token before storing
            if (!data.token) {
                throw new Error("No token received from server");
            }
            
            setUser(userData);
            // Store token in sessionStorage for mobile
            sessionStorage.setItem("token", data.token);
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
            if (!token) {
                throw new Error("No token found");
            }
            
            await fetch(`${BASE_URL}/users/logout`,{
                method:"POST",
                credentials:"include",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            
            setUser(null);
            sessionStorage.removeItem("user");
            sessionStorage.removeItem("token");
            navigate("/login");
        }catch(err){
            console.error("Logout failed:", err);
            alert(err instanceof Error ? err.message : "Logout failed. Try again.");
        }
    }
  return (
    <AuthContext.Provider value={{user,login,logout}}>
    {children}
    </AuthContext.Provider>
  )
}

export const useAuth = ()=>{
    const context = useContext(AuthContext);
    if(!context) throw new Error("useAuth must be used inside AuthProvider");
    return context;
};

