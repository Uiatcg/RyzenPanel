import { ZodError, ZodType } from "zod";

export async function validateBody<T>(request: Request, schema: ZodType<T>) {
  const body = await request.json();

  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(error.errors.map((issue) => issue.message).join(", "));
    }

    throw error;
  }
}
