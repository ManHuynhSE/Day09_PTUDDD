import { api } from "../api/client";
import { User } from "../types";

// TODO BT9.4: PATCH /users/:id chỉ với { name, phone }.
// json-server trả cả `password` → PHẢI loại password khỏi kết quả trước khi return (đừng đưa mật khẩu vào store).

export async function updateProfile(id: number, data: Pick<User, "name" | "phone">): Promise<User> {
  const response = await api.patch<User & { password?: string }>(`/users/${id}`, data);
  const { password, ...userWithoutPassword } = response.data;
  return userWithoutPassword;
}
