"use client";

import { DetailBackButton } from "@voyzu/ui-surface/client";
import { getAuditActionColor } from "@voyzu/audit/client";
import type {
  AuditEventListResponseDto,
  AuditEventResponseDto,
  AuditEventCountResponseDto,
} from "@voyzu/audit/types";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";

import { Badge } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";
import { DatePicker } from "@voyzu/ui-components";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";
import { Breadcrumbs } from "@voyzu/ui-components";
import { DataTable, type DataTableColumn } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { SearchableSelect } from "@voyzu/ui-components";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import styles from "./audit-event-list.module.css";

interface FinancialYearResponseDto {
  code: string;
  startDate: string;
  endDate: string;
}

const ENTITY_TYPES = [
  "organization",
  "company",
  "control_account",
  "financial_document_default",
  "financial_document_type",
  "currency",
  "country",
  "dimension",
  "fiscal_period",
  "fiscal_year",
  "gl_account",
  "journal_header",
  "journal_line",
  "gl_account_category",
];

function formatEntityType(t: string): string {
  return t.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const ENTITY_TYPE_OPTIONS = [
  { value: "", label: "All types" },
  ...ENTITY_TYPES.map((t) => ({ value: t, label: formatEntityType(t) })),
];

const ITEMS_PER_PAGE = 100;
const API_BASE_PATH = "/api/audit";
const ROUTE_BASE_PATH = "/settings/audit";

function toIso(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function rangeForPreset(value: string, year: FinancialYearResponseDto | undefined): { fromDate: string; toDate: string } {
  const today = new Date();
  const yearStart = year?.startDate;
  const yearEnd = year?.endDate;

  const clamp = (fromDate: string, toDate: string) => ({
    fromDate: yearStart && fromDate < yearStart ? yearStart : fromDate,
    toDate: yearEnd && toDate > yearEnd ? yearEnd : toDate,
  });

  if (value === "this-month") {
    return clamp(toIso(new Date(today.getFullYear(), today.getMonth(), 1)), toIso(today));
  }

  if (value === "previous-90-days") {
    return clamp(toIso(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90)), toIso(today));
  }

  if (value === "previous-2-complete-months") {
    return clamp(toIso(new Date(today.getFullYear(), today.getMonth() - 2, 1)), toIso(new Date(today.getFullYear(), today.getMonth(), 0)));
  }

  if (value === "previous-3-complete-months") {
    return clamp(toIso(new Date(today.getFullYear(), today.getMonth() - 3, 1)), toIso(new Date(today.getFullYear(), today.getMonth(), 0)));
  }

  if (value === "previous-6-complete-months") {
    return clamp(toIso(new Date(today.getFullYear(), today.getMonth() - 6, 1)), toIso(new Date(today.getFullYear(), today.getMonth(), 0)));
  }

  if (value === "entire-financial-year" && year) {
    return { fromDate: year.startDate, toDate: year.endDate };
  }

  return clamp(toIso(new Date(today.getFullYear(), today.getMonth() - 1, 1)), toIso(new Date(today.getFullYear(), today.getMonth(), 0)));
}

const columns: DataTableColumn<AuditEventResponseDto>[] = [
  { key: "code", label: "Code", width: 130 },
  { key: "packageCode", label: "Package", width: 190 },
  { key: "companyCode", label: "Company", width: 130, render: (e) => e.companyCode ?? "-" },
  {
    key: "creationDate",
    label: "Timestamp",
    width: 180,
    render: (e) => {
      const d = new Date(e.creationDate);
      const p = (n: number) => String(n).padStart(2, "0");
      return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}:${p(d.getUTCSeconds())} UTC`;
    },
  },
  { key: "entityType", label: "Entity Type", width: 160 },
  { key: "entityCode", label: "Entity Code", width: 180, render: (e) => e.entityCode ?? "-" },
  { key: "entityId", label: "Entity ID", width: 140 },
  {
    key: "action",
    label: "Action",
    align: "center",
    width: 90,
    render: (e) => (
      <Badge variant="soft" size="x-small" color={getAuditActionColor(e.action)}>
        {e.action}
      </Badge>
    ),
  },
  {
    key: "actorCode",
    label: "User",
    width: 210,
    render: (e) => <AuditActorDisplay event={e} />,
  },
];

function AuditActorDisplay({ event }: { event: AuditEventResponseDto }) {
  if (event.actorDisplayName || event.actorCode) {
    return (
      <>
        {event.actorDisplayName ?? event.actorCode}
        {event.actorCode ? (
          <>
            {" "}
            <Badge variant="soft" size="x-small" color="neutral">
              {event.actorCode}
            </Badge>
          </>
        ) : null}
      </>
    );
  }
  return event.actorId ?? `(${event.actorType})`;
}

interface AuditEventListProps {
  companies: AuditCompanyOption[];
  companyReadOnly?: boolean;
  suppressInitialDateFilter?: boolean;
  initialCompanyId?: string;
  initialFinancialYears: FinancialYearResponseDto[];
  initialSelectedYearCode: string;
  initialDateFrom: string;
  initialDateTo: string;
  initialEntityType?: string;
  initialEntityCode?: string;
  initialEntityId?: string;
  initialMutationId?: string;
  backFromCode?: string;
}

interface AuditCompanyOption {
  id: number;
  code: string;
  name: string;
}

interface PageInfo {
  page: number;
  cursor: string | null;
}

export function AuditEventList({
  companies,
  companyReadOnly = false,
  suppressInitialDateFilter = false,
  initialCompanyId = "",
  initialFinancialYears,
  initialSelectedYearCode,
  initialDateFrom,
  initialDateTo,
  initialEntityType = "",
  initialEntityCode = "",
  initialEntityId = "",
  initialMutationId = "",
  backFromCode,
}: AuditEventListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = usePathname().split("/").filter(Boolean).pop() ?? "export";

  // Filter UI values
  const [search, setSearch] = useState("");
  const [companyId, setCompanyId] = useState(initialCompanyId);
  const [availableCompanies, setAvailableCompanies] = useState(companies);
  const [packageCode, setPackageCode] = useState("");
  const [packageOptions, setPackageOptions] = useState([{ value: "", label: "All packages" }]);
  const [financialYears, setFinancialYears] = useState<FinancialYearResponseDto[]>(initialFinancialYears);
  const [selectedYearCode, setSelectedYearCode] = useState(initialSelectedYearCode);
  const [rangePreset, setRangePreset] = useState(initialDateFrom || initialDateTo ? "previous-90-days" : "all-dates");
  const [rangeLabel, setRangeLabel] = useState(initialDateFrom || initialDateTo ? "Previous 90 days" : "All dates");
  const [entityType, setEntityType] = useState(initialEntityType);
  const [entityCode, setEntityCode] = useState(initialEntityCode);
  const [entityId, setEntityId] = useState(initialEntityId);
  const [mutationId, setMutationId] = useState(initialMutationId);
  const [actorId, setActorId] = useState("");
  const [dateFrom, setDateFrom] = useState(initialDateFrom);
  const [dateTo, setDateTo] = useState(initialDateTo);
  const [dateFilterSuppressed, setDateFilterSuppressed] = useState(suppressInitialDateFilter);

  // Debounced text filter values (drive the API fetch)
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [debouncedEntityCode, setDebouncedEntityCode] = useState(initialEntityCode);
  const [debouncedEntityId, setDebouncedEntityId] = useState(initialEntityId);
  const [debouncedActorId, setDebouncedActorId] = useState("");

  // Server-driven data
  const [items, setItems] = useState<AuditEventResponseDto[]>([]);
  const [totalMatching, setTotalMatching] = useState(0);
  const [totalDbCount, setTotalDbCount] = useState<number | null>(null);

  // Pagination - pageInfo drives the fetch effect
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, cursor: null });
  // Cursor stack: cursorStackRef[n] = cursor needed to fetch page n+1
  const cursorStackRef = useRef<(string | null)[]>([null]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedYear = useMemo(
    () => financialYears.find((year) => year.code === selectedYearCode),
    [financialYears, selectedYearCode],
  );

  const fetchYears = useCallback(async (cId: number) => {
    if (!cId) {
      setFinancialYears([]);
      setSelectedYearCode("");
      return;
    }
    const res = await fetch("/api/financial-years");
    if (!res.ok) {
      setFinancialYears([]);
      setSelectedYearCode("");
      return;
    }
    const years = (await res.json()) as FinancialYearResponseDto[];
    setFinancialYears(years);

    const today = toIso(new Date());
    const nextYear = years.find((year) => year.startDate <= today && today <= year.endDate) ?? years[0];
    setSelectedYearCode(nextYear?.code ?? "");
    if (nextYear) {
      if (rangePreset === "all-dates") {
        setDateFrom("");
        setDateTo("");
        return;
      }
      const range = rangeForPreset(rangePreset, nextYear);
      setDateFrom(range.fromDate);
      setDateTo(range.toDate);
    }
  }, [rangePreset]);

  useEffect(() => {
    if (!suppressInitialDateFilter) return;
    setRangePreset("all-dates");
    setRangeLabel("All dates");
    setDateFrom("");
    setDateTo("");
    setDateFilterSuppressed(true);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  }, [suppressInitialDateFilter, initialEntityType, initialEntityCode, initialEntityId, initialMutationId]);

  // Fetch total DB count once on mount (async, independent of filters)
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/installed-packages", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((packages: Array<{ code: string; description?: string }>) => {
        setPackageOptions([
          { value: "", label: "All packages" },
          ...packages.map((item) => ({ value: item.code, label: item.description || item.code, code: item.code })),
        ]);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/organization/companies", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : [])
      .then((items: AuditCompanyOption[]) => setAvailableCompanies(items))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (packageCode) params.set("packageCode", packageCode);
    fetch(`${API_BASE_PATH}/count?${params.toString()}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((response: AuditEventCountResponseDto) => setTotalDbCount(response.count))
      .catch(() => { /* ignore abort */ });
    return () => controller.abort();
  }, [packageCode]);

  // Debounce text fields - on change, also reset pagination
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setDebouncedEntityCode(entityCode);
      setDebouncedEntityId(entityId);
      setDebouncedActorId(actorId);
      cursorStackRef.current = [null];
      setPageInfo({ page: 1, cursor: null });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, entityCode, entityId, actorId]);

  const handleSearch = (value: string) => {
    setSearch(value);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  const handleEntityCodeChange = (value: string) => {
    setEntityCode(value);
  };

  const handleEntityIdChange = (value: string) => {
    setEntityId(value);
  };

  const handleActorIdChange = (value: string) => {
    setActorId(value);
  };

  // Immediate filters reset pagination.
  const handleCompanyChange = (value: string) => {
    if (companyReadOnly) return;
    setCompanyId(value);
    void fetchYears(Number(value));
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  const handlePackageChange = (value: string) => {
    setPackageCode(value);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  const applyPreset = useCallback((value: string, label: string, year: FinancialYearResponseDto | undefined) => {
    const range = rangeForPreset(value, year);
    setRangePreset(value);
    setRangeLabel(label);
    setDateFilterSuppressed(false);
    setDateFrom(range.fromDate);
    setDateTo(range.toDate);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  }, []);

  const clearDateRange = useCallback(() => {
    setRangePreset("all-dates");
    setRangeLabel("All dates");
    setDateFilterSuppressed(true);
    setDateFrom("");
    setDateTo("");
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  }, []);

  const handleEntityTypeChange = (value: string) => {
    setEntityType(value);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  const handleDateFromChange = (value: string) => {
    setRangePreset("custom");
    setRangeLabel(value || dateTo ? "Custom" : "All dates");
    setDateFilterSuppressed(false);
    setDateFrom(value);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  const handleDateToChange = (value: string) => {
    setRangePreset("custom");
    setRangeLabel(dateFrom || value ? "Custom" : "All dates");
    setDateFilterSuppressed(false);
    setDateTo(value);
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
  };

  // Main fetch - driven by pageInfo and debounced filter values
  useEffect(() => {
    const controller = new AbortController();
    const urlParams = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
    const urlDateModeAll = urlParams.get("dateMode") === "all";
    const suppressDatesForFetch = dateFilterSuppressed || urlDateModeAll;

    const params = new URLSearchParams();
    if (packageCode) params.set("packageCode", packageCode);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (companyId) params.set("companyId", companyId);
    if (entityType) params.set("entityType", entityType);
    if (debouncedEntityCode) params.set("entityCode", debouncedEntityCode);
    if (debouncedEntityId) params.set("entityId", debouncedEntityId);
    if (mutationId) params.set("mutationId", mutationId);
    if (debouncedActorId) params.set("actorId", debouncedActorId);
    if (!suppressDatesForFetch && dateFrom) params.set("dateFrom", dateFrom);
    if (!suppressDatesForFetch && dateTo) params.set("dateTo", dateTo);
    if (pageInfo.cursor) params.set("cursor", pageInfo.cursor);

    setLoading(true);

    const doFetch = async () => {
      try {
          const res = await fetch(`${API_BASE_PATH}?${params.toString()}`, { signal: controller.signal });
        if (res.ok) {
          const list = await res.json() as AuditEventListResponseDto;
          setItems(list.items);
          setTotalMatching(list.totalMatching);
          setSelectedIds(new Set());
          if (list.nextCursor) {
            cursorStackRef.current[pageInfo.page] = list.nextCursor;
          }
        }
        setLoading(false);
      } catch {
        // AbortError on filter change or unmount - a new fetch is already queued,
        // leave loading=true so the spinner stays visible between fetches
      }
    };

    void doFetch();
    return () => controller.abort();
  }, [pageInfo, packageCode, debouncedSearch, companyId, entityType, debouncedEntityCode, debouncedEntityId, mutationId, debouncedActorId, dateFrom, dateTo, dateFilterSuppressed]);

  const handlePageChange = (newPage: number) => {
    const cursor = cursorStackRef.current[newPage - 1] ?? null;
    setPageInfo({ page: newPage, cursor });
  };

  const handleRefresh = useCallback(() => {
    cursorStackRef.current = [null];
    setPageInfo({ page: 1, cursor: null });
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const csvColumns = [
    { key: "code", label: "Code" },
    { key: "creationDate", label: "Timestamp" },
    { key: "entityType", label: "Entity Type" },
    { key: "entityCode", label: "Entity Code" },
    { key: "entityId", label: "Entity ID" },
    { key: "action", label: "Action" },
    { key: "actorType", label: "Actor Type" },
    { key: "actorDisplayName", label: "User" },
  ];

  const downloadCsv = async (rows: AuditEventResponseDto[], filename: string) => {
    const res = await fetch("/api/capability/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, columns: csvColumns, rows }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = async (rows: AuditEventResponseDto[], filename: string) => {
    await downloadCsv(rows, filename);
  };

  const handleExportAll = async () => {
    const params = new URLSearchParams();
    if (packageCode) params.set("packageCode", packageCode);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (companyId) params.set("companyId", companyId);
    if (entityType) params.set("entityType", entityType);
    if (debouncedEntityCode) params.set("entityCode", debouncedEntityCode);
    if (debouncedEntityId) params.set("entityId", debouncedEntityId);
    if (mutationId) params.set("mutationId", mutationId);
    if (debouncedActorId) params.set("actorId", debouncedActorId);
    if (!dateFilterSuppressed && dateFrom) params.set("dateFrom", dateFrom);
    if (!dateFilterSuppressed && dateTo) params.set("dateTo", dateTo);
    const res = await fetch(`${API_BASE_PATH}/export?${params.toString()}`);
    if (!res.ok) return;
    const rows = await res.json() as AuditEventResponseDto[];
    await downloadCsv(rows, `${slug}_full_dataset`);
  };

  const totalPages = Math.max(1, Math.ceil(totalMatching / ITEMS_PER_PAGE));

  const isAllSelected = items.length > 0 && items.every((e) => selectedIds.has(e.id));
  const isSomeSelected = items.some((e) => selectedIds.has(e.id)) && !isAllSelected;
  const hasSelection = selectedIds.size > 0;

  const selectedCompany = useMemo(
    () => availableCompanies.find((company) => String(company.id) === companyId),
    [availableCompanies, companyId],
  );

  const companyOptions = useMemo(
    () => [
      { value: "", label: "All companies" },
      ...availableCompanies.map((company) => ({
        value: String(company.id),
        label: company.name,
        code: company.code,
      })),
    ],
    [availableCompanies],
  );

  const rangeItems: DropdownMenuItem[] = [
    { value: "all-dates", label: "All dates", onSelect: clearDateRange },
    { value: "this-month", label: "Month to date", onSelect: () => applyPreset("this-month", "Month to date", selectedYear) },
    { value: "last-month", label: "Previous month", onSelect: () => applyPreset("last-month", "Previous month", selectedYear) },
    { value: "previous-2-complete-months", label: "Previous 2 full months", onSelect: () => applyPreset("previous-2-complete-months", "Previous 2 full months", selectedYear) },
    { value: "previous-3-complete-months", label: "Previous 3 full months", onSelect: () => applyPreset("previous-3-complete-months", "Previous 3 full months", selectedYear) },
    { value: "previous-6-complete-months", label: "Previous 6 full months", onSelect: () => applyPreset("previous-6-complete-months", "Previous 6 full months", selectedYear) },
    { value: "previous-90-days", label: "Previous 90 days", onSelect: () => applyPreset("previous-90-days", "Previous 90 days", selectedYear) },
  ];

  const exportItems = useMemo<DropdownMenuItem[]>(() => [
    {
      value: "selected",
      label: `Selected (${selectedIds.size})`,
      icon: "check_box",
      disabled: !hasSelection,
      onSelect: () => { void handleExport(items.filter((e) => selectedIds.has(e.id)), `${slug}_selected`); },
    },
    {
      value: "current-view",
      label: `Current page (${items.length})`,
      icon: "visibility",
      onSelect: () => { void handleExport(items, `${slug}_current_view`); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${totalMatching})`,
      icon: "database",
      onSelect: () => { void handleExportAll(); },
    },
  ], [
    hasSelection,
    items,
    selectedIds,
    selectedIds.size,
    slug,
    totalMatching,
    packageCode,
    companyId,
    debouncedSearch,
    entityType,
    debouncedEntityCode,
    debouncedEntityId,
    mutationId,
    debouncedActorId,
    dateFrom,
    dateTo,
    dateFilterSuppressed,
  ]);

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      items.forEach((e) => next.delete(e.id));
    } else {
      items.forEach((e) => next.add(e.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const handleRowClick = (event: AuditEventResponseDto) => {
    const query = searchParams.toString();
    router.push(`${ROUTE_BASE_PATH}/${event.id}${query ? `?${query}` : ""}`);
  };

  // Chips: active filters shown below the filter row
  type ChipDef = { key: string; label: string; value: string; clear?: () => void };
  const activeChips = useMemo((): ChipDef[] => {
    const chips: ChipDef[] = [];
    if (packageCode) chips.push({ key: "package", label: "Package", value: packageCode, clear: () => handlePackageChange("") });
    if (companyId) chips.push({
      key: "company",
      label: "Company",
      value: selectedCompany ? `${selectedCompany.code} - ${selectedCompany.name}` : companyId,
      clear: companyReadOnly ? undefined : () => handleCompanyChange(""),
    });
    if (entityType) chips.push({ key: "entityType", label: "Entity Type", value: formatEntityType(entityType), clear: () => handleEntityTypeChange("") });
    if (entityCode) chips.push({
      key: "entityCode", label: "Entity Code", value: entityCode,
      clear: () => { if (debounceRef.current) clearTimeout(debounceRef.current); setEntityCode(""); setDebouncedEntityCode(""); cursorStackRef.current = [null]; setPageInfo({ page: 1, cursor: null }); },
    });
    if (entityId) chips.push({
      key: "entityId", label: "Entity ID", value: entityId,
      clear: () => { if (debounceRef.current) clearTimeout(debounceRef.current); setEntityId(""); setDebouncedEntityId(""); cursorStackRef.current = [null]; setPageInfo({ page: 1, cursor: null }); },
    });
    if (mutationId) chips.push({
      key: "mutationId",
      label: "Mutation ID",
      value: mutationId,
      clear: () => { setMutationId(""); cursorStackRef.current = [null]; setPageInfo({ page: 1, cursor: null }); },
    });
    if (actorId) chips.push({
      key: "actorId", label: "User", value: actorId,
      clear: () => { if (debounceRef.current) clearTimeout(debounceRef.current); setActorId(""); setDebouncedActorId(""); cursorStackRef.current = [null]; setPageInfo({ page: 1, cursor: null }); },
    });
    if (!dateFilterSuppressed && dateFrom && dateTo) {
      chips.push({ key: "date", label: "Date", value: `${dateFrom} - ${dateTo}`, clear: clearDateRange });
    } else if (!dateFilterSuppressed && dateFrom) {
      chips.push({ key: "dateFrom", label: "Date from", value: dateFrom, clear: () => handleDateFromChange("") });
    } else if (!dateFilterSuppressed && dateTo) {
      chips.push({ key: "dateTo", label: "Date to", value: dateTo, clear: () => handleDateToChange("") });
    }
    if (search) chips.push({
      key: "search",
      label: "Search contains",
      value: search,
      clear: () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setSearch("");
        setDebouncedSearch("");
        cursorStackRef.current = [null];
        setPageInfo({ page: 1, cursor: null });
      },
    });
    return chips;
  }, [packageCode, companyId, selectedCompany, entityType, entityCode, entityId, mutationId, actorId, search, dateFrom, dateTo, dateFilterSuppressed, clearDateRange]);

  const clearAll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    handlePackageChange("");
    if (!companyReadOnly) handleCompanyChange("");
    handleEntityTypeChange("");
    setEntityCode(""); setDebouncedEntityCode("");
    setEntityId(""); setDebouncedEntityId("");
    setMutationId("");
    setActorId(""); setDebouncedActorId("");
    setSearch(""); setDebouncedSearch("");
    clearDateRange();
  };

  const dbCountLabel = totalDbCount !== null ? totalDbCount : "many";

  return (
    <div className={styles.page}>
      {/* Row 1: breadcrumb */}
      <div className={styles.topRow}>
        <Breadcrumbs />
      </div>

      {/* Row 2: title */}
      <div className={styles.titleRow}>
        <div className={layout.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>history</span>
          </div>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>Audit Log</h1>
          <div className={layout.slotTitleByline}>
            <p className={typography.headingByline}>The audit log shows a complete record of database changes made across every package and company.</p>
          </div>
        </div>
        <div className={styles.titleActions}>
          {backFromCode ? (
            <DetailBackButton fallbackHref="/settings/audit" from="organizationAudit" fromCode={backFromCode} />
          ) : null}
        </div>
      </div>

      {/* Row 3: date range + company */}
      <div className={styles.scopeRow}>
        <div className={styles.companyField}>
          <label className={styles.filterLabel}>Package</label>
          <SearchableSelect
            value={packageCode}
            onChange={handlePackageChange}
            options={packageOptions}
            placeholder="All packages"
            searchPlaceholder="Search packages..."
            dropdownWidth={360}
          />
        </div>

        <div className={styles.scopeSeparator} />

        <div className={styles.companyField}>
          <label className={styles.filterLabel}>Company</label>
          <SearchableSelect
            value={companyId}
            onChange={handleCompanyChange}
            options={companyOptions}
            placeholder="All companies"
            searchPlaceholder="Search companies..."
            dropdownWidth={320}
            disabled={companyReadOnly}
          />
        </div>

        <div className={styles.scopeSeparator} />

        <div className={styles.dateRangeGroup}>
          <label className={styles.filterLabel}>Date Range</label>
          <div className={styles.dateRangeControls}>
            <div className={styles.rangePreset}>
              <DropdownMenu
                alignment="left"
                width={240}
                selectedValue={rangePreset}
                items={rangeItems}
                trigger={<Button variant="secondary" icon="date_range">{rangeLabel}</Button>}
              />
            </div>
            <div className={styles.dateControl}>
              <DatePicker value={dateFrom} onChange={handleDateFromChange} placeholder="Any date" />
            </div>
            <span className={styles.dateSeparator}>-</span>
            <div className={styles.dateControl}>
              <DatePicker value={dateTo} onChange={handleDateToChange} placeholder="Any date" />
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: filters + search */}
      <div className={styles.filterSearchRow}>
        <div className={styles.filterRow}>
          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Entity Type</label>
            <div className={styles.filterSelect}>
              <SearchableSelect
                value={entityType}
                onChange={handleEntityTypeChange}
                options={ENTITY_TYPE_OPTIONS}
                placeholder="All types"
                searchable={false}
              />
            </div>
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Entity Code</label>
            <Input
              containerClassName={styles.filterInput}
              placeholder="e.g. ACME"
              value={entityCode}
              onChange={(e) => handleEntityCodeChange(e.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>Entity ID</label>
            <Input
              containerClassName={styles.filterInput}
              placeholder="e.g. 10001"
              value={entityId}
              onChange={(e) => handleEntityIdChange(e.target.value)}
            />
          </div>

          <div className={styles.filterField}>
            <label className={styles.filterLabel}>User</label>
            <Input
              containerClassName={styles.filterInput}
              placeholder="User Code"
              value={actorId}
              onChange={(e) => handleActorIdChange(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.filterSeparator} />
        <Input
            containerClassName={styles.searchWrap}
            search
            placeholder="Search audit log..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
      </div>

      {/* Chips + actions row */}
      <div className={styles.chipsRow}>
        <div className={styles.chipsLeft}>
          {activeChips.map((chip, i) => (
            <React.Fragment key={chip.key}>
              {i > 0 && <span className={styles.chipAnd}>and</span>}
              <span className={styles.chip}>
                <span className={styles.chipLabel}>{chip.label}:</span>
                <span className={styles.chipValue}>{chip.value}</span>
                {chip.clear ? (
                  <button
                    className={styles.chipRemove}
                    onClick={chip.clear}
                    aria-label={`Remove ${chip.label} filter`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                  </button>
                ) : null}
              </span>
            </React.Fragment>
          ))}
          {activeChips.length > 0 && (
            <button className={styles.clearAll} onClick={clearAll}>Clear all</button>
          )}
        </div>
        <div className={styles.chipsRight}>
          <button
            className={styles.btnIcon}
            disabled={refreshing}
            title="Refresh"
            onClick={handleRefresh}
          >
            <span className={`material-symbols-outlined ${refreshing ? styles.spinning : ""}`}>sync</span>
          </button>
          <div className={styles.toolbarDivider} />
          <DropdownMenu
            trigger={<Button variant="plain" icon="file_download" title="Export" />}
            items={exportItems}
            alignment="right"
            width={260}
          />
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={items}
        selectedIds={selectedIds}
        isAllSelected={isAllSelected}
        isSomeSelected={isSomeSelected}
        onSelectAll={toggleSelectAll}
        onSelectOne={toggleSelectOne}
        onRowClick={handleRowClick}
        currentPage={pageInfo.page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        totalCount={dbCountLabel}
        filteredCount={totalMatching}
        itemLabel="audit events"
        loading={loading}
        loadingText="Loading audit events..."
        hasData={totalDbCount !== null ? totalDbCount > 0 : items.length > 0}
        emptyIcon="history"
        emptyFilterIcon="search_off"
        emptyTitle="No audit events"
        emptyText="Audit events will appear here as actions are performed"
        emptyFilterText="Try adjusting your search or filters"
      />
    </div>
  );
}
