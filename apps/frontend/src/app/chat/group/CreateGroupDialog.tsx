import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LabeledField } from "@/src/components/forms/LabeledField";
import { TextFormField } from "@/src/components/forms/TextFormField";
import { useCreateGroup } from "@/src/hooks";
import { groupCreateSchema } from "@/src/lib/schema/group";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

export default function CreateGroupDialog() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={
          " text-white flex gap-2 flex-col py-3 px-4 bg-blue-500 rounded-sm hover:bg-blue-600 transition-colors active:bg-blue-700"
        }
      >
        <IconPlus size={20} />
        <span className="text-nowrap">Create Group</span>
      </DialogTrigger>
      <DialogContent className={"rounded-lg"}>
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>
        <CreateGroupForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CreateGroupForm({ onSuccess }: { onSuccess: () => void }) {
  const visibilityOptions = [
    { id: "private", label: "Private", value: "private" },
    { id: "public", label: "Public", value: "public" },
  ];

  const { mutate: createGroup, isPending } = useCreateGroup();

  const form = useForm({
    defaultValues: {
      name: "",
      visibility: "private" as "private" | "public",
      description: "",
      maxParticipants: 20,
    },
    validators: {
      onSubmit: groupCreateSchema,
    },
    onSubmit: async ({ value }) => {
      createGroup(value, {
        onSuccess: () => {
          onSuccess();
        },
      });
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="visibility">
          {(field) => {
            const isInvalid =
              (field.state.meta.isTouched || form.state.isSubmitted) &&
              !field.state.meta.isValid;
            return (
              <LabeledField
                label="Visibility"
                name={field.name}
                isInvalid={isInvalid}
              >
                <RadioGroup
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) => field.setValue(v)}
                >
                  {visibilityOptions.map((opt) => (
                    <Field key={opt.id}>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          id={opt.id}
                          value={opt.value}
                          aria-invalid={isInvalid}
                        />
                        <FieldLabel htmlFor={opt.id}>{opt.label}</FieldLabel>
                      </div>
                    </Field>
                  ))}
                </RadioGroup>
              </LabeledField>
            );
          }}
        </form.Field>

        <TextFormField
          form={form}
          name="name"
          label="Name"
          placeholder="Group name"
        />

        <TextFormField
          form={form}
          name="description"
          label="Description"
          placeholder="Group description"
        />

        <TextFormField
          form={form}
          name="maxParticipants"
          label="Max Participants"
          type="number"
        />

        <div className="flex gap-2 justify-end">
          <DialogClose
            render={<Button variant={"outline"}>Cancel</Button>}
          ></DialogClose>
          <Button type="submit">{isPending ? "Creating..." : "Create"}</Button>
        </div>
      </FieldGroup>
    </form>
  );
}
