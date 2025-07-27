import React from "react";

interface AustraliaIconProps {
  className?: string;
}

const AustraliaIcon: React.FC<AustraliaIconProps> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20 35c5-8 15-10 25-8 8 1 15 3 20 8 3 3 8 5 12 8 5 4 8 10 10 16 1 4 2 8 0 12-1 3-4 5-6 8-3 4-5 9-10 11-4 2-9 1-13 3-3 1-5 4-8 5-4 2-9 0-13-1-5-2-10-5-13-10-2-3-3-7-5-10-2-4-5-7-6-11-1-5 0-10 2-15 2-6 5-11 5-16z" />
      <circle cx="25" cy="50" r="2" />
      <circle cx="35" cy="45" r="1.5" />
      <circle cx="45" cy="55" r="1" />
    </svg>
  );
};

export default AustraliaIcon;