import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // 🔥 IMPORTANT

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // 🔥 use this

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        { email, password }
      );

      // 🔥 IMPORTANT: context login call
      login(res.data.token, res.data.user);

      // 🔥 redirect to dashboard
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-4">
      
      {/* LOGO */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-3">
          ⚡
        </div>
        <h1 className="text-2xl font-bold text-white">ShortLink</h1>
        <p className="text-gray-400 text-sm">URL shortener with analytics</p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6 shadow-lg">
        
        <h2 className="text-lg font-semibold text-white mb-6">
          Create your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <div>
            <label className="text-sm text-gray-400">Email address</label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full mt-1 p-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="text-sm text-gray-400">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full mt-1 p-2 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition py-2 rounded-lg text-white font-medium"
          >
            Create Account
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-sm text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}