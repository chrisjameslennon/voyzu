import "server-only";

import Link from "next/link";
import { Breadcrumbs, Button } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

import { PartiesListContent } from "../../client";
import { listParties } from "../lib/party.service";

export async function PartiesListPage() {
  const parties = await listParties();

  return (
    <div className={layoutStyles.listView}>
      <header className={layoutStyles.listHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>

        <div className={layoutStyles.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>
              groups
            </span>
          </div>
          <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>
            Parties
          </h1>
          <div className={layoutStyles.slotTitleByline}>
            <p className={typography.headingByline}>
              Parties provide the underlying data for many business objects such as Customers, Suppliers and Counterparties
            </p>
          </div>
        </div>
        <div className={layoutStyles.slotActions}><Link href="/settings/parties/new"><Button variant="primary" icon="add">Add New Party</Button></Link></div>
      </header>

      <PartiesListContent parties={parties} />
    </div>
  );
}
