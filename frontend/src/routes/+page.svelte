<script lang="ts">
  import { onMount } from "svelte";
  import countries from "$lib/countires.json";
  import { debounce } from "$lib/utils/debounce";
  import { CircleAlert, CircleCheck } from "@lucide/svelte";
  import { enhance } from "$app/forms";

  let { form } = $props();

  onMount(() => {});
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const ageRange = range(18, 70); // from 18 to 50

  let username = $state("");
  let gender = $state("all");
  let age = $state(18);
  let country = $state("AF");
  let mode = $state("login"); // login | register | guest
  let hint = $state<{ error: boolean | null; text: string }>({
    error: null,
    text: "",
  });
  let loading = $state(false); // let geoLocation = $state();

  function handleGender(
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) {
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
    } else if (username.length > 20) {
      hint.error = true;
      hint.text = "Username too long, max 20 characters";
      return;
    } else if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
      hint.error = true;
      hint.text = "Username must start with a letter";
      return;
    }

    const response = await fetch(
      "http://localhost:3000/api/users/check?username=" + username,
    );
    const data = await response.json();

    if (mode === "login") {
      // For login, we WANT the user to exist (available: false)
      if (!data.available) {
        hint.error = false;
        hint.text = "Username found";
      } else {
        // If available, it means user strictly doesn't exist?
        // Or maybe we don't want to reveal this for security (enumeration)?
        // For this helper, let's just not show an error, or show standard UI.
        // User wants "logic that dont allow login if username already exists" -> incorrect logic.
        // So we fix it.
        hint.error = true;
        hint.text = "Username not found";
      }
    } else {
      // Register / Guest: We want availability
      if (data.available) {
        hint.error = false;
        hint.text = "Username available";
      } else {
        hint.error = true;
        hint.text = "Username not available";
      }
    }
  }, 500);
</script>

<div class="flex flex-col h-screen justify-around p-4 select-none">
  <div class="flex flex-col md:items-center">
    <p class="text-3xl font-bold py-2 text-blue-600">ChatApp</p>
    <p class="text-sm text-gray-500">Connect globally, chat instantly.</p>
  </div>
  <div class="md:w-96 w-full mx-auto">
    <div class="flex flex-col bg-white rounded-lg md:shadow-lg p-6">
      <h1 class="text-xl font-bold py-2 mb-4 text-center">
        {mode === "login"
          ? "Welcome Back!"
          : mode === "register"
            ? "Create Account"
            : "Guest Access"}
      </h1>

      <!-- Tabs -->
      <div class="flex gap-2 bg-gray-100 p-1 rounded-lg mb-6">
        {#each ["login", "register", "guest"] as m}
          <button
            class="flex-1 py-1 text-sm font-medium rounded-md capitalize transition-all duration-200
            {mode === m
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'}"
            onclick={() => {
              mode = m;
              hint.error = null;
              hint.text = "";
              form = null;
            }}
          >
            {m}
          </button>
        {/each}
      </div>

      <!-- Feedback Area -->
      {#if form?.invalid}
        <div
          class="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-100"
        >
          <CircleAlert size={16} />
          <p>{form.invalid}</p>
        </div>
      {/if}

      <!-- Validation Hint -->
      {#if hint.text}
        <div
          class="flex items-center gap-2 text-xs mb-2 px-1 {hint.error
            ? 'text-red-500'
            : 'text-green-500'}"
        >
          {#if hint.error}
            <CircleAlert size={12} />
          {:else}
            <CircleCheck size={12} />
          {/if}
          <p>{hint.text}</p>
        </div>
      {/if}

      <form
        class="flex flex-col gap-4 text-sm"
        method="POST"
        action="?/{mode}"
        use:enhance={() => {
          loading = true;
          return async ({ update }) => {
            await update();
            loading = false;
          };
        }}
      >
        <div class="space-y-1">
          <span class="text-xs font-medium text-gray-700 ml-1">Username</span>
          <input
            autocapitalize="none"
            name="username"
            type="text"
            class="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all
                {hint.error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
              : 'border-gray-200'}"
            placeholder="Enter username"
            bind:value={username}
            oninput={debounceCheck}
            required
          />
        </div>

        {#if mode !== "guest"}
          <div class="space-y-1">
            <span class="text-xs font-medium text-gray-700 ml-1">Password</span>
            <input
              name="password"
              type="password"
              class="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 border-gray-200 transition-all"
              placeholder="Enter password"
              required
            />
          </div>
        {/if}

        {#if mode === "register" || mode === "guest"}
          <!-- Gender & Age etc - Keeping existing layout structure but polished -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-xs font-medium text-gray-700 ml-1 mb-1 block"
                >Gender</span
              >
              <div class="flex gap-2">
                <label
                  class="flex-1 cursor-pointer border rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 has-checked:border-blue-500 transition-all"
                >
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    onchange={(e) => handleGender(e)}
                    checked={gender === "female"}
                    class="accent-blue-500"
                  />
                  <span class="text-xs">Female</span>
                </label>
                <label
                  class="flex-1 cursor-pointer border rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 has-checked:border-blue-500 transition-all"
                >
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    onchange={(e) => handleGender(e)}
                    checked={gender === "male"}
                    class="accent-blue-500"
                  />
                  <span class="text-xs">Male</span>
                </label>
              </div>
            </div>
            <div>
              <span class="text-xs font-medium text-gray-700 ml-1 mb-1 block"
                >Age</span
              >
              <select
                name="age"
                bind:value={age}
                class="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500 border-gray-200"
              >
                {#each ageRange as v}
                  <option value={v}>{v}</option>
                {/each}
              </select>
            </div>
          </div>

          <div>
            <span class="text-xs font-medium text-gray-700 ml-1 mb-1 block"
              >Country</span
            >
            <select
              name="country"
              bind:value={country}
              class="w-full border p-2.5 rounded-lg bg-white outline-none focus:border-blue-500 border-gray-200"
            >
              {#each countries as c}
                <option value={c.code}>{c.name}</option>
              {/each}
            </select>
          </div>
        {/if}

        <button
          disabled={loading}
          class="bg-blue-600 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {#if loading}
            <svg
              class="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          {:else}
            {mode === "login"
              ? "Sign In"
              : mode === "register"
                ? "Create Account"
                : "Enter as Guest"}
          {/if}
        </button>
      </form>
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
