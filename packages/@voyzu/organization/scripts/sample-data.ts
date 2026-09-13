import { activateOrganization, createOrganization, getOrganization, patchOrganization } from "../modules/organizations/server/lib/organization.service";

const SAMPLE_ORGANIZATION = {
  code: "TESTCO",
  name: "Test Company",
  countryCode: "NZ",
  baseCurrencyCode: "NZD",
} as const;

/** Creates the shared organization used informally by package sample-data scripts. */
export async function sampleData(): Promise<void> {
  const existing = await getOrganization(SAMPLE_ORGANIZATION.code);

  if (!existing) {
    await createOrganization(SAMPLE_ORGANIZATION);
    console.log("Created sample organization TESTCO (Test Company).");
    return;
  }

  if (
    existing.name !== SAMPLE_ORGANIZATION.name
    || existing.countryCode !== SAMPLE_ORGANIZATION.countryCode
    || existing.baseCurrencyCode !== SAMPLE_ORGANIZATION.baseCurrencyCode
  ) {
    await patchOrganization(SAMPLE_ORGANIZATION.code, {
      name: SAMPLE_ORGANIZATION.name,
      countryCode: SAMPLE_ORGANIZATION.countryCode,
      baseCurrencyCode: SAMPLE_ORGANIZATION.baseCurrencyCode,
    });
  }

  if (existing.status !== "ACTIVE") {
    await activateOrganization(SAMPLE_ORGANIZATION.code);
  }

  console.log("Sample organization TESTCO (Test Company) is ready.");
}

export default sampleData;
