export const getUser = async (id: number) => {
  const response = await fetch(`/api/users/id/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const data = await response.json();
  return data;
};
