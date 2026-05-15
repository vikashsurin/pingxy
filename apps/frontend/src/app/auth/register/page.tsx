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
import { useRegister } from "@/src/hooks/api/useAuth";
import { registerFormSchema } from "@/src/lib/schema/auth";
import { useForm } from "@tanstack/react-form";

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
    <Card className="rounded-md">
      <CardContent>
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
            <Button type="submit">Register</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
