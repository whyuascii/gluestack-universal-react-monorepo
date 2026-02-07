"use client";

import { Bug } from "lucide-react";

export default function DebugPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Debug</h1>
        <p className="text-gray-500 mt-1">Webhook events and system status</p>
      </div>

      <div className="admin-card flex flex-col items-center justify-center py-16">
        <Bug className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Coming Soon</h2>
        <p className="text-gray-500 mt-2">Debug tools are under development</p>
      </div>
    </div>
  );
}
