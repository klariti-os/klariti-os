// src/config/constants.ts
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const ROUTES = {
  AUTH_REDIRECT: IS_PRODUCTION ? '/join' : '/auth',
} as const;