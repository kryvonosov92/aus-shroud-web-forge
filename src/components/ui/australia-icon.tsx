import React from "react";

interface AustraliaIconProps {
  className?: string;
}

const AustraliaIcon: React.FC<AustraliaIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 100 80"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Main Australia landmass */}
      <path d="M15 45c3-8 8-12 15-15 6-2 12-3 18-2 5 1 10 2 15 4 4 2 8 3 12 6 3 2 6 5 9 8 2 2 4 5 6 8 1 3 2 6 3 9 1 4 1 8 0 12-1 3-3 6-5 8-2 3-5 5-8 7-4 2-8 3-12 4-5 1-10 1-15 0-4-1-8-3-12-5-3-2-6-5-9-8-2-2-4-5-5-8-2-4-3-8-3-12-1-5 0-10 2-15 1-3 3-6 4-9z"/>
      
      {/* Western Australia bump */}
      <path d="M12 35c2-3 5-5 8-6 2-1 5-1 7 0 2 1 3 3 4 5 1 3 1 6 0 9-1 2-3 4-5 5-2 1-5 1-7 0-3-1-5-3-6-6-1-2-1-5-1-7z"/>
      
      {/* Northern Territory/Queensland coastline */}
      <path d="M35 15c3-2 6-3 9-3 4 0 8 1 11 3 3 2 5 5 7 8 1 2 2 4 2 6 0 3-1 6-3 8-2 2-5 3-8 3-3 0-6-1-8-3-2-2-3-5-3-8 0-2 1-4 2-6 1-3 3-5 5-8z"/>
      
      {/* Tasmania */}
      <ellipse cx="70" cy="65" rx="4" ry="3"/>
      
      {/* Cape York Peninsula */}
      <path d="M55 10c1-1 2-1 3-1 1 0 2 0 3 1 1 1 1 2 1 3 0 2-1 3-2 4-1 1-2 1-3 1-1 0-2-1-3-2 0-1-1-2 0-3 0-1 1-2 1-3z"/>
    </svg>
  );
};

export default AustraliaIcon;