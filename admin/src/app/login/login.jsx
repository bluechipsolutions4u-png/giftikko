"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Gift, Image as ImageIcon } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please enter email and password");

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login. Please check your credentials.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans text-slate-900">
      {/* Left Side Window */}
      <div className="flex w-full flex-col p-8 lg:w-[45%] xl:w-[40%] 2xl:w-[35%] lg:px-16 xl:px-24">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-16 lg:mb-24 mt-4 w-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0d3839] text-white">
              <Gift size={22} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              giftikko<span className="text-[#0d3839]">.</span>
            </span>
          </div>

          {/* Admin Image Bubble (Mobile Only - Top Right) */}
          <div className="lg:hidden relative group w-fit cursor-pointer">
            <div className="w-[44px] h-[44px] rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200 shadow-sm overflow-hidden relative">
              <ImageIcon size={18} className="text-slate-400" />
              {/* Invisible file input that handles the click */}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                title="Upload admin profile image" 
              />
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[400px] flex-1 mt-4 lg:mt-10">
          <h1 className="text-[34px] font-medium tracking-tight text-slate-900 mb-3">
            Welcome Back!
          </h1>
          <p className="text-[15px] text-slate-500 mb-10 leading-relaxed max-w-sm">
            Sign in to access your dashboard and continue managing giftikko operations.
          </p>

          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-800">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-[44px] pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-[#0d3839] focus:outline-none focus:ring-1 focus:ring-[#0d3839] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-slate-800">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-[44px] pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-[#0d3839] focus:outline-none focus:ring-1 focus:ring-[#0d3839] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-700 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-8 flex w-full justify-center rounded-xl bg-[#0d3839] py-4 text-[15px] font-medium text-white shadow-md hover:bg-[#0a2c2d] disabled:bg-[#0d3839]/70 disabled:cursor-not-allowed active:scale-[0.99] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d3839]"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side Window / Gradient Splash */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-center bg-gradient-to-br from-[#124243] via-[#0d3839] to-[#072425] p-12 lg:p-24 relative overflow-hidden">
        {/* Soft Background highlight to match UI glow */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#1d5c5e] rounded-full mix-blend-screen blur-[120px] opacity-20 pointer-events-none transform translate-x-1/3 -translate-y-1/3" />
        
        <div className="w-full max-w-[600px] relative z-10 flex flex-col justify-center">
          {/* Dummy Title & Subtitle */}
          <h2 className="text-[44px] xl:text-[52px] font-medium text-white leading-[1.15] tracking-tight mb-8">
            Manage Operations <br /> Seamlessly and Securely
          </h2>
          <p className="text-[17px] text-teal-100/70 leading-relaxed font-light mb-16 max-w-md">
            Giftikko admin dashboard provides a unified and secure interface to monitor all platform activities and user updates.
          </p>

          {/* Admin Profile Section */}
          <div className="flex items-center gap-5 mt-4 relative group w-fit cursor-pointer">
            {/* Circular Image Container */}
            <div className="w-[72px] h-[72px] rounded-full bg-black/20 flex items-center justify-center shrink-0 border-2 border-white/90 group-hover:border-teal-300 transition-colors overflow-hidden relative shadow-lg">
              <ImageIcon size={26} className="text-white/50 group-hover:scale-95 transition-transform" />
              
              {/* Hover overlay text */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <span className="text-[10px] text-white font-medium uppercase tracking-widest">Add</span>
              </div>
              
              {/* Invisible file input that handles the click */}
              <input 
                type="file" 
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                title="Upload admin profile image" 
              />
            </div>
            
            {/* Text Details */}
            <div className="flex flex-col">
              <h3 className="text-[22px] font-medium text-white tracking-wide">
                Giftikko Admin
              </h3>
              <p className="text-[16px] text-teal-50/80 mt-1">
                Super Administrator at Giftikko
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
