// "use server";

import { loginFormSchema, registerFormSchema } from "@/src/lib/schema/auth";
import z from "zod";

function createAuthApi() {
  const baseUrl = "http://localhost/api/auth";

  async function login(formData: z.infer<typeof loginFormSchema>) {
    const userName = formData.userName;
    const password = formData.password;

    console.log("userName, password", userName, password)

    if (!userName || !password) {
      return new Response("Please enter a userName and password", {
        status: 400,
      });
    }

    const url = `${baseUrl}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, password }),
    });

    if (!res.ok) {
      console.error("Login failed", await res.json());
      return;
    }

    const data = await res.json();
    // const cookieStore = await cookies();
    // cookieStore.set("_Host-session", data.token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 30, // 30 days
    // });

    // redirect("/chat");

    return data.user;
  }

  const register = async (formData: z.infer<typeof registerFormSchema>) => {
    const userName = formData.userName;
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const age = formData.age;
    const gender = formData.gender;
    const country = formData.country;

    console.log({
      userName,
      password,
      confirmPassword,
      age,
      gender,
      country,
    });

    const url = `${baseUrl}/register`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userName,
        password,
        confirmPassword,
        age,
        gender,
        country: country.value,
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

  const guest = async (formData: FormData) => { };

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
  return {
    login,
    register,
    guest,
    logout,
    getAuthUser,
  };
}

export const authApi = createAuthApi();
