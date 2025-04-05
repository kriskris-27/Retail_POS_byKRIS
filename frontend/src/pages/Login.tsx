import { useEffect, useState } from "react";

// import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, logout,user} = useAuth();
  useEffect(() => {
    if (user) {
      logout(); // Ends session and redirects to /login
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 font-[Poppins]">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img  alt="Logo" className="w-[50px]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-4 px-2 border-0 border-b border-black outline-none text-base"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-4 px-2 border-0 border-b border-black outline-none text-base"
          />
          <button
            type="submit"
            className="w-full py-4 bg-black text-white rounded-full font-semibold text-base transition hover:bg-white hover:text-black hover:border hover:border-black"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
