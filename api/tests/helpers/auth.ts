import type { FastifyInstance } from "fastify";

let counter = 0;

/** Generate a unique test email to avoid conflicts between runs */
export function testEmail(prefix = "user") {
  return `test.${prefix}.${Date.now()}.${++counter}@test.klariti.dev`;
}

export async function signUp(
  app: FastifyInstance,
  email: string,
  name = "Test User",
  password = "password123",
): Promise<{ token: string; userId: string }> {
  const res = await app.inject({
    method: "POST",
    url: "/api/sign-up",
    payload: { name, email, password },
  });
  if (res.statusCode !== 200) {
    throw new Error(`sign-up failed (${res.statusCode}): ${res.body}`);
  }
  const body = res.json();
  return { token: body.token, userId: body.user.id };
}

export function authHeader(token: string) {
  return { authorization: `Bearer ${token}` };
}
