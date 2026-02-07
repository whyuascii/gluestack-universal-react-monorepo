import { type ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "purple";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

const sizeStyles = {
  sm: "px-1.5 py-0.5 text-xs",
  md: "px-2 py-1 text-sm",
};

export function Badge({ children, variant = "default", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}

// Convenience components for common statuses
export function StatusBadge({
  status,
}: {
  status:
    | "active"
    | "inactive"
    | "pending"
    | "suspended"
    | "trialing"
    | "past_due"
    | "canceled"
    | "expired"
    | "none";
}) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    active: { variant: "success", label: "Active" },
    inactive: { variant: "default", label: "Inactive" },
    pending: { variant: "warning", label: "Pending" },
    suspended: { variant: "error", label: "Suspended" },
    trialing: { variant: "info", label: "Trial" },
    past_due: { variant: "warning", label: "Past Due" },
    canceled: { variant: "default", label: "Canceled" },
    expired: { variant: "error", label: "Expired" },
    none: { variant: "default", label: "None" },
  };

  const { variant, label } = config[status] || {
    variant: "default" as BadgeVariant,
    label: status,
  };

  return <Badge variant={variant}>{label}</Badge>;
}

export function RoleBadge({
  role,
}: {
  role: "read_only" | "support_rw" | "super_admin" | "owner" | "admin" | "member";
}) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    super_admin: { variant: "error", label: "Super Admin" },
    support_rw: { variant: "warning", label: "Support RW" },
    read_only: { variant: "default", label: "Read Only" },
    owner: { variant: "purple", label: "Owner" },
    admin: { variant: "info", label: "Admin" },
    member: { variant: "default", label: "Member" },
  };

  const { variant, label } = config[role] || {
    variant: "default" as BadgeVariant,
    label: role,
  };

  return <Badge variant={variant}>{label}</Badge>;
}

export function FlagBadge({ flag }: { flag: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    at_risk: { variant: "error", label: "At Risk" },
    vip: { variant: "purple", label: "VIP" },
    do_not_contact: { variant: "warning", label: "Do Not Contact" },
    under_review: { variant: "info", label: "Under Review" },
    beta_tester: { variant: "success", label: "Beta Tester" },
  };

  const { variant, label } = config[flag] || {
    variant: "default" as BadgeVariant,
    label: flag,
  };

  return <Badge variant={variant}>{label}</Badge>;
}
