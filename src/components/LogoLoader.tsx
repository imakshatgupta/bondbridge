import React from "react";

interface LogoLoaderProps {
  size?: "sm" | "md" | "lg";
  opacity?: number;
  pulseSpeed?: number;
  logoPath?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
  size = "md",
  opacity = 0.7,
  pulseSpeed = 1.5,
  logoPath = "/logo.png",
}) => {
  // Map size to actual dimensions
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-18 h-18",
    lg: "w-24 h-24",
  };

  // Convert opacity value to appropriate Tailwind class
  // Tailwind only supports specific opacity values
  const getOpacityClass = (value: number) => {
    const opacityValue = Math.round(value * 100);
    // Match to closest tailwind opacity class
    if (opacityValue <= 5) return "opacity-5";
    if (opacityValue <= 10) return "opacity-10";
    if (opacityValue <= 20) return "opacity-20";
    if (opacityValue <= 30) return "opacity-30";
    if (opacityValue <= 40) return "opacity-40";
    if (opacityValue <= 50) return "opacity-50";
    if (opacityValue <= 60) return "opacity-60";
    if (opacityValue <= 70) return "opacity-70";
    if (opacityValue <= 80) return "opacity-80";
    if (opacityValue <= 90) return "opacity-90";
    return "opacity-100";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className={`animate-[pulse_${pulseSpeed}s_ease-in-out_infinite] transform transition-all`}>
        <img 
          src={logoPath}
          alt="Logo" 
          className={`${sizeMap[size]} ${getOpacityClass(opacity)}`}
        />
      </div>
    </div>
  );
};

export default LogoLoader;
