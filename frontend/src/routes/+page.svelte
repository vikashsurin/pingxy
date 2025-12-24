<script lang="ts">
  import { onMount } from "svelte";
  import countries from "$lib/countires.json";
  import { debounce } from "$lib/utils/debounce";
  import { CircleAlert, CircleCheck } from "@lucide/svelte";

  onMount(() => {});
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const ageRange = range(18, 70); // from 18 to 50

  let username = $state("");
  let gender = $state("all");
  let age = $state(18);
  let country = $state("AF");
  let hint = $state<{ error: boolean | null; text: string }>({
    error: null,
    text: "",
  });

  // let geoLocation = $state();

  function handleGender(e) {
    const target = e.target as HTMLInputElement;
    gender = target.value;
  }

  const debounceCheck = debounce(async () => {
    if (!username) {
      hint.error = null;
      hint.text = "";
      return;
    } else if (username.length < 3) {
      hint.error = true;
      hint.text = "Username too short, min 3 characters";
      return;
    } else if (username.length > 12) {
      hint.error = true;
      hint.text = "Username too long, max 20 characters";
      return;
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
      hint.error = true;
      hint.text = "Username must start with a letter";
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/users/check?username=" + username
    );
    const data = await response.json();

    if (data.available) {
      hint.error = false;
      hint.text = "Username available";
    } else {
      hint.error = true;
      hint.text = "Username not available";
    }
  }, 500);
</script>

<div class="flex flex-col h-screen justify-around p-4">
  <div class="flex flex-col md:items-center">
    <p class="text-3xl font-bold py-2">Logo</p>
    <p class="text-sm text-gray-600">
      Chat with people from all around the world.
    </p>
  </div>
  <div class="">
    <div class=" flex flex-col md:items-center md:justify-center">
      <h1 class="text-xl font-bold py-2">Get started here!</h1>
      <div class="xl:w-1/4 lg:w-1/3 md:w-1/2 w-full border-gray-200">
        {#if hint.error}
          <p class="flex justify-between items-center text-xs p-1 text-red-500">
            {hint.text}
            <CircleAlert size={14} />
          </p>
        {:else if hint.error === false}
          <p
            class="flex justify-between items-center text-xs p-1 text-green-500"
          >
            {hint.text}
            <CircleCheck size={14} />
          </p>
        {/if}
        <form
          class="flex flex-col gap-2 text-sm"
          method="POST"
          action="?/login"
        >
          <input
            autocapitalize="words"
            name="username"
            type="text"
            class="border p-2 px-3 outline-none focus:border-blue-500 {hint.error
              ? 'focus:border-red-500 border-red-500'
              : hint.error === false
                ? 'focus:border-green-500 border-green-500'
                : 'border-gray-200'}"
            placeholder="Enter username"
            bind:value={username}
            oninput={debounceCheck}
          />
          <div class="flex justify-between gap-2">
            <label
              class="border border-gray-200 py-2 px-4 w-full gap-2 flex justify-center items-center focus-within:border-blue-500"
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
              class="border border-gray-200 py-2 px-4 w-full gap-2 flex justify-center items-center focus-within:border-blue-500"
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

          <label
            class="border border-gray-200 py-2 px-4 w-full flex gap-6 focus-within:border-blue-500"
          >
            Age
            <select name="age" id="" bind:value={age} class="w-full">
              {#each ageRange as v, _}
                <option value={v} selected={v === 18}>{v}</option>
              {/each}
            </select>
          </label>

          <label
            class="border border-gray-200 py-2 px-4 w-full flex gap-6 focus-within:border-blue-500"
          >
            Country
            <select name="country" id="" class="w-full" bind:value={country}>
              {#each countries as country, _}
                <option value={country.code}>{country.name}</option>
              {/each}
            </select>
          </label>
          <button
            class="bg-blue-500 p-2 text-white hover:bg-blue-400 active:bg-blue-600"
            >Login as Guest</button
          >
        </form>
      </div>
    </div>
  </div>

  <ul
    class="flex flex-wrap text-sm items-center justify-center gap-2 underline"
  >
    {@render link("/about", "About")}
    {@render link("/contact", "Contact")}
    {@render link("/terms-conditions", "Terms & conditions")}
    {@render link("/cookie-policy", "Cookie Policy")}
    {@render link("/privacy-policy", "Priavcy Policy")}
    {@render link("/feedback", "Feedback")}
  </ul>
</div>

{#snippet link(url: string, label: string)}
  <li>
    <a href={url} class="text-gray-600 hover:text-blue-700">{label}</a>
  </li>
{/snippet}

<!-- 
  This is the home page
  it contains 
  Header section
  Form section
-->
