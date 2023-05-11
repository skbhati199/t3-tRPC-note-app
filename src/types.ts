import type { inferRouterOutputs } from "@trpc/server";

import { z } from "zod";

import type {AppRouter } from "./server/api/root"
import { type } from "os";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type allTodoOutput = RouterOutputs["todo"]["all"]

export type Todo = allTodoOutput[number]

export const todoInput = z
  .string({
    required_error: "Describe your todo",
  })
  .min(1)
  .max(50);
