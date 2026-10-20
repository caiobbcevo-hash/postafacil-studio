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
import { TRPCError } from "@trpc/server";
import { aiGenerationInput, generateContentForOwner } from "./aiContent";
import { contentObjectiveSchema, intelligenceModeSchema } from "./intelligence/contracts";
import { IntelligenceError } from "./intelligence/errors";
import { buildExecutionPlan } from "./intelligence/planner";
import { authorizeObjective } from "./intelligence/policy";
import { createCapabilityRegistry } from "./intelligence/registry";
import { simulateDraft, simulateExecute, simulatePlan } from "./intelligence/providers/simulator";
import { verifySimulationResult } from "./intelligence/verification";

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

const contentFields = z.object({
  companyId: z.number().int().positive(),
  title: requiredText("Título", 200),
  contentType: z.enum(["reel", "carrossel", "story"]),
  generationType: z.enum(["caption", "reel", "idea", "campaign"]).default("reel"),
  format: requiredText("Formato", 32),
  duration: requiredText("Duração", 32),
  briefing: requiredText("Briefing", 20000),
  script: requiredText("Roteiro", 30000),
  scenes: requiredText("Cenas", 30000),
  voice: requiredText("Narração", 160),
  track: requiredText("Trilha", 160),
  caption: requiredText("Legenda", 30000),
  plannedAt: z.coerce.date().nullable().optional(),
});

const contentCreateInput = contentFields;
const contentUpdateInput = contentFields
  .partial()
  .extend({ status: z.literal("draft").optional() })
  .strict()
  .transform(({ status: _status, ...data }) => data);

export const appRouter = router({
  system: systemRouter,
  intelligence: router({
    run: protectedProcedure
      .input(z.object({ mode: intelligenceModeSchema, objective: contentObjectiveSchema }))
      .mutation(async ({ ctx, input }) => {
        try {
          const company = await getCompanyForOwner(ctx.user.id, input.objective.companyId);
          const authorization = authorizeObjective({
            authenticatedOwnerId: ctx.user.id,
            objective: input.objective,
            company,
            mode: input.mode,
          });
          const plan = buildExecutionPlan({
            objective: input.objective,
            ownerId: authorization.ownerId,
            mode: input.mode,
            registry: createCapabilityRegistry(),
          });
          const result = input.mode === "plan"
            ? simulatePlan(plan)
            : input.mode === "draft"
              ? simulateDraft(plan, input.objective)
              : simulateExecute(plan);
          return { plan, result: verifySimulationResult(result, plan) };
        } catch (error) {
          if (error instanceof IntelligenceError) {
            const code = error.code === "UNAUTHENTICATED" ? "UNAUTHORIZED"
              : error.code === "COMPANY_NOT_FOUND" || error.code === "COMPANY_NOT_OWNED" ? "NOT_FOUND"
                : error.code === "INVALID_OBJECTIVE" ? "BAD_REQUEST"
                  : error.code === "EXTERNAL_EXECUTION_BLOCKED" ? "PRECONDITION_FAILED"
                    : "BAD_REQUEST";
            throw new TRPCError({ code, message: error.message });
          }
          throw error;
        }
      }),
  }),
  ai: router({
    generateContent: protectedProcedure.input(aiGenerationInput).mutation(async ({ ctx, input }) => {
      try {
        return await generateContentForOwner(ctx.user.id, input);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        if (message.includes("MANUS_API_URL") || message.includes("MANUS_API_KEY")) {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Geração de IA indisponível: configure o serviço Manus no ambiente do servidor." });
        }
        if (message.includes("Empresa não encontrada")) {
          throw new TRPCError({ code: "NOT_FOUND", message });
        }
        console.error("[AI] Content generation failed", { message });
        throw new TRPCError({ code: "BAD_GATEWAY", message: "O provedor de IA não retornou um conteúdo utilizável. Tente novamente." });
      }
    }),
  }),
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
    create: protectedProcedure.input(contentCreateInput).mutation(({ ctx, input }) => createContentForOwner(ctx.user.id, input)),
    update: protectedProcedure.input(z.object({ id: z.number().int().positive(), data: contentUpdateInput })).mutation(({ ctx, input }) => updateContentForOwner(ctx.user.id, input.id, input.data)),
    delete: protectedProcedure.input(z.object({ id: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await deleteContentForOwner(ctx.user.id, input.id);
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
