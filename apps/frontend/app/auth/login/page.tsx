"use client";

import Input from "@/components/ui/Input";
import Primary from "@/components/ui/buttons/Primary";
import { login } from "@/lib/auth";

export default function Login() {
  const handleLogin = async (formData: FormData) => {
    const result = await login(formData);

    console.log("result", result);
  };
  return (
    <form
      className="flex flex-col border p-4 gap-6 rounded"
      action={handleLogin}
    >
      <Input
        name="username"
        label="Username"
        type="text"
        placeholder="username"
      />
      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="password"
      />
      <Primary label="Login" type="submit" />
    </form>
  );
}
