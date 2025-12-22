<script lang="ts">
  import { onMount } from "svelte";
  import countries from "$lib/countires.json";
  import { userSchema, type User } from "../../../shared/src/index";
  import { fail } from "@sveltejs/kit";
  import { type ChangeEventHandler } from "svelte/elements";
  onMount(() => {});
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const ageRange = range(18, 70); // from 18 to 50

  async function handleClick() {
    const response = await fetch("http://backend:3000/api/health", {});
    const data = await response.json();
    ({ data });
  }

  let username = $state("");
  let gender = $state("all");
  let age = $state(18);
  let country = $state("Afghanistan");

  function handleGender(e) {
    const target = e.target as HTMLInputElement;
    gender = target.value;
  }

  async function handleLogin() {
    const user: User = {
      uid: crypto.randomUUID(),
      username: username,
      gender: gender,
      age: age,
      country: country,
    };

    const validateUser = userSchema.safeParse(user);

    if (!validateUser.success) {
      console.error("validation error", validateUser.error);
      return fail(400, {
        username: user.username,
        invalid: "Invalid username",
      });
    }

    const validUser = validateUser.data;

    const response = await fetch("http://backend:3000/api/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: validUser }),
    });

    const data = await response.json();

    ({ response: data });

    // if (response.ok) {
    //   window.location.href = "/chat";
    // }
  }
</script>

<div class=" flex h-dvh flex-col">
  <h1>Logo</h1>
  <div class="h-full grid grid-cols-2">
    <div>
      <p>Intro</p>
    </div>
    <div class="border-l flex items-center justify-center">
      <div class="w-[300px] border border-gray-200">
        <form class="flex flex-col gap-2" method="POST" action="?/login">
          <input
            name="username"
            type="text"
            class="border p-3"
            placeholder="Enter username"
            bind:value={username}
          />
          <div class="flex justify-between gap-2">
            <label
              class="border py-3 px-4 w-full gap-2 flex justify-center items-center"
            >
              <input
                name="gender"
                type="radio"
                value="female"
                onchange={(e) => handleGender(e)}
              />
              <span>Female</span>
            </label>
            <label
              class="border py-3 px-4 w-full gap-2 flex justify-center items-center"
            >
              <input
                name="gender"
                type="radio"
                value="male"
                onchange={(e) => handleGender(e)}
              />
              <span>Male</span>
            </label>
          </div>

          <label class="border py-3 px-4 w-full flex gap-6">
            Age
            <select name="age" id="" bind:value={age} class="w-full">
              {#each ageRange as v, _}
                <option value={v} selected={v === 18}>{v}</option>
              {/each}
            </select>
          </label>

          <label class="border py-3 px-4 w-full flex gap-6">
            Country
            <select name="country" id="" class="w-full" bind:value={country}>
              {#each countries as country, _}
                <option value={country.name}>{country.name}</option>
              {/each}
            </select>
          </label>
          <button
            class="bg-blue-500 p-3 text-white hover:bg-blue-400 active:bg-blue-600"
            >Login as Guest</button
          >
        </form>
      </div>
    </div>
  </div>

  <!-- <button onclick={handleClick}>test</button> -->
  <!-- <button onclick={handleLogin} class="bg-amber-300">Login</button> -->

  <!-- FOOTER -->
  <div class=" mb-6 p-4">
    <ul class="flex gap-2 text-sm underline">
      <li><a href="/faq">FAQ</a></li>
      <li><a href="/conditions">Terms & conditions</a></li>
      <li><a href="/policy">Privacy Policy</a></li>
      <li><a href="/policy">Cookie Policy</a></li>
      <li><a href="/contact">contact</a></li>
      <li class="ml-auto"><a href="/contact">2025</a></li>
    </ul>
  </div>
</div>
