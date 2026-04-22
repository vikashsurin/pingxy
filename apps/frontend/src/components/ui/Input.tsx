import React from "react";

// 1. Extend the standard HTML input attributes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({
  label,
  type = "text",
  className = "",
  ...props
}: InputProps) {
  return (
    <label className="flex flex-col justify-start items-start gap-1 w-full ">
      {label && (
        <span className="text-sm text-gray-500 font-medium">{label}</span>
      )}
      <input
        autoComplete="on"
        type={type}
        className={`border border-gray-300 rounded py-1 px-2 w-full focus:outline-blue-500 ${className}`}
        {...props}
      />
    </label>
  );
}
