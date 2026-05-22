"use client"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Loading from "@/src/components/Loading";
import { useProfile, useUpdateProfile } from "@/src/hooks";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";

export default function Profile() {
  const { data, isLoading, isError } = useProfile()

  if (isLoading) return <Loading />
  if (isError) return <div>There was an error!</div>

  // If there's no profile data at all, show the completion state
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-lg">Complete your profile to continue</p>
      </div>
    )
  }

  // If data exists, pass it down to the actual form manager component
  return <ProfileForm initialData={data} />
}

// Separate component handles the form state safely without lifecycle conflicts
function ProfileForm({ initialData }: { initialData: any }) {
  const { mutate, isPending, isError } = useUpdateProfile()
  const [isEditing, setIsEditing] = useState(false)

  // TODO:: add validation schema
  const form = useForm({
    // 1. Form initializes directly with your real data! No useEffect needed.
    defaultValues: {
      userName: initialData.userName || '',
      gender: initialData.gender || 'other',
      age: initialData.age || '18',
      country: initialData.country || '',
      bio: initialData.bio || '',
    },
    onSubmit: async ({ value }) => {
      // Send updates to backend here...
      console.log("Submitting values:", value)
      mutate({
        gender: value.gender,
        age: Number(value.age),
        country: value.country,
        bio: value.bio,
      })
      setIsEditing(false)
    }
  })

  return (
    <section className="p-6  border-r h-full w-max">
      <h2 className="text-2xl font-bold mb-6">Profile</h2>
      <form
        className="flex flex-col gap-2 w-xs"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name='userName'>
            {field => (
              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled
                />
                <span className="text-xs bg-amber-100 text-amber-800 rounded-xs w-max px-1.5 py-0.5">username cannot be changed.</span>
              </Field>
            )}
          </form.Field>

          <form.Field name='gender'>
            {field => (
              <Field>
                <FieldLabel>Gender</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!isEditing}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name='age'>
            {field => (
              <Field>
                <FieldLabel>Age</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!isEditing}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name='country'>
            {field => (
              <Field>
                <FieldLabel>Country</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!isEditing}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name='bio'>
            {field => (
              <Field>
                <FieldLabel>Bio</FieldLabel>
                <Input
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  disabled={!isEditing}
                />
              </Field>
            )}
          </form.Field>
        </FieldGroup>

        {isEditing ? (
          <>
            <Button
              type="button"
              variant={'outline'}
              onClick={(e) => {
                e.preventDefault();
                form.reset(); // Returns back to original initialData values safely
                setIsEditing(false);
              }}
              className={'ios-modern-btn ios-modern-btn--default'}
            >
              Cancel
            </Button>
            <Button type="submit" variant={'default'} className={'ios-modern-btn'}>
              Save Changes
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant={'outline'}
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
            className={'ios-modern-btn ios-modern-btn--outline'}
          >
            Edit
          </Button>
        )}
      </form>
    </section>
  )
}