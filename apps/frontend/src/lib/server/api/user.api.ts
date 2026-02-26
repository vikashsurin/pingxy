export const fetchUserDetails = async ({
  customFetch,
  id,
}: {
  customFetch: typeof fetch;
  id: number;
}) => {
  const response = await customFetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user details");
  }
  return response.json();
};
