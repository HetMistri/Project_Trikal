import React from "react";

const IconButton = ({
  icon,
  onClick,
  variant = "default",
  size = "md",
  disabled = false,
  className = "",
  tooltip,
  ...props
}) => {
  const baseClasses =
    "relative flex items-center justify-center transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    default:
      "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl hover:scale-105",
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 shadow-lg hover:shadow-xl hover:scale-105",
    ghost: "bg-transparent hover:bg-white/10 text-white hover:scale-105",
    danger:
      "bg-red-600/80 hover:bg-red-700 text-white border border-red-500/50 hover:scale-105",
  };

  const sizes = {
    sm: "w-8 h-8 text-sm rounded-lg",
    md: "w-10 h-10 text-base rounded-xl",
    lg: "w-12 h-12 text-lg rounded-xl",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      {...props}
    >
      {icon}
    </button>
  );
};

export default IconButton;
