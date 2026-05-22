import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUpdatePassword } from "@/src/hooks/api/useAuth";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { toast } from "sonner";

export function Account() {
  return (
    <>
      <section className="p-6  border-r h-full w-xl">
        <h2 className="text-2xl font-bold mb-6">Account</h2>
        <div className="flex flex-col gap-2">

          <div className="grid grid-cols-3 gap-4 items-center ">
            <h3 className="justify-self-start">UserName</h3>

            <p className="font-bold justify-self-center">
              venom
            </p>
            <AlertNameUpdate />

          </div>

          <div className="grid grid-cols-3 gap-4 items-center ">
            <h3 className="justify-self-start">Email</h3>

            <p className="font-bold justify-self-center">
              venom@gmail.com
            </p>
            <AlertEmailUpdate />

          </div>

          <div className="grid grid-cols-3 gap-4 items-center ">
            <h3 className="justify-self-start">Password</h3>

            <p className="font-bold justify-self-center">

            </p>
            <AlertPasswordUpdate />

          </div>
        </div>
      </section>
    </>
  )
}


function AlertNameUpdate() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size={'sm'} className={'w-max justify-self-end'} variant={'outline'}>Change</Button>}>
      </AlertDialogTrigger>
      <AlertDialogContent className={'rounded-md'}>
        <AlertDialogTitle>Change username</AlertDialogTitle>

        <UsernameUpdateForm />

      </AlertDialogContent>
    </AlertDialog>
  )
}

function AlertEmailUpdate() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button size={'sm'} className={'w-max justify-self-end'} variant={'outline'}>Change</Button>}>
      </AlertDialogTrigger>
      <AlertDialogContent className={'rounded-md'}>
        <AlertDialogTitle>Verify Email Address</AlertDialogTitle>
        <p className="text-sm text-gray-500 mb-4">
          We will need to verify your email address before updating it.
        </p>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Send Verification Code</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AlertPasswordUpdate() {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button size={'sm'} className={'w-max justify-self-end'} variant={'outline'}>Change</Button>}>
      </AlertDialogTrigger>
      <AlertDialogContent className={'rounded-md'}>
        <AlertDialogTitle>Change Password</AlertDialogTitle>

        <PasswordUPdateForm onSuccess={() => setOpen(false)} />

      </AlertDialogContent>
    </AlertDialog>
  )
}

function UsernameUpdateForm() {
  const form = useForm({
    defaultValues: {
      userName: '',
      password: '',
    }
  })
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit(e)
    }}>
      <FieldGroup>
        <form.Field name="userName">
          {field => {
            return (
              <>
                <Field>
                  <FieldLabel>
                    Username
                  </FieldLabel>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="username"
                  />
                </Field>
              </>
            )
          }}
        </form.Field>
        <form.Field name="password">
          {field => {
            return (
              <>
                <Field>
                  <FieldLabel>
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="*****"
                  />
                </Field>
              </>
            )
          }}
        </form.Field>
      </FieldGroup>
      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction>Change</AlertDialogAction>
      </AlertDialogFooter>
    </form >
  )
}


function PasswordUPdateForm({ onSuccess }: { onSuccess: () => void }) {

  const { mutate, isError, isPending } = useUpdatePassword()

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validators: {
      onSubmit: z.object({
        currentPassword: z.string()
          .min(4, 'Current password is required')
          .max(100, 'Current password is too long'),
        newPassword: z.string()
          .min(4, 'New password is required')
          .max(100, 'New password is too long'),
        confirmNewPassword: z.string()
          .min(4, 'Confirm new password is required')
          .max(100, 'Confirm new password is too long'),
      })
        .refine((data) => data.newPassword === data.confirmNewPassword, {
          message: 'Passwords do not match',
          path: ['confirmNewPassword'],
        })
    },
    onSubmit: async ({ value }) => {
      mutate({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      }, {
        onSuccess: () => {
          form.reset();
          onSuccess()
          toast.success('Password updated successfully', { position: 'bottom-center' });
        },
      })
    },
  })
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      form.handleSubmit(e)
    }}>
      <FieldGroup>
        <form.Field name="currentPassword">
          {field => {
            const isInvalid =
              (field.state.meta.isTouched || form.state.isSubmitted) &&
              !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <FieldLabel>
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="*****"
                  />
                </Field>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </>
            )
          }}
        </form.Field>
        <form.Field name="newPassword">
          {field => {
            const isInvalid =
              (field.state.meta.isTouched || form.state.isSubmitted) &&
              !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <FieldLabel>
                    New Password
                  </FieldLabel>
                  <Input
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="*****"
                  />
                </Field>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </>
            )
          }}
        </form.Field>
        <form.Field name="confirmNewPassword">
          {field => {
            const isInvalid =
              (field.state.meta.isTouched || form.state.isSubmitted) &&
              !field.state.meta.isValid;
            return (
              <>
                <Field>
                  <FieldLabel>
                    Confirm New Password
                  </FieldLabel>
                  <Input
                    type="password"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="*****"
                  />
                </Field>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </>
            )
          }}
        </form.Field>
      </FieldGroup>
      {isError && <div className="text-red-500">There was an error updating your password.</div>}
      <AlertDialogFooter className="mt-4">
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          type="submit"
          disabled={isPending}>{
            isPending ? "Updating..." : "Update"
          }</AlertDialogAction>
      </AlertDialogFooter>
    </form >
  )
}
