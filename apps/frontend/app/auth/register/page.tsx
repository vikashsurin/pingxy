"use client";

import Input from "@/components/ui/Input";
import RadioGroup from "@/components/ui/RadioGroup";

import Primary from "@/components/ui/buttons/Primary";

import countries from "@/lib/countries.json";
import Select from "@/components/ui/Select";
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(18);
  const [country, setCountry] = useState({ key: "us", name: "United States" });

  console.log({ username, password, confirmPassword, gender, age, country });
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

      <Input
        label="Confirm Password"
        type="password"
        placeholder="confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <RadioGroup
        label="Gender"
        value={gender}
        onChange={(value) => setGender(value)}
        options={[
          { id: "male", name: "Male", value: "male" },
          { id: "female", name: "Female", value: "female" },
          { id: "other", name: "Other", value: "other" },
        ]}
      />

      <Input
        type="number"
        label="Age"
        placeholder="Age"
        min="18"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />

      <Select
        label="Country"
        options={countries}
        value={country}
        onChange={(value) => setCountry(value)}
      />

      <Primary
        label="Register"
        onClick={() => {
          console.log("hello");
        }}
      />
    </form>
  );
}
