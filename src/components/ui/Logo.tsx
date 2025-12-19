import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 40, className, priority = false }: LogoProps) {
  return (
    <Image
      src="/tier_list_logo.png"
      alt="Tier List Logo"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
