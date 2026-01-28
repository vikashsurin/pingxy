<script lang="ts">
</script>

<ul class="flex flex-wrap text-sm items-center justify-center gap-2 underline">
    {@render link("/about", "About")}
    {@render link("/contact", "Contact")}
    {@render link("/terms-conditions", "Terms & conditions")}
    {@render link("/cookie-policy", "Cookie Policy")}
    {@render link("/privacy-policy", "Priavcy Policy")}
    {@render link("/feedback", "Feedback")}
</ul>

{#snippet link(url: string, label: string)}
    <li>
        <a href={url} class="text-gray-600 hover:text-blue-700">{label}</a>
    </li>
{/snippet}
