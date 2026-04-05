import { api } from "@/lib/api";

export async function updateProfile(data: { username: string; password: string }) {
  if (data.username) {
    await api.me.updateProfile({ body: { name: data.username } });
  }
  if (data.password) {
    await api.me.changePassword({ body: { currentPassword: "", newPassword: data.password } });
  }
  return await api.me.getProfile();
}
