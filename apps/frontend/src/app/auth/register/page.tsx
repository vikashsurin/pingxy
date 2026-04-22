"use client";

import Input from "@/src/components/ui/Input";
import RadioGroup from "@/src/components/ui/RadioGroup";

import Primary from "@/src/components/ui/buttons/Primary";

import Select from "@/src/components/ui/Select";
import countries from "@/lib/countries.json";
import { authManager } from "@/src/services/authService";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export default function Register() {
  const { mutate, isPending, isError } = useMutation({
    mutationFn: async (formdata: FormData) => {
      return await authManager.register(formdata);
    },
    onSuccess: () => {
      window.location.href = "/chat";
    },
    onError: () => {},
  });

  const [gender, setGender] = useState("");
  const [age, setAge] = useState(18);
  const [country, setCountry] = useState({ key: "us", name: "United States" });

  const handleRegister = async (formData: FormData) => {
    console.log("hsdfsdf");
    mutate(formData);
  };

  return (
    <form
      className="flex flex-col border p-4 gap-6 rounded"
      action={handleRegister}
    >
      <Input
        name="username"
        label="Username"
        type="text"
        placeholder="username"
      />

      <Input
        name="password"
        label="Password"
        type="password"
        placeholder="password"
      />

      <Input
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        placeholder="confirm password"
      />

      <RadioGroup
        name="gender"
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
        name="age"
        type="number"
        label="Age"
        placeholder="Age"
        min="18"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />

      <Select
        name="country"
        label="Country"
        options={countries}
        value={country}
        onChange={(value) => setCountry(value)}
      />

      <Primary
        label={isPending ? "Registering..." : "Register"}
        type="submit"
      />
    </form>
  );
}
