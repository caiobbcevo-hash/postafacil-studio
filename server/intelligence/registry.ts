import { IntelligenceError } from "./errors";
import type { Capability, CapabilityName } from "./contracts";

const definitions: Capability[] = [
  {
    name: "content.brief",
    description: "Organiza o briefing do conteúdo.",
    available: true,
    provider: "simulator",
  },
  {
    name: "content.script",
    description: "Estrutura um roteiro textual.",
    available: true,
    provider: "simulator",
  },
  {
    name: "content.scenes",
    description: "Divide o roteiro em cenas.",
    available: true,
    provider: "simulator",
  },
  {
    name: "content.caption",
    description: "Prepara uma legenda textual.",
    available: true,
    provider: "simulator",
  },
];

export function createCapabilityRegistry(
  overrides: Partial<Record<CapabilityName, { available: boolean }>> = {}
) {
  const capabilities = new Map(
    definitions.map(capability => [
      capability.name,
      { ...capability, ...(overrides[capability.name] ?? {}) },
    ])
  );

  return {
    list(): Capability[] {
      return [...capabilities.values()].map(capability => ({ ...capability }));
    },
    get(name: CapabilityName): Capability | undefined {
      const capability = capabilities.get(name);
      return capability ? { ...capability } : undefined;
    },
    require(names: CapabilityName[]): Capability[] {
      return names.map(name => {
        const capability = capabilities.get(name);
        if (!capability || !capability.available) {
          throw new IntelligenceError(
            "CAPABILITY_UNAVAILABLE",
            `Capability indisponível: ${name}`
          );
        }
        return { ...capability };
      });
    },
  };
}

export type CapabilityRegistry = ReturnType<typeof createCapabilityRegistry>;
