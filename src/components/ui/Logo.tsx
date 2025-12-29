import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ size = 40, className, priority = false }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="LibreTier Logo"
      width={size}
      height={size}
      priority={priority}
      className={className}
    />
  );
}
