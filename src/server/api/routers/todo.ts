import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { todoIput } from "~/types";

export const todoRouter = createTRPCRouter({
  all: protectedProcedure.query(() => {
    return [
      {
        id: "fake",
        text: " text fake",
        done: false,
      },
      {
        id: "fake",
        text: " text fake",
        done: false,
      },
      {
        id: "fake",
        text: " text fake",
        done: false,
      },
      {
        id: "fake",
        text: " text fake",
        done: false,
      },
    ];
  }),

  create: protectedProcedure
    .input(todoIput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.create({
        data: {
          text: input,
          user: {
            connect: {
              id: ctx.session.user.id,
            },
          },
        },
      });
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.todo.delete({
        where: {
          id: input,
        },
      });
    }),
  toggle: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        done: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input: { id, done } }) => {
      return ctx.prisma.todo.update({
        where: {
          id,
        },
        data: {
          done,
        },
      });
    }),
});
