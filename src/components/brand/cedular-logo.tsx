import React from "react";

type CedularLogoProps = {
  className?: string;
  title?: string;
};

export function CedularLogo({
  className,
  title = "Cedular",
}: CedularLogoProps) {
  return (
    <svg
      aria-label={title}
      className={className ? `text-primary ${className}` : "text-primary"}
      fill="none"
      height="64"
      role="img"
      viewBox="0 0 64 64"
      width="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect
        fill="currentColor"
        height="56"
        opacity="0.12"
        rx="16"
        width="56"
        x="4"
        y="4"
      />
      <path
        d="M44 20a16 16 0 1 0 0 24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
      <path
        d="M32 24v10l6 6"
        opacity="0.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="44" cy="20" fill="currentColor" r="3" />
    </svg>
  );
}
