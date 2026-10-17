import { describe, expect, it } from "vitest";
import { companyInput } from "./routers";

const baseCompany = {
  name: "Empresa de teste",
  segment: "Serviços",
  products: "Produto principal",
  services: "Serviço principal",
  targetAudience: "Público de teste",
  voiceTone: "Acolhedor",
  brandColors: "#111111",
  links: "https://example.com",
};

describe("company logoUrl validation", () => {
  it("accepts a company without logoUrl and normalizes empty values to null", () => {
    expect(companyInput.parse(baseCompany)).not.toHaveProperty("logoUrl");
    expect(companyInput.parse({ ...baseCompany, logoUrl: "" }).logoUrl).toBeNull();
    expect(companyInput.parse({ ...baseCompany, logoUrl: "   " }).logoUrl).toBeNull();
    expect(companyInput.parse({ ...baseCompany, logoUrl: null }).logoUrl).toBeNull();
  });

  it("accepts a filled URL after trimming surrounding spaces", () => {
    expect(companyInput.parse({ ...baseCompany, logoUrl: "  https://example.com/logo.png  " }).logoUrl).toBe("https://example.com/logo.png");
  });

  it("rejects an invalid filled URL", () => {
    expect(() => companyInput.parse({ ...baseCompany, logoUrl: "not-a-url" })).toThrow("Logo deve ser uma URL válida");
  });
});
