import assert from "node:assert/strict";
import { describe, it, after } from "node:test";

import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organization/organization.response.dto";
import type { OrganizationUpdateRequestDto } from "@voyzu/organization/types/modules/organization/organization.update.request.dto";

import { getPool } from "@voyzu/capability/db";
import {
  getOrganization,
  updateOrganization,
} from "../../../modules/organization/operations";

let originalName: string;

after(async () => {
  // Restore original name if we changed it
  if (originalName) {
    await updateOrganization({ organizationName: originalName });
  }
  await getPool().end();
});

describe("organization.service", () => {
  it("gets the organization", async () => {
    const org = await getOrganization();
    assert.ok(org, "organization should exist");

    assert.ok(org.id > 0);
    assert.ok(org.code);
    assert.ok(org.organizationName);
    assert.ok(org.audit.created.date);
    assert.ok(org.audit.updated.date);

    originalName = org.organizationName;
  });

  it("updates the organization name", async () => {
    const input: OrganizationUpdateRequestDto = {
      organizationName: "Updated Org Name",
    };
    const org: OrganizationResponseDto = await updateOrganization(input);

    assert.equal(org.organizationName, "Updated Org Name");
    assert.ok(org.audit.updated.date);
  });

  it("persists the update — get returns updated values", async () => {
    const org = await getOrganization();
    assert.ok(org);
    assert.equal(org.organizationName, "Updated Org Name");
  });

  it("rejects empty organization name", async () => {
    await assert.rejects(
      () => updateOrganization({ organizationName: "" }),
      (err: Error) => {
        assert.ok(err.message.includes("Organization name is required"));
        return true;
      },
    );
  });

  it("rejects whitespace-only organization name", async () => {
    await assert.rejects(
      () => updateOrganization({ organizationName: "   " }),
      (err: Error) => {
        assert.ok(err.message.includes("Organization name is required"));
        return true;
      },
    );
  });
});
