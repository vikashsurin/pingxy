import z from "zod";

export const loginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(3, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export const registerFormSchema = z
  .object({
    userName: z
      .string()
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username must be at most 20 characters long"),
    email: z.email("Please enter a valid email address"),
    password: z
      .string()
      .min(3, "Password must be at least 3 characters long")
      .max(20, "Password must be at most 20 characters long"),
    confirmPassword: z
      .string()
      .min(3, "Password must be at least 3 characters long")
      .max(20, "Password must be at most 20 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
