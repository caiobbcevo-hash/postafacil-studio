import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createCompanyForOwner,
  createContentForOwner,
  deleteCompanyForOwner,
  deleteContentForOwner,
  getCompanyForOwner,
  getContentForOwner,
  listCompaniesForOwner,
  listContentsForOwner,
  updateCompanyForOwner,
  updateContentForOwner,
} from "./db";
import { COOKIE_NAME } from "@shared/const";
import { normalizeOptionalUrl } from "@shared/optionalUrl";

const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} é obrigatório`).max(max, `${label} excede o limite`);

export const companyInput = z.object({
  name: requiredText("Nome", 160),
  segment: requiredText("Segmento", 160),
  products: requiredText("Produtos", 10000),
  services: requiredText("Serviços", 10000),
  targetAudience: requiredText("Público-alvo", 10000),
  voiceTone: requiredText("Tom de voz", 120),
  brandColors: requiredText("Cores", 1000),
  links: requiredText("Links", 4000),
  logoUrl: z.preprocess(
    normalizeOptionalUrl,
    z.string().trim().url("Logo deve ser uma URL válida").max(2048).nullable().optional()
  ),
});

const contentInput = z.object({
  companyId: z.number().int().positive(),
  title: requiredText("Título", 200),
  contentType: z.enum(["reel", "carrossel", "story"]),
  format: requiredText("Formato", 32),
  duration: requiredText("Duração", 32),
  briefing: requiredText("Briefing", 20000),
  script: requiredText("Roteiro", 30000),
  scenes: requiredText("Cenas", 30000),
  voice: requiredText("Narração", 160),
  track: requiredText("Trilha", 160),
  caption: requiredText("Legenda", 30000),
  plannedAt: z.coerce.date().nullable().optional(),
  status: z.enum(["draft", "pending_approval", "approved", "scheduled", "published", "failed"]).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  companies: router({
    list: protectedProcedure.query(({ ctx }) => listCompaniesForOwner(ctx.user.id)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getCompanyForOwner(ctx.user.id, input.id)),
    create: protectedProcedure.input(companyInput).mutation(({ ctx, input }) => createCompanyForOwner(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: companyInput.partial() })).mutation(({ ctx, input }) => updateCompanyForOwner(ctx.user.id, input.id, input.data)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await deleteCompanyForOwner(ctx.user.id, input.id);
      return { success: true } as const;
    }),
  }),
  contents: router({
    list: protectedProcedure.input(z.object({ companyId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => listContentsForOwner(ctx.user.id, input?.companyId)),
    get: protectedProcedure.input(z.object({ id: z.number().int().positive() })).query(({ ctx, input }) => getContentForOwner(ctx.user.id, input.id)),
    create: protectedProcedure.input(contentInput).mutation(({ ctx, input }) => createContentForOwner(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: contentInput.partial() })).mutation(({ ctx, input }) => updateContentForOwner(ctx.user.id, input.id, input.data)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await deleteContentForOwner(ctx.user.id, input.id);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
