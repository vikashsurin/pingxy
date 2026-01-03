import { fail } from "@sveltejs/kit";



export const actions = {
  update: async ({ request, cookies, fetch }) => {
    const data = await request.formData();
    const country = data.get("country");
    const bio = data.get("bio");
    const gender = data.get("gender");

    // Validation
    if (!country) {
      return fail(400, { missing: true });
    }

    // Prepare update payload
    const payload = {
      country,
      bio,
      gender
    };
    
    const response = await fetch("http://localhost:3000/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        cookie: request.headers.get("cookie") || ""
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
       return fail(response.status, { error: true });
    }

    const resData = await response.json();
    console.log(resData);

    return { success: true, user: resData.user };
  },
};
