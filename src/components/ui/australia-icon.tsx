import React from "react";

interface AustraliaIconProps {
  className?: string;
}

const AustraliaIcon: React.FC<AustraliaIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 120 90"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Australian continent outline based on reference */}
      <path d="M20 45
               L18 40
               L15 35
               L13 30
               L15 25
               L20 22
               L25 20
               L30 18
               L35 17
               L40 16
               L45 15
               L50 14
               L55 13
               L60 12
               L65 11
               L70 10
               L75 11
               L80 13
               L85 15
               L88 18
               L90 22
               L92 26
               L94 30
               L96 35
               L98 40
               L100 45
               L102 50
               L100 55
               L98 60
               L95 63
               L90 65
               L85 67
               L80 68
               L75 69
               L70 68
               L65 67
               L60 66
               L55 65
               L50 64
               L45 63
               L40 62
               L35 60
               L30 58
               L25 55
               L22 50
               L20 45 Z"/>
      
      {/* Tasmania */}
      <ellipse cx="75" cy="78" rx="4" ry="3"/>
    </svg>
  );
};

export default AustraliaIcon;