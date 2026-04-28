import { scale, fScale } from './responsive';


export const Colors = {
    // Backgrounds
    background: '#FAF6EF',       // warm cream
    surface: '#FFFFFF',
    surfaceMuted: '#F2EBDC',     // tinted card
  
    // Brand
    primary: '#2D4A3E',          // deep forest
    primarySoft: '#5C7F6B',      // sage
    accent: '#C97B5A',           // warm terracotta
    accentSoft: '#E5B89B',
    lavender: '#A89FB8',
  
    // Text
    textPrimary: '#1F1F1D',
    textSecondary: '#6B6B66',
    textMuted: '#A39E94',
    textOnDark: '#F5F0E5',
  
    // States
    border: '#E8E1D5',
    borderStrong: '#D6CCB8',
    error: '#B64A3D',
    success: '#5C7F6B',
  };
  
  export const Spacing = {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
    xxl: scale(48),
  };
  
  export const Radius = {
    sm: scale(8),
    md: scale(12),
    lg: scale(20),
    xl: scale(28),
    pill: 999,
  };
  
  export const FontSizes = {
    xs: fScale(12),
    sm: fScale(14),
    md: fScale(16),
    lg: fScale(18),
    xl: fScale(22),
    xxl: fScale(28),
    display: fScale(36),
  };
  
  export const Fonts = {
    display: 'Fraunces_600SemiBold',
    displayItalic: 'Fraunces_400Regular_Italic',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodyBold: 'DMSans_700Bold',
  };
  
  export const Shadow = {
    soft: {
      shadowColor: '#2D2A24',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    medium: {
      shadowColor: '#2D2A24',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 20,
      elevation: 4,
    },
  };