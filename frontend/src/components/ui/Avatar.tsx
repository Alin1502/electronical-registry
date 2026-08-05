import React from "react";
import { useAuthStore } from "@/store/authStore";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: number; // pixels
  className?: string;
}

export function Avatar({ src, name, size = 32, className }: AvatarProps) {
  const profile = useAuthStore((s) => s.profile);
  const avatarSrc = src ?? profile?.avatar_url ?? null;
  const displayName = name ?? profile?.username ?? "?";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const dim = `${size}px`;

  if (avatarSrc) {
    return (
      <img
        src={avatarSrc}
        alt={displayName}
        className={`rounded-full object-cover ${className ?? ""}`}
        style={{ width: dim, height: dim }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-muted border border-border flex items-center justify-center text-xs font-medium text-muted-foreground ${className ?? ""}`}
      style={{ width: dim, height: dim }}
    >
      {initials}
    </div>
  );
}

export default Avatar;
