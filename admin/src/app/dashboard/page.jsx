"use client";

import { auth, storage } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import { LogOut, Gift, Image as ImageIcon, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Listen to auth state to get user info immediately
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    try {
      setIsUploading(true);
      
      const token = await auth.currentUser.getIdToken();
      const uid = auth.currentUser.uid;

      // Pack the file into FormData for our API Route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", token);
      formData.append("uid", uid);

      // We send the file to our NEXT.JS Backend API route to completely bypass browser CORS 
      const response = await fetch("/api/upload", {
          method: "POST",
          body: formData
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.error || "Upload failed");
      }
      
      // Update the user profile photoURL in Firebase Auth
      await updateProfile(auth.currentUser, {
        photoURL: data.url
      });

      // Force UI to refresh
      setUser({ ...auth.currentUser, photoURL: data.url });
      
      toast.success("Profile image updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
      setIsDropdownOpen(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        {/* Logo (Left side) */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0d3839] text-white shadow-sm">
            <Gift size={16} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            giftikko<span className="text-[#0d3839]">.</span>
          </span>
        </div>

        {/* Profile Dropdown Area (Right side) */}
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button Circular Avatar */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-center h-10 w-10 rounded-full border border-slate-200 bg-slate-50 overflow-hidden shadow-sm transition-transform active:scale-95 hover:border-[#0d3839] focus:outline-none focus:ring-2 focus:ring-[#0d3839] focus:ring-offset-2"
          >
            {isUploading ? (
              <Loader2 className="animate-spin text-slate-400" size={18} />
            ) : user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="h-full w-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <ImageIcon size={18} className="text-slate-400" />
            )}
          </button>

          {/* Hidden File Input */}
          <input 
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Dropdown Menu Panel */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 z-50">
              
              {/* Header inside dropdown */}
              <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {user?.email || "Admin User"}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">Administrator</p>
              </div>

              {/* Action Links */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <ImageIcon size={16} className="text-slate-400" />
                  {isUploading ? "Uploading..." : "Upload Profile Image"}
                </button>
                
                <div className="h-px bg-slate-100 my-1 mx-2"></div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-73px)] p-6">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-4 text-base max-w-sm mx-auto leading-relaxed">
              Welcome to the Giftikko Admin Portal. Select an option from the sidebar to begin managing operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
