// "use server";

import { loginFormSchema, registerFormSchema } from "@/src/lib/schema/auth";
import z from "zod";

function createAuthApi() {
  const baseUrl = "http://localhost/api/auth";

  async function login(formData: z.infer<typeof loginFormSchema>) {
    const email = formData.email;
    const password = formData.password;

    if (!email || !password) {
      return new Response("Please enter an email and password", {
        status: 400,
      });
    }

    const url = `${baseUrl}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      console.error("Login failed", await res.json());
      return;
    }

    const data = await res.json();

    return data.user;
  }

  const register = async (formData: z.infer<typeof registerFormSchema>) => {
    const userName = formData.userName;
    const email = formData.email;
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    const url = `${baseUrl}/register`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        email,
        password,
        confirmPassword,
      }),
    });

    if (!res.ok) {
      console.error("Register failed", await res.json());
      return;
    }

    const data = await res.json();
    console.log({ data });
    return data;
  };

  const logout = async () => {
    const url = `${baseUrl}/logout`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!res.ok) {
      console.error("Logout failed", await res.json());
      throw new Error("Logout failed");
    }
    const data = await res.json();
    return data;
  };

  const getAuthUser = async () => {
    const url = `${baseUrl}/me`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    return data.user;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    console.log({ currentPassword, newPassword })
    const url = `${baseUrl}/update-password`;
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      console.error("Update password failed", await res.json());
      throw new Error("Update password failed");
    }
    const data = await res.json();
    return data;
  };
  return {
    login,
    register,
    logout,
    getAuthUser,
    updatePassword
  };
}

export const authApi = createAuthApi();
