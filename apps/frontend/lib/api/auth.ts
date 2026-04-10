// "use server";

// import { cookies } from "next/headers";

function createAuthApi() {
  const baseUrl = "http://localhost/api/auth";

  async function login(formData: FormData) {
    const username = formData.get("username");
    const password = formData.get("password");

    if (!username || !password) {
      return new Response("Please enter a username and password", {
        status: 400,
      });
    }

    const url = `${baseUrl}/login`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
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

  const register = async (formData: FormData) => {
    const username = formData.get("username");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const age = formData.get("age");
    const gender = formData.get("gender");
    const country = formData.get("country");
    const bio = formData.get("bio");

    console.log({
      username,
      password,
      confirmPassword,
      age,
      gender,
      country,
      bio,
    });
    // return null;

    const url = `${baseUrl}/register`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
        confirmPassword,
        age,
        gender,
        country,
        bio,
      }),
    });

    if (!res.ok) {
      console.error("Register failed", await res.json());
      return;
    }

    const data = await res.json();
    return data;
  };

  const guest = async (formData: FormData) => {};

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
