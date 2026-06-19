import React from "react";

interface BadgeProps {
  label: string;
  color?: "green" | "amber" | "gray" | "red";
}

const COLORS = {
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  gray: "bg-gray-100 text-gray-700",
  red: "bg-red-100 text-red-700",
};

export function Badge({ label, color = "gray" }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[color]}`}>
      {label}
    </span>
  );
}
