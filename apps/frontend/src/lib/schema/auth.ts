import z from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z
    .string()
    .min(3, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long"),
});


export const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z
    .string()
    .min(3, "Password must be at least 3 characters long")
    .max(20, "Password must be at most 20 characters long"),
  confirmPassword: z
    .string()
    .min(3, "Password must be at least 3 characters long")
    .max(20, "Password must be at most 20 characters long"),
  gender: z
    .string()
    .refine((val) => ["male", "female", 'other'].includes(val), {
      message: "Gender must be selected",
    }),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(100, "Age must be at most 100"),
  country: z.object({
    value: z.string().min(1),
    label: z.string(),
  }).nullable().refine((val) => val !== null, { message: "Country is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export const guestFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  gender: z
    .string()
    .refine((val) => ["male", "female", 'other'].includes(val), {
      message: "Gender must be selected",
    }),
  age: z
    .number()
    .min(18, "Age must be at least 18")
    .max(100, "Age must be at most 100"),
  country: z.object({
    value: z.string().min(1),
    label: z.string(),
  }).nullable().refine((val) => val !== null, { message: "Country is required" }),
});
