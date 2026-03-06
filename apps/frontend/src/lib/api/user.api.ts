export const createUserApi = (customFetch: typeof fetch = fetch) => ({
  fetchUserDetails: async ({ id }: { id: number }) => {
    const response = await customFetch(`/api/users/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }
    return await response.json();
  },
});
