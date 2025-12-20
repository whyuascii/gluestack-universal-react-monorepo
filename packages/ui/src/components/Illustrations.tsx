/**
 * NestQuest Illustration Components
 * SVG illustrations for the landing page
 */

import React from "react";

// Common props for SVG illustrations
type IllustrationProps = {
  className?: string;
};

export const NestIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 400 300" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Base Nest Structure - Woven twigs look */}
    <path
      d="M50 200 C50 200 80 280 200 280 C320 280 350 200 350 200"
      stroke="#8B7355"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M60 190 C60 190 90 260 200 260 C310 260 340 190 340 190"
      stroke="#A68B6A"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M70 210 C100 270 300 270 330 210"
      stroke="#8B7355"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M40 180 C80 250 320 250 360 180"
      stroke="#8B7355"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />

    {/* Leaves woven in */}
    <path d="M40 180 Q20 160 40 140 Q60 160 40 180" fill="#A8CBB7" />
    <path d="M360 180 Q380 160 360 140 Q340 160 360 180" fill="#A8CBB7" />
    <path d="M100 250 Q80 240 90 220 Q110 230 100 250" fill="#A8CBB7" />
    <path d="M300 250 Q320 240 310 220 Q290 230 300 250" fill="#A8CBB7" />

    {/* Eggs/Cozy items inside */}
    <ellipse
      cx="160"
      cy="180"
      rx="35"
      ry="45"
      fill="#FFF9F0"
      stroke="#FAD97A"
      strokeWidth="3"
      transform="rotate(-15 160 180)"
    />
    <ellipse
      cx="240"
      cy="180"
      rx="35"
      ry="45"
      fill="#FFF9F0"
      stroke="#A8CBB7"
      strokeWidth="3"
      transform="rotate(15 240 180)"
    />
    <ellipse cx="200" cy="170" rx="35" ry="45" fill="#FFF9F0" stroke="#FAD97A" strokeWidth="3" />

    {/* Decorative hearts floating above */}
    <path
      d="M180 100 C180 100 170 90 160 100 C150 110 160 120 180 130 C200 120 210 110 200 100 C190 90 180 100 180 100"
      fill="#FAD97A"
      className="animate-bounce"
    />
    <path
      d="M220 80 C220 80 210 70 200 80 C190 90 200 100 220 110 C240 100 250 90 240 80 C230 70 220 80 220 80"
      fill="#A8CBB7"
      className="animate-bounce"
      style={{ animationDelay: "2s" }}
    />
  </svg>
);

export const PlantIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Pot */}
    <path
      d="M60 140 L70 180 L130 180 L140 140"
      fill="#8B7355"
      stroke="#4E3F30"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M50 140 L150 140"
      stroke="#4E3F30"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Stem */}
    <path
      d="M100 140 C100 140 100 100 100 60"
      stroke="#A8CBB7"
      strokeWidth="4"
      strokeLinecap="round"
    />

    {/* Leaves Growing */}
    <path
      d="M100 110 Q130 100 140 80 Q120 80 100 110"
      fill="#A8CBB7"
      stroke="#4E3F30"
      strokeWidth="2"
    />
    <path d="M100 90 Q70 80 60 60 Q90 60 100 90" fill="#A8CBB7" stroke="#4E3F30" strokeWidth="2" />
    <path
      d="M100 60 Q130 50 140 30 Q120 30 100 60"
      fill="#FAD97A"
      stroke="#4E3F30"
      strokeWidth="2"
    />

    {/* Sparkles */}
    <circle cx="150" cy="50" r="3" fill="#FAD97A" className="animate-pulse" />
    <circle
      cx="50"
      cy="80"
      r="2"
      fill="#FAD97A"
      className="animate-pulse"
      style={{ animationDelay: "2s" }}
    />
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
      rx="10"
      fill="#FFF9F0"
      stroke="#8B7355"
      strokeWidth="3"
    />

    {/* Header */}
    <path d="M40 70 L160 70" stroke="#8B7355" strokeWidth="2" />
    <rect x="40" y="40" width="120" height="30" rx="10" fill="#A8CBB7" fillOpacity="0.3" />

    {/* Rings */}
    <path d="M70 30 L70 50" stroke="#4E3F30" strokeWidth="3" strokeLinecap="round" />
    <path d="M100 30 L100 50" stroke="#4E3F30" strokeWidth="3" strokeLinecap="round" />
    <path d="M130 30 L130 50" stroke="#4E3F30" strokeWidth="3" strokeLinecap="round" />

    {/* Heart Date */}
    <path
      d="M100 110 C100 110 90 100 80 110 C70 120 80 130 100 140 C120 130 130 120 120 110 C110 100 100 110 100 110"
      fill="#FAD97A"
      stroke="#8B7355"
      strokeWidth="2"
    />

    {/* Scribbles */}
    <path d="M60 90 H80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <path d="M120 90 H140" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    <path d="M60 150 H80" stroke="#8B7355" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
  </svg>
);

export const BirdsIllustration = ({ className }: IllustrationProps) => (
  <svg viewBox="0 0 200 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Branch */}
    <path
      d="M20 160 C60 150 140 155 180 140"
      stroke="#8B7355"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path d="M140 150 L160 170" stroke="#8B7355" strokeWidth="3" strokeLinecap="round" />

    {/* Bird 1 */}
    <path
      d="M60 135 C50 135 40 125 40 115 C40 105 50 100 60 100 C70 100 80 105 80 115 C80 125 70 135 60 135 Z"
      fill="#A8CBB7"
    />
    <path d="M80 115 L90 110" stroke="#A8CBB7" strokeWidth="3" strokeLinecap="round" />
    <circle cx="55" cy="110" r="2" fill="#4E3F30" />

    {/* Bird 2 */}
    <path
      d="M110 130 C100 130 90 120 90 110 C90 100 100 95 110 95 C120 95 130 100 130 110 C130 120 120 130 110 130 Z"
      fill="#FAD97A"
    />
    <path d="M90 110 L80 105" stroke="#FAD97A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="115" cy="105" r="2" fill="#4E3F30" />

    {/* Heart between them */}
    <path
      d="M85 80 C85 80 82 75 80 80 C75 85 80 90 85 95 C90 90 95 85 90 80 C88 75 85 80 85 80"
      fill="#F4AFA6"
      className="animate-pulse"
    />
  </svg>
);

export const LeafDecoration = ({
  className,
  rotation = 0,
  color = "#A8CBB7",
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
    <path
      d="M50 90 C50 90 20 60 20 40 C20 20 40 10 50 10 C60 10 80 20 80 40 C80 60 50 90 50 90 Z"
      fill={color}
      opacity="0.6"
    />
    <path d="M50 10 L50 90" stroke="#FFF" strokeWidth="1" opacity="0.5" />
  </svg>
);
