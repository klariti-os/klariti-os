// Note: Font paths must be explicitly written as literals in the actual font declarations
// due to Next.js font loader limitations. This file serves as a reference for font paths.

// Editorial New Font Paths Reference
export const EDITORIAL_NEW_PATHS = {
  ULTRALIGHT: '../../../public/fonts/editorial-new/PPEditorialNew-Ultralight.otf',
  ULTRALIGHT_ITALIC: '../../../public/fonts/editorial-new/PPEditorialNew-UltralightItalic.otf',
  REGULAR: '../../../public/fonts/editorial-new/PPEditorialNew-Regular.otf',
  ITALIC: '../../../public/fonts/editorial-new/PPEditorialNew-Italic.otf',
  ULTRABOLD: '../../../public/fonts/editorial-new/PPEditorialNew-Ultrabold.otf',
  ULTRABOLD_ITALIC: '../../../public/fonts/editorial-new/PPEditorialNew-UltraboldItalic.otf',
};

// Font weights reference
export const FONT_WEIGHTS = {
  ULTRALIGHT: '200',
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMIBOLD: '600',
  BOLD: '700',
  ULTRABOLD: '800',
};

// Font styles reference
export const FONT_STYLES = {
  NORMAL: 'normal',
  ITALIC: 'italic',
};

// This serves as documentation for developers on how to use the fonts
export const FONT_USAGE_GUIDE = `
Font Usage in Next.js:

Due to Next.js font loader limitations, font paths must be explicitly written as literals.
You cannot use variables or constants for the font paths.

Example usage:

import localFont from 'next/font/local';

const ppEditorial = localFont({
  src: [
    {
      path: '../../../public/fonts/editorial-new/PPEditorialNew-Ultralight.otf',
      weight: '300',
      style: 'normal',
    }
  ],
  variable: '--font-pp-editorial',
  display: 'swap',
});

Reference this file for the correct paths to use in your components.
`;
