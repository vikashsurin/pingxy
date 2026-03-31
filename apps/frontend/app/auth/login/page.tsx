"use client";

import Input from "@/components/ui/Input";
import Primary from "@/components/ui/buttons/Primary";
import { useState } from "react";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form className="flex flex-col border p-4 gap-6 rounded">
      <Input
        label="Username"
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        label="Password"
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Primary
        label="Login"
        onClick={() => {
          console.log("hello");
        }}
      />
    </form>
  );
}
