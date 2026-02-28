import { getApiMe, patchApiMe, postApiMeChangePassword } from '@klariti/api-client';

export async function getProfile() {
  return await getApiMe();
}

export async function updateProfile(data: { username: string; password: string }) {
  // Update username (PATCH /me)
  if (data.username) {
    await patchApiMe({ body: { name: data.username } });
  }
  // Update password (POST /me/change-password)
  if (data.password) {
    await postApiMeChangePassword({ body: { currentPassword: '', newPassword: data.password } });
  }
  // Refetch profile after update
  return await getApiMe();
}
