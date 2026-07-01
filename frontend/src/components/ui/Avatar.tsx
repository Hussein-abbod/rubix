interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-14 h-14 text-sm",
  xl: "w-20 h-20 text-lg",
};

const initialsFromName = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const avatarColors = [
  "bg-primary-container text-on-primary-container",
  "bg-secondary-container text-on-secondary-container",
  "bg-tertiary-container text-on-tertiary-container",
  "bg-surface-variant text-on-surface-variant",
];

const hashColor = (name?: string) => {
  if (!name) return 0;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarColors.length;
};

export function Avatar({ src, name, size = "md", className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "Avatar"}
        className={`${sizeMap[size]} rounded-full border-2 border-white/50 object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} ${avatarColors[hashColor(name)]} rounded-full border-2 border-white/50 flex items-center justify-center font-bold ${className}`}
    >
      {initialsFromName(name)}
    </div>
  );
}
