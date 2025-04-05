import { createContext , ReactNode, useContext ,useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {email: string;token: string; role: string};

type AuthContextType={
    user:User|null;
    login:(email: string,password: string)=>Promise<void>;
    logout:()=>void;
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
        // if(email && password){
        //     setUser({email});
        //     navigate("/");
        // }

        try{
            const res= await fetch("https://retail-pos-bykris.onrender.com/api/users/login", {
                method:"POST",
                headers:{"Content-Type" : "application/json"},
                body:JSON.stringify({email,password})
            });
            if(!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();
            const userData = {
                email,
                token: data.token,
                role: data.role,
              };
            setUser(userData);
            sessionStorage.setItem("user", JSON.stringify(userData));
            navigate("/");
        }
        catch(err) {
            console.error("Login failed:",err);
            alert("Login failed: Invalid credentials or network issue");
        }
    };

    const logout = () =>{
        setUser(null);
        sessionStorage.removeItem("user");
        navigate("/login");
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

