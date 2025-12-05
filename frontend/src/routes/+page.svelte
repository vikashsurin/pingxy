<script lang="ts">
  import { onMount } from "svelte";
  import countries from "$lib/countires.json";
  onMount(() => {
  });
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => i + start);

  const age = range(18, 70); // from 18 to 50
</script>

<div class=" flex h-dvh flex-col">
  <h1>Logo</h1>
  <div class="h-full grid grid-cols-2">
    <div>
      <p>Intro</p>
    </div>
    <div class="border-l flex items-center justify-center">
      <div class="w-[300px] border border-gray-200">
        <form action="?/login" method="POST" class="flex flex-col gap-2">
          <input
            name="username"
            type="text"
            class="border p-3"
            placeholder="Enter username"
          />
          <div class="flex justify-between gap-2">
            <label
              class="border py-3 px-4 w-full gap-2 flex justify-center items-center"
            >
              <input name="gender" type="radio" value="female" />
              <span>Female</span>
            </label>
            <label
              class="border py-3 px-4 w-full gap-2 flex justify-center items-center"
            >
              <input name="gender" type="radio" value="male" />
              <span>Male</span>
            </label>
          </div>

          <label class="border py-3 px-4 w-full flex gap-6">
            Age
            <select name="age" id="" class="w-full">
              {#each age as v, _}
                <option value={v}>{v}</option>
              {/each}
            </select>
          </label>

          <label class="border py-3 px-4 w-full flex gap-6">
            Country
            <select name="country" id="" class="w-full">
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
