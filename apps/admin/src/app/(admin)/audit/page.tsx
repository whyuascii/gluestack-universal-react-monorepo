"use client";

import { ScrollText } from "lucide-react";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">View admin activity and audit trail</p>
      </div>

      <div className="admin-card flex flex-col items-center justify-center py-16">
        <ScrollText className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-gray-500 mt-2">Audit log viewing is under development</p>
      </div>
    </div>
  );
}
