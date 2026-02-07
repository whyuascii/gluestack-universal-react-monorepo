"use client";

import { UserCog } from "lucide-react";

export default function ImpersonationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Impersonation</h1>
        <p className="text-gray-500 mt-1">View and manage user impersonation sessions</p>
      </div>

      <div className="admin-card flex flex-col items-center justify-center py-16">
        <UserCog className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-gray-500 mt-2">Impersonation management is under development</p>
      </div>
    </div>
  );
}
