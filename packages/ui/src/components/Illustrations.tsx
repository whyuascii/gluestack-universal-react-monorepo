/**
 * Generic Illustration Components
 * Simple SVG illustrations
 */

import React from "react";

// Common props for SVG illustrations
type IllustrationProps = {
  className?: string;
};

type BoxIllustrationProps = {
  showItems?: boolean;
} & IllustrationProps;

export const BoxIllustration = ({ className, showItems = false }: BoxIllustrationProps) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple box container */}
    <rect
      x="50"
      y="150"
      width="300"
      height="130"
      rx="8"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="4"
    />
    <rect
      x="60"
      y="140"
      width="280"
      height="20"
      rx="4"
      fill="#d1d5db"
      stroke="#9ca3af"
      strokeWidth="2"
    />

    {showItems && (
      <>
        <circle cx="160" cy="200" r="20" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="240" cy="200" r="20" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
        <circle cx="200" cy="190" r="20" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" />
      </>
    )}
  </svg>
);

type AppIconProps = {
  useCurrentColor?: boolean;
} & IllustrationProps;

export const AppIcon = ({ className, useCurrentColor = false }: AppIconProps) => {
  const primary = useCurrentColor ? "currentColor" : "#6b7280";
  const secondary = useCurrentColor ? "currentColor" : "#9ca3af";
  const accent = useCurrentColor ? "currentColor" : "#d1d5db";

  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Simple geometric icon */}
      <rect x="16" y="16" width="32" height="32" rx="4" fill={accent} opacity="0.8" />
      <rect x="20" y="20" width="24" height="4" rx="2" fill={primary} />
      <rect x="20" y="30" width="24" height="4" rx="2" fill={secondary} opacity="0.9" />
      <rect x="20" y="40" width="16" height="4" rx="2" fill={secondary} opacity="0.7" />
    </svg>
  );
};
export const ListIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple list view */}
    <rect
      x="50"
      y="80"
      width="300"
      height="50"
      rx="6"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="2"
    />
    <rect
      x="50"
      y="140"
      width="300"
      height="50"
      rx="6"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="2"
    />
    <rect
      x="50"
      y="200"
      width="300"
      height="50"
      rx="6"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="2"
    />

    {/* Check marks */}
    <path
      d="M70 105 L80 115 L100 95"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M70 165 L80 175 L100 155"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="80" cy="225" r="8" fill="#d1d5db" />

    {/* Lines representing text */}
    <rect x="120" y="100" width="180" height="10" rx="2" fill="#9ca3af" opacity="0.5" />
    <rect x="120" y="160" width="150" height="10" rx="2" fill="#9ca3af" opacity="0.5" />
    <rect x="120" y="220" width="200" height="10" rx="2" fill="#9ca3af" opacity="0.5" />
  </svg>
);

export const ChartIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple bar chart */}
    <rect x="40" y="120" width="30" height="60" rx="4" fill="#9ca3af" />
    <rect x="85" y="90" width="30" height="90" rx="4" fill="#6b7280" />
    <rect x="130" y="110" width="30" height="70" rx="4" fill="#9ca3af" />

    {/* Axes */}
    <path d="M30 180 L170 180" stroke="#d1d5db" strokeWidth="2" />
    <path d="M30 40 L30 180" stroke="#d1d5db" strokeWidth="2" />
  </svg>
);

export const CalendarIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Calendar Page */}
    <rect
      x="40"
      y="40"
      width="120"
      height="130"
      rx="8"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="2"
    />

    {/* Header */}
    <rect x="40" y="40" width="120" height="30" rx="8" fill="#d1d5db" />
    <path d="M40 70 L160 70" stroke="#9ca3af" strokeWidth="2" />

    {/* Binding rings */}
    <rect x="65" y="30" width="4" height="20" rx="2" fill="#6b7280" />
    <rect x="95" y="30" width="4" height="20" rx="2" fill="#6b7280" />
    <rect x="125" y="30" width="4" height="20" rx="2" fill="#6b7280" />

    {/* Grid dots */}
    <circle cx="60" cy="90" r="3" fill="#9ca3af" />
    <circle cx="80" cy="90" r="3" fill="#9ca3af" />
    <circle cx="100" cy="90" r="3" fill="#9ca3af" />
    <circle cx="120" cy="90" r="3" fill="#9ca3af" />
    <circle cx="140" cy="90" r="3" fill="#9ca3af" />

    <circle cx="60" cy="110" r="3" fill="#6b7280" />
    <circle cx="80" cy="110" r="3" fill="#9ca3af" />
    <circle cx="100" cy="110" r="3" fill="#9ca3af" />
    <circle cx="120" cy="110" r="3" fill="#9ca3af" />
  </svg>
);

export const UsersIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Simple user avatars */}
    <circle cx="70" cy="80" r="30" fill="#d1d5db" stroke="#9ca3af" strokeWidth="2" />
    <circle cx="70" cy="70" r="12" fill="#9ca3af" />
    <path d="M45 95 Q45 85 55 80 Q65 75 70 75 Q75 75 85 80 Q95 85 95 95" fill="#9ca3af" />

    <circle cx="130" cy="80" r="30" fill="#d1d5db" stroke="#9ca3af" strokeWidth="2" />
    <circle cx="130" cy="70" r="12" fill="#9ca3af" />
    <path d="M105 95 Q105 85 115 80 Q125 75 130 75 Q135 75 145 80 Q155 85 155 95" fill="#9ca3af" />

    {/* Connection line */}
    <path d="M95 110 L105 110" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4 4" />
  </svg>
);

export const ShapeDecoration = ({
  className,
  rotation = 0,
  color = "#d1d5db",
}: IllustrationProps & {
  rotation?: number;
  color?: string;
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    style={{
      transform: `rotate(${rotation}deg)`,
    }}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="25" y="25" width="50" height="50" rx="8" fill={color} opacity="0.4" />
  </svg>
);

export const SyncIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Document/Checklist */}
    <rect
      x="45"
      y="40"
      width="110"
      height="120"
      rx="8"
      fill="#f3f4f6"
      stroke="#9ca3af"
      strokeWidth="2"
    />

    {/* Check marks */}
    <path
      d="M60 70 L66 76 L76 64"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="86" y="67" width="54" height="6" rx="3" fill="#d1d5db" />

    <path
      d="M60 100 L66 106 L76 94"
      stroke="#6b7280"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="86" y="97" width="54" height="6" rx="3" fill="#d1d5db" />

    <circle cx="68" cy="130" r="6" fill="#d1d5db" />
    <rect x="86" y="127" width="44" height="6" rx="3" fill="#d1d5db" />

    {/* Sync arrows */}
    <path
      d="M160 90 L170 100 L160 110"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 110 L30 100 L40 90"
      stroke="#9ca3af"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const RefreshIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Circular refresh arrows */}
    <path d="M100 40 A60 60 0 1 1 40 100" stroke="#9ca3af" strokeWidth="8" strokeLinecap="round" />
    <path d="M160 100 A60 60 0 1 1 100 40" stroke="#6b7280" strokeWidth="8" strokeLinecap="round" />

    {/* Arrow heads */}
    <path d="M35 90 L40 100 L50 95" fill="#9ca3af" />
    <path d="M110 35 L100 40 L105 50" fill="#6b7280" />

    {/* Center dot */}
    <circle cx="100" cy="100" r="8" fill="#d1d5db" />
  </svg>
);
