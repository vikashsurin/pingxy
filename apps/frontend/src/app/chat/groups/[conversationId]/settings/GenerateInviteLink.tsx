import { Button } from "@/components/ui/button";
import { IconCirclesRelation, IconLink } from "@tabler/icons-react";

import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateInvite } from "@/src/hooks";
import { inviteCreateSchema } from "@/src/lib/schema/group";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { useState } from "react";

export default function GenerateInviteLink({ conversationId }: { conversationId: number }) {
  const [open, setOpen] = useState(false);

  // const [date, setDate] = useState<Date>(new Date());

  // const [copied, setCopied] = useState(false);


  // const handleCopy = async () => {
  //   if (data?.inviteCode) {
  //     try {
  //       await navigator.clipboard.writeText(data.inviteCode);
  //       setCopied(true);
  //     } catch (err) {
  //       console.error("Failed to copy!", err);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   if (!copied) return;

  //   const timer = setTimeout(() => {
  //     setCopied(false);
  //   }, 2000);

  //   return () => clearTimeout(timer); // Clean up on unmount or re-render
  // }, [copied]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={'rounded-md w-max'} render={<Button variant="default" >
        <IconLink />
        Generate Invite Code</Button>}>
      </DialogTrigger>
      <DialogContent >
        <DialogHeader>
          <DialogTitle>Generate Invite Code</DialogTitle>
        </DialogHeader>

        <CreateInviteForm conversationId={conversationId} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>

  );
}



function CreateInviteForm({ conversationId, onSuccess }: { conversationId: number, onSuccess: () => void }) {
  const { data, mutate, isPending, error } = useCreateInvite();

  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 2)
  const form = useForm({
    defaultValues: {
      expiresAt: expiry,
      maxUses: 20,
    },
    validators: {
      onSubmit: inviteCreateSchema
    },
    onSubmit: async ({ value }) => {
      mutate({
        conversationId,
        expiresAt: value.expiresAt.toISOString(),
        maxUses: value.maxUses
      }, {
        onSuccess: () => {
          onSuccess()
        },
      })
    }
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit()
    }}>
      <FieldGroup>
        <form.Field
          name='expiresAt'
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Expires At
                  </FieldLabel>

                  <Popover>
                    <PopoverTrigger
                      render={<Button variant="ghost"> {field.state.value ? format(field.state.value, "PPP") : "Pick a date"}</Button>}
                    >
                    </PopoverTrigger>

                    <PopoverContent>
                      <Calendar mode="single"
                        selected={field.state.value}
                        onSelect={(value) => {
                          if (value)
                            field.handleChange(value)
                        }}
                      />
                      <div className="flex flex-wrap justify-between gap-2 border-t py-1">

                        {[
                          { label: 'Today', value: 0 },
                          { label: 'Tomorrow', value: 1 },
                          { label: 'A Week', value: 7 },
                          { label: 'A Month', value: 28 }
                        ].map((option) => (
                          <Button key={option.label} size={'xs'} onClick={() => {
                            const newDate = new Date();
                            newDate.setDate(newDate.getDate() + option.value);
                            field.handleChange(newDate)
                          }
                          }
                          >
                            {option.label}
                          </Button>
                        ))}

                      </div>
                    </PopoverContent>
                  </Popover>
                </Field>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        </form.Field>

        <form.Field name="maxUses">
          {(field) => {
            const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
              && !field.state.meta.isValid;

            return (
              <>
                <Field>
                  <FieldLabel htmlFor={field.name}>
                    Max Uses
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="max participants"
                  />
                </Field>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </>
            )
          }}
        </form.Field>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Generating..." : "Generate"}
        </Button>
      </FieldGroup>
    </form>

  )
}
// <div className="flex flex-col gap-2 ">
//   <Button
//     className="w-max rounded-sm"
//     size="xs"
//     onClick={() => mutate(cid)}
//     disabled={isPending}
//   >
//     {isPending ? "Generating..." : "Generate Invite Link"}
//   </Button>

//   {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}

//   {data?.inviteCode && (
//     <div className="flex p-2 w-max items-center border border-gray-300 rounded-md hover:outline-2 hover:outline-blue-400">
//       <p className="text-gray-600 px-2">{data.inviteCode}</p>
//       <button
//         type="button"
//         title="Copy invite link"
//         onClick={handleCopy}
//         className="p-2 bg-gray-100 rounded-full hover:bg-blue-500 active:bg-blue-600 hover:text-white"
//       >
//         {copied ? (
//           <IconCircleCheck size={16} className="text-green-500" />
//         ) : (
//           <IconCopy size={16} />
//         )}
//       </button>
//     </div>
//   )}
// </div>
