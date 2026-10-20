import { z } from "zod";

export const intelligenceModeSchema = z.enum(["plan", "draft", "execute"]);
export type IntelligenceMode = z.infer<typeof intelligenceModeSchema>;

export const taskTypeSchema = z.enum(["reel", "caption", "idea", "campaign"]);
export type TaskType = z.infer<typeof taskTypeSchema>;

export const capabilityNameSchema = z.enum([
  "content.brief",
  "content.script",
  "content.scenes",
  "content.caption",
]);
export type CapabilityName = z.infer<typeof capabilityNameSchema>;

export const contentObjectiveSchema = z.object({
  companyId: z.number().int().positive(),
  taskType: taskTypeSchema,
  goal: z.string().trim().min(1).max(2000),
  briefing: z.string().trim().min(1).max(20000),
  requestedCapabilities: z.array(capabilityNameSchema).max(8).default([]),
  approvalRequired: z.boolean().default(true),
  ownerId: z.never().optional(),
});
export type ContentObjective = z.infer<typeof contentObjectiveSchema>;

export const capabilitySchema = z.object({
  name: capabilityNameSchema,
  description: z.string().min(1),
  available: z.boolean(),
  provider: z.literal("simulator"),
});
export type Capability = z.infer<typeof capabilitySchema>;

export const executionPlanSchema = z.object({
  planId: z.string().min(1),
  ownerId: z.number().int().positive(),
  companyId: z.number().int().positive(),
  taskType: taskTypeSchema,
  mode: intelligenceModeSchema,
  capabilities: z.array(capabilityNameSchema),
  approvalRequired: z.boolean(),
  externalExecutionBlocked: z.literal(true),
  warnings: z.array(z.string()),
});
export type ExecutionPlan = z.infer<typeof executionPlanSchema>;

export const simulationResultSchema = z.object({
  planId: z.string().min(1),
  status: z.enum(["planned", "simulated_draft", "blocked"]),
  simulated: z.literal(true),
  provider: z.enum(["simulator", "none"]),
  content: z.object({
    title: z.string().min(1),
    briefing: z.string().min(1),
    script: z.string().min(1),
    caption: z.string().min(1),
  }),
  warnings: z.array(z.string()),
});
export type SimulationResult = z.infer<typeof simulationResultSchema>;
