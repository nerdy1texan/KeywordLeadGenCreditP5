'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';

export const Logo = ({ size }: { size: number }) => {
  const { resolvedTheme } = useTheme();

  const logoSrc = resolvedTheme === 'dark' 
    ? '/logo_dark.svg'  // Light logo for dark theme
    : '/logo_light.svg';  // Dark logo for light theme

  return (
    <Image
      src={logoSrc}
      alt="Logo"
      width={size}
      height={size}
      style={{ width: 'auto', height: 'auto' }}
    />
  );
};