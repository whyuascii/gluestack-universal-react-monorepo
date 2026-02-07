"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import { authClient } from "@app/auth";
import { API_URL } from "@/lib/api";

/**
 * Admin Login Page
 *
 * Uses Better Auth for authentication, then checks admin_role on user.
 * No separate admin auth tables needed.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Debug: Log the API URL being used
    console.log("[Admin Login] API URL:", API_URL);

    try {
      // Use Better Auth to sign in
      console.log("[Admin Login] Attempting sign in...");
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        console.error("[Admin Login] Sign in error:", result.error);
        throw new Error(result.error.message || "Login failed");
      }

      console.log("[Admin Login] Sign in successful, checking admin role...");

      // Check if user has admin role by calling a simple endpoint
      const response = await fetch(`${API_URL}/rpc/admin/identity/me`, {
        credentials: "include",
      });

      if (!response.ok) {
        // Not an admin - sign out and show error
        console.error("[Admin Login] Not an admin, status:", response.status);
        await authClient.signOut();
        throw new Error("You don't have admin access");
      }

      console.log("[Admin Login] Admin access confirmed, redirecting...");
      router.push("/overview");
    } catch (err) {
      console.error("[Admin Login] Error:", err);
      // Provide more specific error message for connection issues
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setError(`Cannot connect to API at ${API_URL}. Is the API server running?`);
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-1">Internal Access Only</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Security Notice */}
        <p className="text-center text-slate-500 text-sm mt-4">
          This portal is for authorized personnel only.
          <br />
          All actions are logged.
        </p>
      </div>
    </div>
  );
}
