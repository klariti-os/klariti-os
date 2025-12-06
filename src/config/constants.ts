export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = APP_ENV === 'production';

export const ROUTES = {
  AUTH_REDIRECT: IS_PRODUCTION ? '/join' : '/auth',
} as const;
