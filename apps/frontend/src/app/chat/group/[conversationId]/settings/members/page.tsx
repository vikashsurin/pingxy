"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Loading from "@/src/components/Loading";
import { useFetchParticipants } from "@/src/hooks/api/conversations";
import { IconUsers } from '@tabler/icons-react';
import { useForm } from "@tanstack/react-form";
import { useParams } from "next/navigation";
import z from "zod";


export default function Page({ }) {
  const params = useParams();
  const conversationId = params.conversationId;


  const { data, isLoading, isPending, isError, isSuccess } =
    useFetchParticipants(Number(conversationId));

  if (isLoading || isPending) return <Loading />;
  if (isError) return <p>Error</p>;

  if (isSuccess)
    return (
      <div className="m-2 p-4 rounded-lg border border-gray-300 bg-gray-100">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <IconUsers size={16} className="text-gray-800" /> Members
          <span className="bg-blue-100 h-5 w-5 flex items-center justify-center text-xs text-blue-700 py-1 px-1.5 rounded aspect-square">{data?.length}</span>
        </h2>
        <div>
          <ul>
            {data?.map((participant: any) => (
              <li
                key={participant.id}
                className="flex items-center gap-2 py-2 px-3 hover:bg-gray-200  border-b"
              >
                <span>{participant.userName}</span>
                <span className="text-xs text-gray-400">{participant.role}</span>
                <div className="ml-auto">
                  <ManageRoleDialog
                    id={participant.id}
                    conversationId={participant.conversationId}
                    userId={participant.userId}
                    role={participant.role}
                    name={participant.userName}
                  />
                  <RemoveParticipantDialog />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
}

function RemoveParticipantDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="destructive" size='xs'>Remove</Button>
        }>
      </AlertDialogTrigger>

      <AlertDialogContent className={'rounded-lg'}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm font-medium">
            Remove Participant
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Are you sure you want to remove this participant?
        </AlertDialogDescription>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Dialog to Manage Role of a Participant
function ManageRoleDialog({ id, conversationId, userId, role, name }: { id: number, conversationId: number, userId: number, role: string, name: string }) {

  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="ghost" size="xs">Manage Role</Button>}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Role</DialogTitle>
        </DialogHeader>
        <ManageRoleForm
          id={id} conversationId={conversationId}
          userId={userId}
          role={role}
          name={name} />
      </DialogContent>
    </Dialog>
  )
}

function ManageRoleForm({ id, conversationId, userId, role, name }: { id: number, conversationId: number, userId: number, role: string, name: string }) {
  const roles = [
    { id: 'member', label: "Member", value: 'member' },
    { id: 'moderator', label: "Moderator", value: 'moderator' },
  ];

  const form = useForm({
    defaultValues: {
      role: role,
    },
    validators: {
      onSubmit: z.object({
        role: z.string().min(1),
      }),
    },
    onSubmit: async (values) => {
      console.log('values', values)

    },
  });
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit()
    }}>
      <FieldGroup>
        <form.Field name='role'>
          {(field) => {
            const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
              && !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                  <RadioGroup
                    name={field.name}
                    value={field.state.value}
                    onValueChange={(value) => field.setValue(value)}
                  >
                    {roles.map((role) => (
                      <Field key={role.id}>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem
                            id={role.id}
                            value={role.value}
                            aria-invalid={isInvalid}
                          />

                          <FieldLabel htmlFor={role.id}>
                            {role.label}
                          </FieldLabel>

                        </div>
                      </Field>
                    ))}
                  </RadioGroup>
                  <FieldDescription className="flex gap-1 items-center bg-red-100 rounded px-2 py-1 text-red-800 justify-center">
                    Change
                    <b>
                      {name}&apos;s
                    </b>
                    role to
                    <b>
                      {field.state.value}
                    </b>
                  </FieldDescription>
                </Field>
              </>
            )
          }}
        </form.Field>
        <div className="flex justify-end gap-2">
          <DialogClose render={<Button variant="secondary">Cancel</Button>} />
          <Button type="submit">Change Role</Button>
        </div>

      </FieldGroup>
    </form>
  )
}
