import { describe, expect, it } from "vitest";
import { aiGenerationInput, buildGenerationPrompt, parseGeneratedContent } from "./aiContent";

const company = {
  name: "Casa Aurora",
  segment: "Decoração",
  products: "Móveis artesanais",
  services: "Consultoria de ambientes",
  targetAudience: "Pessoas que valorizam casas acolhedoras",
  voiceTone: "Acolhedor e didático",
  brandColors: "Terracota e azul petróleo",
  links: "https://example.com",
};

const validInput = {
  companyId: 7,
  generationType: "reel" as const,
  objective: "Apresentar a nova coleção",
  audience: "Pessoas que estão decorando a casa",
  tone: "Acolhedor e inspirador",
};

describe("AI content generation contract", () => {
  it("validates a bounded generation request", () => {
    expect(aiGenerationInput.parse(validInput)).toEqual(validInput);
    expect(() => aiGenerationInput.parse({ ...validInput, objective: "x" })).toThrow();
    expect(() => aiGenerationInput.parse({ ...validInput, companyId: 0 })).toThrow();
  });

  it("includes the selected company and request context in the prompt", () => {
    const prompt = buildGenerationPrompt(company, validInput);
    expect(prompt).toContain("Casa Aurora");
    expect(prompt).toContain("Apresentar a nova coleção");
    expect(prompt).toContain("Pessoas que estão decorando a casa");
    expect(prompt).toContain("Responda somente com um objeto JSON válido");
  });

  it("parses plain and fenced JSON responses", () => {
    const value = { title: "Coleção Aurora", briefing: "Resumo", script: "Roteiro", scenes: "Cena 1", caption: "Conheça a coleção." };
    expect(parseGeneratedContent(JSON.stringify(value))).toEqual(value);
    expect(parseGeneratedContent(`\`\`\`json\n${JSON.stringify(value)}\n\`\`\``)).toEqual(value);
  });

  it("rejects incomplete or non-JSON responses", () => {
    expect(() => parseGeneratedContent("não é JSON")).toThrow("JSON válido");
    expect(() => parseGeneratedContent(JSON.stringify({ title: "Sem campos" }))).toThrow("formato de conteúdo inválido");
  });
});
