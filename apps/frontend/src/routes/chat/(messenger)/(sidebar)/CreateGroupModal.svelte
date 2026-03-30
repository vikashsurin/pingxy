<script lang="ts">
  import Primary from "$lib/components/ui/button/Primary.svelte";
  import Dialog from "$lib/components/ui/dialog/Dialog.svelte";
  import Input from "$lib/components/ui/form/Input.svelte";
  import RadioGroup from "$lib/components/ui/form/RadioGroup.svelte";
  import { Eye, EyeOff } from "@lucide/svelte";
  import { conversationManager } from "$lib/managers/entities/conversation.svelte";
  import { conversationStore } from "$lib/stores/conversationStore.svelte";

  let { isOpen = $bindable() } = $props();

  let groupName = $state("");
  let groupDescription = $state("");
  let isGroupPrivate = $state(true);
  let maxUsers = $state("25");

  let groupTypes = [
    {
      id: "1",
      name: "group-type",
      label: "Private",
      value: "private",
      default: true,
    },
    {
      id: "2",
      name: "group-type",
      label: "Public",
      value: "public",
    },
  ];

  // $inspect({ groupName, groupDescription, isGroupPrivate, maxUsers });
  async function handleCreateGroup() {
    const res = await conversationManager.createGroupConversation({
      name: groupName,
      description: groupDescription,
      isPrivate: isGroupPrivate,
      maxParticipants: parseInt(maxUsers),
    });
    if (res) {
      console.log(res);
      isOpen = false;
      // conversationStore.groups.set(res.id, res);
    }
  }
</script>

<Dialog rounded={8} bind:isOpen>
  <form action="" class="flex flex-col gap-4 bg-white p-4">
    <RadioGroup
      label="Group type"
      options={groupTypes}
      onchange={(e) => {
        const target = e.currentTarget as HTMLInputElement;
        isGroupPrivate = target.value === "private";
      }}
    />

    <Input
      label="Group name"
      name="group-name"
      type="text"
      placeholder="Enter group name"
      bind:value={groupName}
    />

    <Input
      label="Group description"
      name="group-description"
      type="text"
      placeholder="Enter group description"
      bind:value={groupDescription}
    />
    <Input
      label="Maximum users"
      name="max-users"
      type="number"
      placeholder="25-50"
      bind:value={maxUsers}
    />

    <Primary label="Create" fn={handleCreateGroup} />
  </form>
</Dialog>
