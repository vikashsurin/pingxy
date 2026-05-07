import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useJoinViaInvite } from "@/src/hooks/api/conversationInvites";
import { useForm } from "@tanstack/react-form";
import z from "zod";

export default function JoinViaInvite() {
  const { mutate, isPending, isError, error } = useJoinViaInvite();

  const form = useForm({
    defaultValues: {
      invitecode: ''
    },
    validators: {
      onSubmit: z.object({
        invitecode: z.uuid({ message: "Invalid invite code" })
      })
    },
    onSubmit: ({ value }) => {
      console.log({ value })
      mutate(value.invitecode, {
        onSuccess: () => {
          // value.invitecode = ''
        },
        onError: (error) => {
          console.error(error);
        },
      });
    },
  });


  return (
    <div>
      <p className="font-bold mb-1">Join via invite code</p>

      <form onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}>
        <form.Field name="invitecode">
          {(field) => {
            const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
              && !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <div className="flex">
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      placeholder="Enter Code"
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-md"
                    />
                    <Button
                      type="submit"
                      variant="default"
                      disabled={isPending || field.state.value.length <= 0}
                      className="rounded-sm ml-2"
                    >
                      Join
                    </Button>
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              </>
            )
          }}
        </form.Field>

      </form>

      {/*<form action={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          name="invite-code"
          placeholder="Enter invite code"
          className="w-max"
        />

        <Button
          variant={"default"}
          disabled={isPending}
          className={"rounded-sm"}
        >
          {isPending ? "Joining..." : "Join"}
        </Button>
      </form>*/}
      {/*<div>
        {isError && <p className="flex gap-1 items-center text-xs bg-red-100 text-red-700 rounded-sm px-1.5 py-1 w-max mt-1"><IconAlertCircle size={14} /> {error?.message}</p>}
      </div>*/}
    </div >
  );
}
