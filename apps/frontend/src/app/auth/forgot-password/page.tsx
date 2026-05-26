'use client'

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/src/hooks/api/useAuth";
import { useForm } from "@tanstack/react-form";

export default function ForgotPasswordPage() {

  const { mutate, isError, isPending, isSuccess } = useForgotPassword()
  const form = useForm({
    defaultValues: {
      email: ''
    },
    onSubmit: async ({ value }) => {
      const { email } = value
      
      mutate(email)

    },
  })
  return (
    <>
      <section className=" h-dvh flex flex-col justify-center items-center bg-[#F8F5F2]">
        <div className="p-4 flex flex-1 min-h-0 flex-col max-w-md justify-center gap-4 ">
          <h1 className="text-2xl  font-bold ">Forgot Password</h1>
          <p className="text-gray-500 self-center">Enter your email to reset your password. A link to reset password will be sent to you.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}>
            <FieldGroup>
              <form.Field name="email">
                {field => {
                  const isInvalid =
                    (field.state.meta.isTouched || form.state.isSubmitted) &&
                    !field.state.meta.isValid;

                  return (
                    <>
                      <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                          id="email"
                          type="email"
                          data-slot="field"
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="w-full"
                        />
                      </Field>
                    </>
                  )
                }}
              </form.Field>
              <Button type="submit" disabled={isPending || isSuccess}>
                {isPending ? 'Submitting...' : isSuccess ? 'Chek your mail box' : 'Submit'}
              </Button>
            </FieldGroup>

          </form>
          <div className="flex justify-center mt-4 gap-2">
            <a href="/auth/login" className="text-blue-700 underline items-center justify-end mt-4 text-sm">Login</a>

            <a href="/auth/register" className="text-blue-700 underline items-center justify-end mt-4 text-sm">Register</a>
          </div>
        </div>

      </section>
    </>
  );
}
