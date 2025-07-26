"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, TestTube2 } from "lucide-react";

// NOTE: Ensure you have a way to include a font like 'Inter' in your project's head
// for the best visual result, e.g., in your main layout.tsx:
// <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />

export default function LoginPage() {
  const router = useRouter();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Enable the login button only when both fields have text
    const isFilled = user.email.trim() !== "" && user.password.trim() !== "";
    setButtonDisabled(!isFilled);
  }, [user]);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/users/login", user);
      console.log("✅ Login success", response.data);
      toast.success("Welcome back!");
      router.push("/"); // Redirect to home or dashboard on successful login
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);
      toast.error(error.response?.data?.error || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleTestMode = () => {
    // Redirect to a test mode or a different page
    router.push("/?test=true");
  };

  return (
    <div className="min-h-screen bg-[#131314] text-gray-200 flex items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-[#1E1F20] border-gray-700 shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-gray-100 mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue
            </p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="email"
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="you@example.com"
                  className="pl-10 h-12 bg-[#2a2b2c] border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30 rounded-lg"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={user.password}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-12 bg-[#2a2b2c] border-gray-600 text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/30 rounded-lg"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={onLogin}
              disabled={buttonDisabled || loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Test Mode Button */}
            <Button
              onClick={handleTestMode}
              variant="outline"
              className="w-full h-12 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500 font-medium rounded-lg transition-all duration-200"
            >
              <TestTube2 className="h-5 w-5 mr-2" />
              Continue as Test User
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4">
              <p className="text-gray-400 text-sm">
                Don't have an account?{" "}
                <Link 
                  href="/signup" 
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
