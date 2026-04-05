import type {
  AuthResponse,
  ChangeEmailResponse,
  ChangePasswordResponse,
  User,
} from "./schemas.js";

type AuthLikeUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  role?: string | null;
};

function toIsoString(value: Date | string | null | undefined) {
  if (value == null) return value ?? null;
  return value instanceof Date ? value.toISOString() : value;
}

export function serializeUser(user: AuthLikeUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    emailVerified: user.emailVerified,
    createdAt: toIsoString(user.createdAt)!,
    updatedAt: toIsoString(user.updatedAt)!,
    role: user.role ?? null,
  };
}

export function serializeAuthResponse(response: {
  token: string | null;
  user: AuthLikeUser;
}): AuthResponse {
  return {
    token: response.token,
    user: serializeUser(response.user),
  };
}

export function serializeChangeEmailResponse(response: {
  status: boolean;
  user?: AuthLikeUser | null;
  message?: string | null;
}): ChangeEmailResponse {
  return {
    status: response.status,
    user: response.user ? serializeUser(response.user) : undefined,
    message: response.message ?? null,
  };
}

export function serializeChangePasswordResponse(response: {
  token: string | null;
  user: AuthLikeUser;
}): ChangePasswordResponse {
  return {
    token: response.token,
    user: serializeUser(response.user),
  };
}
