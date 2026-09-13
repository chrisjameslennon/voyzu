"use client";

import { Button } from "@voyzu/ui-components";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";
import { FilterChips, FilterPanel, type FilterState, type FilterTab } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";

interface OrganizationsToolbarProps {
  refreshing: boolean;
  deleting: boolean;
  hasSelection: boolean;
  search: string;
  hasSearch: boolean;
  filterTabs: FilterTab[];
  filters: FilterState;
  exportItems: DropdownMenuItem[];
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
  onRemoveFilter: (key: string) => void;
  onClearSearch: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  onSearch: (value: string) => void;
}

export function OrganizationsToolbar({
  refreshing,
  deleting,
  hasSelection,
  search,
  hasSearch,
  filterTabs,
  filters,
  exportItems,
  onApplyFilters,
  onClearFilters,
  onRemoveFilter,
  onClearSearch,
  onDelete,
  onRefresh,
  onSearch,
}: OrganizationsToolbarProps) {
  return (
    <>
      <div className={layoutStyles.listToolbar}>
        <div className={layoutStyles.slotToolbarLeft}>
          <FilterPanel
            tabs={filterTabs}
            filters={filters}
            onApply={onApplyFilters}
            onClear={onClearFilters}
            onRemoveFilter={onRemoveFilter}
            showChips={false}
          />
        </div>

        <div className={layoutStyles.slotToolbarSearch}>
          <Input
            search
            containerClassName={layoutStyles.slotSearchControl}
            placeholder="Search organizations..."
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </div>

        <div className={layoutStyles.slotToolbarRight}>
          <div className={listStyles.toolbarActions}>
            <Button
              variant="secondary-destructive"
              icon="delete"
              disabled={!hasSelection || deleting}
              title="Delete selected"
              onClick={onDelete}
            />
            <div className={listStyles.divider} />
            <Button
              variant="plain"
              icon="sync"
              className={refreshing ? listStyles.spinning : undefined}
              disabled={refreshing}
              title="Refresh"
              onClick={onRefresh}
            />
            <DropdownMenu
              trigger={<Button variant="plain" icon="file_download" title="Export" />}
              items={exportItems}
              alignment="right"
              width={260}
            />
          </div>
        </div>
      </div>
      {(Object.keys(filters).some((key) => (filters[key] as string[] | undefined)?.length) || hasSearch) && (
        <div className={layoutStyles.chipsRow}>
          <div className={layoutStyles.slotChips}>
            <FilterChips
              tabs={filterTabs}
              filters={filters}
              additionalChips={hasSearch
                ? [{
                    key: "search",
                    label: "Search contains",
                    value: search.trim(),
                    onRemove: onClearSearch,
                  }]
                : []}
              onClear={onClearFilters}
              onRemoveFilter={onRemoveFilter}
            />
          </div>
        </div>
      )}
    </>
  );
}
