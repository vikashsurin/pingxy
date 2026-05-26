'use client'
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/src/hooks/api/useAuth";
import { useForm } from "@tanstack/react-form";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

export default function PasswordResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PasswordResetForm />
    </Suspense>
  );
}


function PasswordResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { mutate, isError, isPending, isSuccess } = useResetPassword()

  const form = useForm({
    defaultValues: {
      newPassword: '',
      confirmNewPassword: ""
    },
    onSubmit: async ({ value }) => {
      mutate({ token: token!, newPassword: value.newPassword })
    }
  })

  if (isSuccess) return <PasswordResetSuccess />

  return (
    <>
      <section className=" h-dvh flex flex-col justify-center items-center bg-[#F8F5F2]">
        <div className="p-4 flex flex-1 min-h-0 flex-col min-w-md justify-center gap-4 ">
          <div>
            <h1 className="text-3xl font-bold  mb-8">Password Reset</h1>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}>
            <FieldGroup>
              <form.Field name="newPassword">
                {field => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;

                  return (
                    <>
                      <Field>
                        <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                        <Input
                          id="newPassword"
                          type="password"
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full"
                        />
                      </Field>
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
                        <FieldLabel htmlFor="confirmNewPassword">Confirm New Password</FieldLabel>
                        <Input
                          id="confirmNewPassword"
                          type="password"
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full"
                        />
                      </Field>
                    </>
                  )
                }}
              </form.Field>
              <Button type="submit" disabled={isPending || isSuccess}>Submit</Button>
            </FieldGroup>

          </form>
        </div>
      </section>
    </>
  )
}

function PasswordResetSuccess() {
  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <h1 className="text-2xl font-bold">Password Reset Successful</h1>
      <p>Your password has been reset successfully. You can now log in with your new password.</p>
      <a href="/auth/login" className="text-blue-700 underline mt-8">Login</a>
    </div>
  )
}
