import { z } from "zod";

export const todoIput = z
  .string({
    required_error: "Describe your todo",
  })
  .min(1)
  .max(50);
