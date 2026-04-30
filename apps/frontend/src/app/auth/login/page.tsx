"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/src/hooks/api/auth";
import { useForm } from "@tanstack/react-form";
import z from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(5, "Username must be at least 5 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(20, "Password must be at most 20 characters long"),
});

export default function Login() {
  const { mutate, isPending } = useLogin();
  const form = useForm({
    defaultValues: {
      username: "",
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
  // const { mutate, isPending } = useMutation({
  //   mutationFn: async (formData: FormData) => {
  //     return await authManager.login(formData);
  //   },

  //   onSuccess: (data) => {
  //     console.log({ dataFromLogin: data });
  //     authManager.setToken(data.token);
  //     authManager.setAuthUser(data.user);
  //     window.location.href = "/chat";
  //   },
  //   onError: (error) => {
  //     console.log({ errorFromLogin: error });
  //   },
  // });

  // const handleLogin = async (formData: FormData) => {
  //   console.log("hsdfsdf");
  //   mutate(formData);
  // };
  return (
    <Card>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? "Username is required"
                    : value.length < 3
                      ? "Username must be atleast 3 characters"
                      : undefined,
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: async ({ value }) => {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  return (
                    value.includes("error") &&
                    'No "error" allowed in first name'
                  );
                },
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="rounded-sm"
                      />
                    </Field>
                    {isInvalid && (
                      <FieldError
                        errors={
                          field.state.meta.errors?.map((error) => ({
                            message: error as string,
                          })) || []
                        }
                      />
                    )}
                  </>
                );
              }}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  !value
                    ? "A Password is required"
                    : value.length < 3
                      ? "Password name must be at least 8 characters"
                      : undefined,
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: async ({ value }) => {
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                  return (
                    value.includes("error") &&
                    'No "error" allowed in first name'
                  );
                },
              }}
            >
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
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="rounded-sm"
                      />
                    </Field>
                    {/* {isInvalid && (
                      <FieldError
                        errors={
                          field.state.meta.errors?.map((error) => ({
                            message: error as string,
                          })) || []
                        }
                      />
                    )} */}
                  </>
                );
              }}
            </form.Field>
            <Button type="submit" className={"w-full rounded-sm"}>
              Login
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
