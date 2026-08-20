import assert from "node:assert/strict";
import { after, before, test } from "node:test";

import { getPool } from "@voyzu/capability/db";
import {
  areInstalledPackagePageRoutesVisible,
  getHomePageRoute,
  getInstalledPackage,
  isInstalledPackageTopNavigationVisible,
  listInstalledPackages,
  moveInstalledPackage,
  reconcileInstalledPackages,
  updateHomePageRoute,
  updateInstalledPackageVisibility,
} from "@voyzu/package-management/package-management/operations";

let originalHomePage: string;
let originalAuthVisibility: { id: number; topNavigationVisible: boolean; pageRoutesVisible: boolean } | undefined;

before(async () => {
  originalHomePage = await getHomePageRoute();
  const authPackage = (await listInstalledPackages()).find(({ code }) => code === "@voyzu/auth");
  if (authPackage) {
    originalAuthVisibility = {
      id: authPackage.id,
      topNavigationVisible: authPackage.topNavigationVisible,
      pageRoutesVisible: authPackage.pageRoutesVisible,
    };
  }
});

after(async () => {
  await updateHomePageRoute(originalHomePage);
  if (originalAuthVisibility) {
    await updateInstalledPackageVisibility(
      originalAuthVisibility.id,
      originalAuthVisibility.topNavigationVisible,
      originalAuthVisibility.pageRoutesVisible,
    );
  }
  await getPool().end();
});

test("reconcileInstalledPackages and listInstalledPackages expose the package inventory", async () => {
  const reconciled = await reconcileInstalledPackages();
  const listed = await listInstalledPackages();
  assert.ok(reconciled.length > 0);
  assert.deepEqual(listed.map(({ code }) => code), reconciled.map(({ code }) => code));
});

test("getInstalledPackage and visibility operations expose an installed package", async () => {
  const target = (await listInstalledPackages()).find(({ code }) => code === "@voyzu/auth")
    ?? (await listInstalledPackages())[0];
  assert.ok(target);
  assert.equal((await getInstalledPackage(target.id))?.code, target.code);

  const updated = await updateInstalledPackageVisibility(target.id, true, true);
  assert.equal(updated.topNavigationVisible, true);
  assert.equal(updated.pageRoutesVisible, true);
  assert.equal(await isInstalledPackageTopNavigationVisible(target.code), true);
  assert.equal(await areInstalledPackagePageRoutesVisible(target.code), true);
});

test("getHomePageRoute and updateHomePageRoute round-trip the platform setting", async () => {
  assert.equal(await updateHomePageRoute("/operation-test"), "/operation-test");
  assert.equal(await getHomePageRoute(), "/operation-test");
});

test("moveInstalledPackage accepts a navigation boundary move", async () => {
  const navigationPackages = (await listInstalledPackages()).filter(({ hasTopNavigation }) => hasTopNavigation);
  assert.ok(navigationPackages.length > 0);
  const result = await moveInstalledPackage(navigationPackages[0].id, "up");
  assert.ok(result.some(({ id }) => id === navigationPackages[0].id));
});
