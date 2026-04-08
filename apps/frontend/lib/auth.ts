"use server";

import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || !password) {
    return new Response("Please enter a username and password", {
      status: 400,
    });
  }

  const url = "http://backend:3000/api/auth/login";
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
  const cookieStore = await cookies();
  cookieStore.set("_Host-session", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  console.log("Login successful", data);

  // redirect("/chat");

  return data.user;
}

export const getAuthUser = async () => {
  console.log("getting auth user");
  const cookieStore = await cookies();
  const cookie = cookieStore.get("_Host-session");

  if (!cookie) {
    return null;
  }
  const url = "http://backend:3000/api/auth/me";
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
  });

  const data = await res.json();

  return data.user;
};
