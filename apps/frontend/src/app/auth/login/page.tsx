"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/src/hooks/api/useAuth";
import { loginFormSchema } from "@/src/lib/schema/auth";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";

export default function Login() {
  const { mutate, isPending, isSuccess, isError, reset } = useLogin();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      mutate(value);
    },
  });

  return (
    <section className=" h-dvh flex flex-col justify-center items-center overflow-auto px-24">
      <div className="p-4 flex flex-1 min-h-0 flex-col min-w-md ">
        <div className="py-8">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={256}
            height={56}
            priority
            className="pb-8"
          />
          <h1 className="text-3xl font-bold">Login</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          if (isError) reset();
                          field.handleChange(e.target.value);
                        }}
                        className="rounded-sm"
                        placeholder="Enter email"
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                );
              }}
            </form.Field>
            <form.Field name="password">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          if (isError) reset();
                          field.handleChange(e.target.value);
                        }}
                        className="rounded-sm"
                        placeholder="*****"
                      />
                      <div className="flex">
                        <a
                          href="/auth/forgot-password"
                          className="text-sm w-max  ml-auto text-blue-800 hover:underline"
                        >
                          forgot password?
                        </a>
                      </div>
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                );
              }}
            </form.Field>

            {isError && (
              <div className="text-red-500 text-sm">
                Login failed. Please check your credentials and try again.
              </div>
            )}
            <Button
              type="submit"
              className={"w-full rounded-sm"}
              disabled={isPending || isSuccess}
            >
              {isPending
                ? "Logging in..."
                : isSuccess
                  ? "Redirecting..."
                  : "Login"}
            </Button>
          </FieldGroup>
        </form>

        <div className="text-sm flex gap-1 justify-center mt-8">
          Don&apos;t have an account?{" "}
          <a href="/auth/register" className="text-blue-800 hover:underline">
            Create an account
          </a>
        </div>
      </div>

      <footer className="text-sm flex gap-2 justify-center mb-8 text-gray-600">
        <a href="/terms" className="hover:underline">
          Terms of Service
        </a>
        <a href="/privacy" className="hover:underline">
          Privacy Policy
        </a>
      </footer>
    </section>
  );
}
