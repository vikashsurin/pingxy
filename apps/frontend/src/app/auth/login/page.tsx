"use client";

import Input from "@/src/components/ui/Input";
import Primary from "@/src/components/ui/buttons/Primary";

import { authManager } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";

export default function Login() {
  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      return await authManager.login(formData);
    },

    onSuccess: (data) => {
      console.log({ dataFromLogin: data });
      authManager.setToken(data.token);
      authManager.setAuthUser(data.user);
      window.location.href = "/chat";
    },
    onError: (error) => {
      console.log({ errorFromLogin: error });
    },
  });

  const handleLogin = async (formData: FormData) => {
    console.log("hsdfsdf");
    mutate(formData);
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
