import React from "react";

interface AustraliaIconProps {
  className?: string;
}

const AustraliaIcon: React.FC<AustraliaIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 120 80"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Australian continent */}
      <path d="M10 35
               C8 32 10 28 15 25
               C20 22 30 20 40 22
               C45 20 50 18 55 18
               C60 18 65 20 70 22
               C75 20 80 18 85 20
               C90 22 95 25 100 30
               C105 35 108 40 110 45
               C108 50 105 55 100 58
               C95 60 90 62 85 63
               C80 65 75 66 70 65
               C65 67 60 68 55 67
               C50 68 45 67 40 65
               C35 63 30 60 25 57
               C20 54 15 50 12 45
               C10 42 9 38 10 35 Z"/>
      
      {/* Tasmania */}
      <ellipse cx="75" cy="70" rx="6" ry="4"/>
      
      {/* Cape York Peninsula */}
      <path d="M65 15 C67 12 70 12 72 15 C70 18 67 20 65 18 Z"/>
    </svg>
  );
};

export default AustraliaIcon;