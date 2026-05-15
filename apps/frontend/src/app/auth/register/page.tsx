"use client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRegister } from "@/src/hooks/api/useAuth";
import { registerFormSchema } from "@/src/lib/schema/auth";
import { useForm } from "@tanstack/react-form";
import Image from "next/image";

export default function Register() {
  const { mutate } = useRegister();

  const form = useForm({
    defaultValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: registerFormSchema,
    },
    onSubmit: async ({ value }) => {
      mutate({
        ...value,
      });
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
          <h1 className="text-3xl font-bold">Create an Account</h1>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="userName">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched || form.state.isSubmitted) &&
                  !field.state.meta.isValid;

                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="username"
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                );
              }}
            </form.Field>
            <form.Field name="email">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched || form.state.isSubmitted) &&
                  !field.state.meta.isValid;

                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="email"
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
                  (field.state.meta.isTouched || form.state.isSubmitted) &&
                  !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="*****"
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                );
              }}
            </form.Field>
            <form.Field name="confirmPassword">
              {(field) => {
                const isInvalid =
                  (field.state.meta.isTouched || form.state.isSubmitted) &&
                  !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="*****"
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </>
                );
              }}
            </form.Field>
            <Button type="submit">Create an account</Button>
          </FieldGroup>
        </form>
        <div className="text-sm flex gap-1 justify-center mt-8">
          Already have an account?{" "}
          <a href="/auth/login" className="text-blue-800 hover:underline">
            Login
          </a>
        </div>
        <footer className="text-sm flex gap-2 justify-center mt-auto text-gray-600 pt-8 ">
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
        </footer>
      </div>
    </section>
  );
}
