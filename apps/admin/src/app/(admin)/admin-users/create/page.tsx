"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Mail,
  User,
  AlertCircle,
  ArrowLeft,
  Check,
  Eye,
  Pencil,
  Crown,
} from "lucide-react";
import { useAdminAuthStore, hasMinimumRole } from "@/stores/admin-auth";
import { API_URL } from "@/lib/api";

type AdminRole = "read_only" | "support_rw" | "super_admin";

interface RoleOption {
  value: AdminRole;
  name: string;
  description: string;
  permissions: string[];
  icon: React.ElementType;
  color: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "read_only",
    name: "Read Only",
    description: "Can view data but cannot make changes",
    permissions: ["View users", "View tenants", "View metrics", "View audit logs"],
    icon: Eye,
    color: "bg-slate-100 border-slate-300 text-slate-600",
  },
  {
    value: "support_rw",
    name: "Support",
    description: "Can view and modify data, handle support requests",
    permissions: [
      "All Read Only permissions",
      "Edit user data",
      "Manage flags",
      "Impersonate users",
    ],
    icon: Pencil,
    color: "bg-yellow-50 border-yellow-300 text-yellow-700",
  },
  {
    value: "super_admin",
    name: "Super Admin",
    description: "Full access including managing other admins",
    permissions: [
      "All Support permissions",
      "Create/edit admin users",
      "Manage admin roles",
      "System configuration",
    ],
    icon: Crown,
    color: "bg-red-50 border-red-300 text-red-700",
  },
];

export default function CreateAdminUserPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuthStore();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AdminRole>("read_only");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isSuperAdmin = hasMinimumRole(adminUser?.adminRole || null, "super_admin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/rpc/admin/identity/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim() || undefined,
          roles: [selectedRole],
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to create admin user");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin-users");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Shield className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only Super Admins can create admin users</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Invite Sent!</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">
          An invitation email has been sent to <strong>{email}</strong>.
          <br />
          They will need to set their password to complete registration.
        </p>
        <Link
          href="/admin-users"
          className="mt-6 text-primary-600 hover:text-primary-700 font-medium"
        >
          Back to Admin Users
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/admin-users"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Users
      </Link>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Admin User</h1>
        <p className="text-gray-500 mt-1">
          Invite a new admin user to the portal. They will receive an email to set their password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Email Input */}
        <div className="admin-card">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="admin@company.com"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            The user will receive an invitation at this email address
          </p>
        </div>

        {/* Name Input */}
        <div className="admin-card">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name (optional)
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Role Selection */}
        <div className="admin-card">
          <label className="block text-sm font-medium text-gray-700 mb-4">Admin Role *</label>
          <div className="space-y-3">
            {ROLE_OPTIONS.map((role) => (
              <label
                key={role.value}
                className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  selectedRole === role.value
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value as AdminRole)}
                  className="sr-only"
                />
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${role.color}`}
                >
                  <role.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{role.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{role.description}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {role.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedRole === role.value && (
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. The user will receive an invitation email</li>
            <li>2. They click the link and set their password</li>
            <li>3. After setting password, they can log in to the admin portal</li>
            <li>4. All actions are logged in the audit trail</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isLoading || !email}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending Invite..." : "Send Invitation"}
          </button>
          <Link
            href="/admin-users"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
