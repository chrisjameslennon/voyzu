import assert from "node:assert/strict";
import { test } from "node:test";
import Type from "typebox";
import type { SemanticDataProvider } from "@voyzu/types/contracts";
import { createContracts, resolveContractConfiguration } from "./index";

const definitions = {
  specPlanet: {
    identifier: "PlanetId", identifierDataDefinition: Type.String(),
    dataDefinition: Type.Object({ name: Type.String() }),
    queries: { all: { inputDataDefinition: Type.Object({}, { additionalProperties: false }) } },
  },
  "specPlanet.mountains": {
    extends: "specPlanet", dataDefinition: Type.Object({ mountains: Type.Array(Type.String()) }),
    queries: { high: { inputDataDefinition: Type.Object({ minimumHeightMeters: Type.Number() }, { additionalProperties: false }) } },
  },
  "specPlanet.geography": { extends: "specPlanet", extensions: ["specPlanet.mountains"] },
} as const;
const capabilityDefinitions = {
  "specPlanet.operations": { functions: { ping: {}, assess: { input: Type.String(), output: Type.Boolean() } } },
} as const;
type FixtureData = typeof definitions;
type FixtureCapabilities = typeof capabilityDefinitions;
declare module "./index" {
  interface SemanticDataContracts extends FixtureData {}
  interface CapabilityContracts extends FixtureCapabilities {}
}
const planet = { PlanetId: "Sol III", name: "Earth" };
const mountains = { PlanetId: "Sol III", mountains: ["Mount Everest"] };
function fixture(overrides: Record<string, SemanticDataProvider | null> = {}) {
  const providers: Record<string, SemanticDataProvider> = {
    specPlanet: { get: async id => id === planet.PlanetId ? planet : null, queries: { all: async () => [planet] } },
    "specPlanet.mountains": {
      get: async id => id === mountains.PlanetId ? mountains : null,
      queries: { high: async ({ minimumHeightMeters }) => minimumHeightMeters <= 8849 ? [mountains] : [] },
    },
    "specPlanet.geography": { get: (id: string): Promise<unknown> => runtime.semanticData.compose("specPlanet.geography", id) },
  };
  for (const [name, provider] of Object.entries(overrides)) {
    if (provider === null) delete providers[name]; else providers[name] = provider;
  }
  const runtime = createContracts([{ name: "fixture", contracts: {
    semanticDataDefinition: { defines: definitions, implements: providers },
    semanticCapabilityDefinition: { defines: capabilityDefinitions },
  } }]);
  return runtime;
}

test("data get returns only its contribution; composition merges complete records", async () => {
  const { semanticData: data } = fixture();
  assert.deepEqual(await data.get("specPlanet.mountains", "Sol III"), mountains);
  assert.deepEqual(await data.get("specPlanet.geography", "Sol III"), { ...planet, ...mountains });
  assert.deepEqual(await data.get("specPlanet.geography", "Sol III", { includeContractNames: true }), {
    specPlanet: planet, "specPlanet.mountains": mountains,
  });
  assert.equal(await data.get("specPlanet", "missing"), null);
});

test("optional retrieval distinguishes unavailable implementation from empty query results", async () => {
  const { semanticData: data } = fixture({ specPlanet: null });
  await assert.rejects(data.get("specPlanet", "Sol III"), /No implementation/);
  assert.equal(await data.getOptional("specPlanet", "Sol III"), null);
  await assert.rejects(data.query("specPlanet", "all", {}), /No implementation/);
  assert.equal(await data.queryOptional("specPlanet", "all", {}), null);
  assert.deepEqual(await fixture().semanticData.queryOptional("specPlanet.mountains", "high", { minimumHeightMeters: 9000 }), []);
});

test("composition returns null for a missing record, never a partial shape", async () => {
  const { semanticData: data } = fixture({
    "specPlanet.mountains": { get: async () => null, queries: { high: async () => [] } },
  });
  assert.equal(await data.get("specPlanet.geography", "Sol III"), null);
  assert.equal(await data.getOptional("specPlanet.geography", "Sol III"), null);
});

test("missing composition implementation errors even if the root record is absent", async () => {
  const { semanticData: data } = fixture({ "specPlanet.mountains": null });
  await assert.rejects(data.get("specPlanet.geography", "missing"), /No implementation/);
  assert.equal(await data.getOptional("specPlanet.geography", "missing"), null);
  assert.equal(data.isImplemented("specPlanet.geography"), false);
});

test("queries return full identified records and support wrapping", async () => {
  const { semanticData: data } = fixture();
  assert.deepEqual(await data.query("specPlanet.mountains", "high", { minimumHeightMeters: 8000 }), [mountains]);
  assert.deepEqual(await data.query("specPlanet.mountains", "high", { minimumHeightMeters: 8000 }, { includeContractNames: true }), [{ "specPlanet.mountains": mountains }]);
});

test("optional retrieval propagates provider, schema and undefined-contract errors", async () => {
  const failure = new Error("provider failed");
  const { semanticData: data } = fixture({ specPlanet: { get: async () => { throw failure; }, queries: { all: async () => { throw failure; } } } });
  await assert.rejects(data.getOptional("specPlanet", "Sol III"), error => error === failure);
  await assert.rejects(data.queryOptional("specPlanet", "all", {}), error => error === failure);
  await assert.rejects(data.getOptional("undefined" as never, "Sol III" as never), /Undefined/);
  await assert.rejects(data.queryOptional("specPlanet", "undefined" as never, {}), /Undefined query/);
  await assert.rejects(data.getOptional("specPlanet", 1 as never), /identifier/);
});

test("outputs reject extra fields, missing identifiers and identifier mismatches", async () => {
  for (const output of [{ ...planet, extra: true }, { name: "Earth" }, { ...planet, PlanetId: "Sol IV" }]) {
    const { semanticData: data } = fixture({ specPlanet: { get: async () => output, queries: { all: async () => [output] } } });
    await assert.rejects(data.get("specPlanet", "Sol III"));
  }
  const { semanticData: data } = fixture({ specPlanet: { get: async () => planet, queries: { all: async () => [{ name: "Earth" }] } } });
  await assert.rejects(data.queryOptional("specPlanet", "all", {}), /output/);
});

test("registration rejects nested extensions, field collisions and missing queries", () => {
  assert.throws(() => resolveContractConfiguration([{ name: "bad", contracts: { semanticDataDefinition: { defines: {
    ...definitions, "specPlanet.nested": { extends: "specPlanet.mountains", dataDefinition: Type.Object({ note: Type.String() }) },
  } } } }]), /nesting/);
  assert.throws(() => resolveContractConfiguration([{ name: "bad", contracts: { semanticDataDefinition: { defines: {
    ...definitions, "specPlanet.mountains": { extends: "specPlanet", dataDefinition: Type.Object({ name: Type.String() }) },
  } } } }]), /Duplicate composition field/);
  assert.throws(() => fixture({ specPlanet: { get: async () => planet } }), /requires query/);
});

test("capability functions permit omitted input/output and validate declared results", async () => {
  const runtime = createContracts([{ name: "operations", contracts: { semanticCapabilityDefinition: {
    defines: capabilityDefinitions,
    implements: { "specPlanet.operations": { ping: async () => undefined, assess: async (value: string) => value === "Sol III" } },
  } } }]);
  const capability = runtime.capabilities.use("specPlanet.operations");
  assert.equal(await capability.ping(), undefined);
  assert.equal(await capability.assess("Sol III"), true);
  assert.equal(fixture().capabilities.optional("specPlanet.operations"), undefined);
  assert.throws(() => fixture().capabilities.use("specPlanet.operations"), /No implementation/);
});
