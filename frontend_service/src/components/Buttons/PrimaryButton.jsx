import React from "react";

const PrimaryButton = ({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseClasses =
    "relative overflow-hidden font-medium transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 shadow-lg hover:shadow-xl",
    secondary:
      "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl",
    danger: "bg-red-600 hover:bg-red-700 text-white border border-red-500/50",
    success:
      "bg-green-600 hover:bg-green-700 text-white border border-green-500/50",
    ghost: "bg-transparent hover:bg-white/10 text-white border border-white/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-lg",
    md: "px-4 py-2 text-base rounded-xl",
    lg: "px-6 py-3 text-lg rounded-xl",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <span className={loading ? "opacity-0" : "opacity-100"}>{children}</span>
    </button>
  );
};

export default PrimaryButton;
