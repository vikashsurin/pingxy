import { capitalizeFirst } from '@chat/shared/utils';
import { factory } from "@core/db/drizzle-factory";
import { selectUserByUsername } from "./internal/user.queries";

const app = factory.createApp();


app.get("/check", async (c) => {

  const username = c.req.query('username')
  if (!username || username === '') {
    return c.json({ error: 'username cannot be empty' }, 400)
  }

  const UserName = capitalizeFirst(username ?? '')

  let available: boolean;
  const result = await selectUserByUsername(UserName)

  if (result.length > 0) {
    available = false
  } else {
    available = true
  }

  return c.json({ available: available })
})


export const userRouter = app;
