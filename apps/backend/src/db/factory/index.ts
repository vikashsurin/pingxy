import { PublicUser } from "@chat/shared/src/lib/utils/validation";
import { createFactory } from "hono/factory";

type Env = {
  Variables: {
    user: PublicUser;
  };
};

export const factory = createFactory<Env>();
