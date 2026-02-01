import { PublicUser } from "@pingxy/shared/types";
import { createFactory } from "hono/factory";

type Env = {
  Variables: {
    user: PublicUser;
  };
};

export const factory = createFactory<Env>();
