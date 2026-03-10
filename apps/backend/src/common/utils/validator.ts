import { zValidator } from "@hono/zod-validator";
import { ValidationTargets } from "hono";
import { ZodType } from "zod";

export const validate = <
  T extends ZodType,
  Target extends keyof ValidationTargets,
>(
  target: Target,
  schema: T,
) => {
  return zValidator(target, schema, (result, ctx) => {
    console.log({ validation: result });
    if (!result.success) {
      return ctx.json(
        {
          success: false,
          message: "Validation failed",
          errors: result.error._zod.def,
        },
        400,
      );
    }
  });
};
