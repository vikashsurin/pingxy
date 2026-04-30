"use client";

import Input from "@/src/components/ui/Input";
import RadioGroup from "@/src/components/ui/RadioGroup";

import Primary from "@/src/components/ui/buttons/Primary";

import countries from "@/src/constants/countries.json";
import Select from "@/src/components/ui/Select";
import { useState } from "react";

export default function Guest() {
  const [username, setUsername] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(18);
  const [country, setCountry] = useState({ key: "us", name: "United States" });

  function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form
      className="flex flex-col border p-4 gap-6 rounded"
      onSubmit={handleSubmit}
    >
      <Input
        label="Username"
        type="text"
        placeholder="username"
        onChange={(e) => setUsername(e.target.value)}
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
        onChange={setCountry}
      />

      <Primary label="Register" type="submit" />
    </form>
  );
}
