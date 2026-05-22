import { loginFormSchema, registerFormSchema } from "@/src/lib/schema/auth";
import { authService } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";
import z from "zod";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (formData: z.infer<typeof loginFormSchema>) => {
      return await authService.login(formData);
    },
    onSuccess: (data) => {
      authService.setToken(data.token);
      authService.setAuthUser(data.user);
      window.location.href = "/chat";
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (formData: z.infer<typeof registerFormSchema>) => {
      return await authService.register(formData);
    },
    onSuccess: (data) => {
      authService.setToken(data.token);
      authService.setAuthUser(data.user);
      window.location.href = "/chat";
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (formData: { currentPassword: string; newPassword: string }) => {
      const res = await authService.updatePassword(formData.currentPassword, formData.newPassword);
      return res.data
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });
};
