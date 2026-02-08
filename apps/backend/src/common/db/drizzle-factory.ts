import { User } from "@pingxy/shared/types";
import { createFactory } from "hono/factory";

type Env = {
  Variables: {
    user: User;
  };
};

export const factory = createFactory<Env>();
