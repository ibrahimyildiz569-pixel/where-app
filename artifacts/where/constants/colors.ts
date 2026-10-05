/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    text: '#20342D',
    tint: '#1D4539',
    background: '#F7F6F0',
    foreground: '#20342D',
    card: '#FFFDF8',
    cardForeground: '#20342D',
    primary: '#1D4539',
    primaryForeground: '#FFFDF8',
    secondary: '#E9EEE8',
    secondaryForeground: '#29463B',
    muted: '#EFEEE8',
    mutedForeground: '#737B73',
    accent: '#E78E62',
    accentForeground: '#442A1D',
    destructive: '#B94F43',
    destructiveForeground: '#FFFFFF',
    border: '#E6E3D9',
    input: '#E6E3D9',
  },

  radius: 20,
};

export default colors;
