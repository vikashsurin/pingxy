import { loginFormSchema, registerFormSchema, guestFormSchema } from "@/src/lib/schema/auth";
import { authManager } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";
import z from "zod";


export const useLogin = () => {
  return useMutation({
    mutationFn: async (formData: z.infer<typeof loginFormSchema>) => {
      return await authManager.login(formData);
    },
    onSuccess: (data) => {
      authManager.setToken(data.token);
      authManager.setAuthUser(data.user);
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
      return await authManager.register(formData);
    },
    onSuccess: (data) => {
      authManager.setToken(data.token);
      authManager.setAuthUser(data.user);
      window.location.href = "/chat";
    },
    onError: (error) => {
      console.log(error);
    },
  });
};


export const useGuestLogin = () => {
  return useMutation({
    mutationFn: async (formData: z.infer<typeof guestFormSchema>) => {
      return await authManager.guestLogin(formData);
    },
    onSuccess: (data) => {

    },
    onError: (error) => {
      console.log(error);
    },
  });
};
