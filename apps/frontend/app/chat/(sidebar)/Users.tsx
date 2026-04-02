import { useUserStore } from "@/lib/store/userStore";

export default function Users() {
  const users = useUserStore((state) => state.users);
  const userIndex = useUserStore((state) => state.userIndex);

  // const userList  = Array.from(users.values());

  console.log({ users, userIndex });

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Users</h2>
      <ul>
        {/* {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))} */}
      </ul>
    </div>
  );
}
