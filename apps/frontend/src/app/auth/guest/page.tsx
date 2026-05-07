"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import countries from '@/src/constants/countries.json';
import { guestFormSchema } from "@/src/lib/schema/auth";
import { useForm } from "@tanstack/react-form";

export default function Register() {
  const genders = [
    { id: "male", label: "Male", value: "male" },
    { id: "female", label: "Female", value: "female" },
    { id: "other", label: "Other", value: "other" },
  ]
  // const { mutate, isPending, isError } = useMutation({
  //   mutationFn: async (formdata: FormData) => {
  //     return await authManager.register(formdata);
  //   },
  //   onSuccess: () => {
  //     window.location.href = "/chat";
  //   },
  //   onError: () => { },
  // });
  // const [gender, setGender] = useState("");
  // const [age, setAge] = useState(18);
  // const [country, setCountry] = useState({ key: "us", name: "United States" });

  // const handleRegister = async (formData: FormData) => {
  //   console.log("hsdfsdf");
  //   mutate(formData);
  // };


  const form = useForm({
    defaultValues: {
      userName: "",
      gender: "",
      age: 18,
      country: null as { value: string; label: string; } | null,
    },
    validators: {
      onSubmit: guestFormSchema
    },
    onSubmit: async ({ value }) => {
      console.log("fsfsf")
      console.log(value)
    }
  })

  return (
    <Card className="rounded-md" >
      <CardContent>

        <form onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}>

          <FieldGroup>
            <form.Field name="userName">
              {(field) => {
                const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
                  && !field.state.meta.isValid;

                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Username
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="userName"
                      />
                    </Field>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </>
                )
              }}
            </form.Field>
            <form.Field name="gender">
              {(field) => {
                const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
                  && !field.state.meta.isValid;
                return (
                  <>
                    <Field >
                      <FieldLabel htmlFor={field.name}>
                        Gender
                      </FieldLabel>
                      <RadioGroup
                        name={field.name}
                        value={field.state.value}
                        onValueChange={(value) => field.setValue(value)}
                      >

                        {genders.map((gender) => (
                          <Field key={gender.id} >
                            <div className="flex items-center gap-2">
                              <RadioGroupItem
                                id={gender.id}
                                value={gender.value}
                                aria-invalid={isInvalid}
                              />
                              <FieldLabel htmlFor={gender.id}>
                                {gender.label}
                              </FieldLabel>
                            </div>
                          </Field>
                        ))}

                      </RadioGroup>
                    </Field>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </>
                )
              }}
            </form.Field>
            <form.Field name="age">
              {(field) => {
                const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
                  && !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Age
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        placeholder="age"
                      />
                    </Field>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </>
                )
              }}
            </form.Field>
            <form.Field name="country">
              {(field) => {
                const isInvalid = (field.state.meta.isTouched || form.state.isSubmitted)
                  && !field.state.meta.isValid;
                return (
                  <>
                    <Field>
                      <FieldContent>
                        <FieldLabel htmlFor={field.name}>
                          Country
                        </FieldLabel>
                      </FieldContent>

                      <Select
                        name={field.name}
                        value={field.state.value?.label ?? ""}
                        onValueChange={(val) => {
                          const selected = countries.find((c) => c.label === val) ?? null;
                          field.handleChange(selected);
                        }}
                      >

                        <SelectTrigger
                          id="select-country"
                          aria-invalid={isInvalid}

                        >
                          <SelectValue placeholder='Select' />
                        </SelectTrigger>
                        <SelectContent className={'px-2'}>
                          {countries.map((country) => (
                            <SelectItem
                              key={country.value}
                              value={country.label}
                            >
                              {country.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field >
                    {isInvalid && <FieldError errors={field.state.meta.errors} />
                    }
                  </>
                )
              }}
            </form.Field>
            <Button type="submit">Register</Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card >
  );
}
