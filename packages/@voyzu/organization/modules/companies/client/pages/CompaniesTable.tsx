"use client";

import { Badge } from "@voyzu/ui-components";
import { DataTable, type DataTableColumn } from "@voyzu/ui-components";
import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import { getAvatarColor, getStatusSemanticColor } from "@voyzu/organization/common/client";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";

interface CompaniesTableProps {
  companies: CompanyResponseDto[];
  totalCount: number;
  selectedIds: Set<number>;
  onSelectAll: () => void;
  onSelectOne: (id: number) => void;
  onRowClick?: (company: CompanyResponseDto) => void;
}

const getCompanyStatusLabel = (status: CompanyResponseDto["status"]) => (
  status === "INACTIVE" ? "ARCHIVED" : status
);

export function CompaniesTable({
  companies,
  totalCount,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onRowClick,
}: CompaniesTableProps) {
  const columns: DataTableColumn<CompanyResponseDto>[] = [
    {
      key: "code",
      label: "Code",
      width: "13rem",
      render: (row) => <span className={listStyles.codeCell}>{row.code}</span>,
    },
    {
      key: "name",
      label: "Name",
      render: (row) => {
        const color = getAvatarColor(row.code);

        return (
          <span className={listStyles.nameCell}>
            <span
              className={listStyles.avatar}
              style={{ backgroundColor: color.bg, color: color.fg }}
            >
              {row.name.charAt(0)}
            </span>
            {row.name}
          </span>
        );
      },
    },
    {
      key: "country",
      label: "Country",
      render: (row) => row.country?.name ?? row.countryCode,
    },
    {
      key: "baseCurrencyCode",
      label: "Currency",
      width: "7rem",
    },
    {
      key: "useOrganizationStandardSettings",
      label: "Standard Settings",
      width: "11rem",
      align: "center",
      render: (row) => row.useOrganizationStandardSettings ? (
        <span className={`material-symbols-outlined ${listStyles.successIcon}`} aria-label="Uses organization standard settings">check</span>
      ) : "-",
    },
    {
      key: "status",
      label: "Status",
      width: "8rem",
      align: "center",
      render: (row) => (
        <Badge
          variant="soft"
          size="x-small"
          color={getStatusSemanticColor(row.status)}
        >
          {getCompanyStatusLabel(row.status)}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={companies}
      selectedIds={selectedIds}
      isAllSelected={false}
      isSomeSelected={selectedIds.size > 0}
      onSelectAll={onSelectAll}
      onSelectOne={onSelectOne}
      singleSelect
      onRowClick={onRowClick}
      currentPage={1}
      totalPages={1}
      onPageChange={() => undefined}
      totalCount={totalCount}
      filteredCount={companies.length}
      itemLabel="companies"
      hasData={companies.length > 0}
      emptyIcon="domain_add"
      emptyTitle="No companies found"
      emptyText="Get started by adding a company"
      mobileRender={(row) => {
        const color = getAvatarColor(row.code);

        return (
          <div className={listStyles.mobileCard}>
            <div className={listStyles.mobileCode}>{row.code}</div>
            <div className={listStyles.mobileName}>
              <span
                className={listStyles.avatar}
                style={{ backgroundColor: color.bg, color: color.fg }}
              >
                {row.name.charAt(0)}
              </span>
              <span className={listStyles.mobileNameText}>{row.name}</span>
            </div>
            <div className={listStyles.mobileMeta}>
              {row.country?.name ?? row.countryCode} ({row.baseCurrencyCode}) - {row.useOrganizationStandardSettings ? "Standard settings" : "Company settings"}
            </div>
          </div>
        );
      }}
    />
  );
}
