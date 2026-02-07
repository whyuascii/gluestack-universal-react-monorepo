"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Flag,
  UserCog,
  Shield,
  ScrollText,
  Bug,
  LogOut,
} from "lucide-react";
import { useAdminAuthStore } from "@/stores/admin-auth";

const navigation = [
  {
    name: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    roles: ["read_only", "support_rw", "super_admin"],
    exact: true,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
    roles: ["read_only", "support_rw", "super_admin"],
  },
  {
    name: "Tenants",
    href: "/tenants",
    icon: Building2,
    roles: ["read_only", "support_rw", "super_admin"],
  },
  {
    name: "Flags",
    href: "/flags",
    icon: Flag,
    roles: ["read_only", "support_rw", "super_admin"],
  },
  {
    name: "Impersonation",
    href: "/impersonation",
    icon: UserCog,
    roles: ["support_rw", "super_admin"],
  },
  {
    name: "Admin Users",
    href: "/admin-users",
    icon: Shield,
    roles: ["super_admin"],
  },
  {
    name: "Audit Logs",
    href: "/audit",
    icon: ScrollText,
    roles: ["read_only", "support_rw", "super_admin"],
  },
  {
    name: "Debug",
    href: "/debug",
    icon: Bug,
    roles: ["read_only", "support_rw", "super_admin"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { adminUser, logout } = useAdminAuthStore();
  const userRole = adminUser?.adminRole || "read_only";

  // Filter nav items based on role
  const visibleNav = navigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="admin-sidebar flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Admin Portal</div>
            <div className="text-xs text-slate-400">Dogfoo Internal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {visibleNav.map((item) => {
          // For exact match routes (like Dashboard), only match the exact path
          // For other routes, match the path or any child paths
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-500 text-white shadow-md"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium">
              {adminUser?.name?.[0]?.toUpperCase() || adminUser?.email?.[0]?.toUpperCase() || "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {adminUser?.name || "Admin User"}
            </div>
            <div className="text-xs text-slate-400 truncate">{adminUser?.email}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded ${
              userRole === "super_admin"
                ? "bg-red-500/20 text-red-300"
                : userRole === "support_rw"
                  ? "bg-yellow-500/20 text-yellow-300"
                  : "bg-slate-500/20 text-slate-300"
            }`}
          >
            {userRole?.replace("_", " ").toUpperCase()}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
