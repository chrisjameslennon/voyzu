'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { NavGroup, NavItem } from '../lib/types/nav-types';
import styles from './left-nav.module.css';

interface LeftNavProps {
  groups: NavGroup[];
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isCollapseLocked?: boolean;
  autoClose?: boolean;
  headerSlot?: React.ReactNode;
  preserveScrollKey?: string;
  expandedWidth?: string;
  autoScrollActive?: boolean;
}

function isNavItemActive(item: NavItem, currentPath: string): boolean {
  return currentPath === item.path || (!item.exactMatch && currentPath.startsWith(item.path + '/'));
}

function findMostSpecificActivePath(groups: NavGroup[], currentPath: string): string | null {
  const matchingPaths: string[] = [];

  const collectMatches = (items: NavItem[]) => {
    for (const item of items) {
      if (isNavItemActive(item, currentPath)) matchingPaths.push(item.path);
      if (item.children?.length) collectMatches(item.children);
    }
  };

  groups.forEach(group => collectMatches(group.items));
  matchingPaths.sort((left, right) => right.length - left.length);
  return matchingPaths[0] ?? null;
}

function collectActiveAncestors(items: NavItem[], currentPath: string, parents: string[] = []): string[] {
  for (const item of items) {
    if (isNavItemActive(item, currentPath)) {
      return item.children?.length ? [...parents, item.label] : parents;
    }
    if (item.children?.length) {
      const found = collectActiveAncestors(item.children, currentPath, [...parents, item.label]);
      if (found.length || item.children.some(c => isNavItemActive(c, currentPath))) {
        return found.length ? found : [...parents, item.label];
      }
    }
  }
  return [];
}

function hasActiveDescendant(children: NavItem[] | undefined, currentPath: string): boolean {
  if (!children) return false;
  return children.some(c =>
    isNavItemActive(c, currentPath) ||
    hasActiveDescendant(c.children, currentPath)
  );
}

const LeftNav: React.FC<LeftNavProps> = ({
  groups,
  currentPath,
  onNavigate,
  isCollapsed,
  setIsCollapsed,
  isCollapseLocked = false,
  autoClose = false,
  headerSlot,
  preserveScrollKey,
  expandedWidth,
  autoScrollActive = false,
}) => {
  const activePath = findMostSpecificActivePath(groups, currentPath);
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    groups.flatMap(group => collectActiveAncestors(group.items, currentPath))
  );
  const [openCollapsedMenu, setOpenCollapsedMenu] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const lastAutoScrolledPathRef = useRef<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (openCollapsedMenu && (!target.closest || !target.closest(`.${styles.navItemWrapper}`))) {
        setOpenCollapsedMenu(null);
      }
    }
    if (openCollapsedMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openCollapsedMenu]);

  useEffect(() => {
    if (!preserveScrollKey) return;
    const savedScrollTop = window.sessionStorage.getItem(preserveScrollKey);
    if (!savedScrollTop) return;
    const scrollTop = Number(savedScrollTop);
    if (!Number.isFinite(scrollTop)) return;
    requestAnimationFrame(() => {
      if (navContainerRef.current) {
        navContainerRef.current.scrollTop = scrollTop;
      }
    });
  }, [preserveScrollKey]);

  useEffect(() => {
    if (!autoScrollActive || !navContainerRef.current) return;
    if (lastAutoScrolledPathRef.current === currentPath) return;
    requestAnimationFrame(() => {
      const navContainer = navContainerRef.current;
      if (!navContainer) return;
      const pathItems = Array.from(navContainer.querySelectorAll('[data-nav-path]'));
      const currentPathItem = pathItems.find(
        item => item instanceof HTMLElement && item.dataset.navPath === currentPath
      );
      const activeItems = navContainer.querySelectorAll(`.${styles.navButtonActive}`);
      const activeItem = currentPathItem ?? activeItems[activeItems.length - 1];
      if (activeItem instanceof HTMLElement) {
        activeItem.scrollIntoView({ block: 'center' });
        lastAutoScrolledPathRef.current = currentPath;
      }
    });
  }, [autoScrollActive, currentPath, expandedItems]);

  const persistScrollTop = () => {
    if (!preserveScrollKey || !navContainerRef.current) return;
    window.sessionStorage.setItem(preserveScrollKey, String(navContainerRef.current.scrollTop));
  };

  // Auto-expand all ancestor parents when a descendant path is active
  useEffect(() => {
    const ancestors = groups.flatMap(g => collectActiveAncestors(g.items, currentPath));
    if (ancestors.length === 0) return;
    setExpandedItems(prev => {
      if (autoClose) return ancestors;
      const next = new Set(prev);
      ancestors.forEach(a => next.add(a));
      return Array.from(next);
    });
  }, [autoClose, currentPath, groups]);

  const toggleExpand = (label: string, depth: number) => {
    if (isCollapsed) {
      setOpenCollapsedMenu(prev => prev === label ? null : label);
      return;
    }
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(i => i !== label)
        : autoClose && depth === 0
          ? [label]
          : [...prev, label]
    );
  };

  const handleNavItemClick = (item: NavItem, depth: number) => {
    if (item.children && item.children.length > 0) {
      toggleExpand(item.label, depth);
    } else {
      persistScrollTop();
      onNavigate(item.path);
      if (isCollapsed) setOpenCollapsedMenu(null);
    }
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = !!item.children && item.children.length > 0;
    const hasActiveChild = hasActiveDescendant(item.children, currentPath);
    const isExpanded = expandedItems.includes(item.label) || (!autoClose && hasActiveChild);
    const isActive = item.path === activePath;
    const childIndentStyle = !isCollapsed && depth > 0
      ? { paddingLeft: `${0.75 + depth * 1.25}rem` }
      : undefined;

    const itemKey = `${depth}:${item.label}:${item.path}`;

    return (
      <div key={itemKey} className={`${styles.navItemWrapper} group`}>
        <button
          data-nav-path={item.path}
          onClick={() => handleNavItemClick(item, depth)}
          className={`${styles.navButton} ${isCollapsed ? styles.navButtonCollapsed : ''} ${
            isActive ? styles.navButtonActive : ''
          } ${depth > 0 ? styles.childNavItem : ''}`}
          style={childIndentStyle}
        >
          {item.icon && (
            <div className={styles.navIconBox}>
              <span className={`material-symbols-outlined ${styles.navIcon}`}>{item.icon}</span>
            </div>
          )}
          {!isCollapsed && <span className={styles.navLabel}>{item.label}</span>}

          {!isCollapsed && item.endContent && (
            <span className={styles.navEndContent}>{item.endContent}</span>
          )}

          {!isCollapsed && hasChildren && (
            <span className={`material-symbols-outlined ${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}>
              expand_more
            </span>
          )}

          {isCollapsed && hasChildren && (
            <span className={styles.chevronCollapsed}>
              <span className="material-symbols-outlined text-[14px]">expand_more</span>
            </span>
          )}
        </button>

        {isCollapsed && depth === 0 && (
          <div className={styles.navTooltip}>
            <div className={styles.navTooltipContent}>{item.label}</div>
          </div>
        )}

        {!isCollapsed && hasChildren && isExpanded && (
          <div className="flex flex-col mt-0.5">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}

        {isCollapsed && depth === 0 && hasChildren && openCollapsedMenu === item.label && (
          <div className={styles.floatingMenu}>
            <div className={styles.floatingHeader}>
              <span className={styles.floatingTitle}>{item.label}</span>
              <button
                onClick={e => { e.stopPropagation(); setOpenCollapsedMenu(null); }}
                className={styles.closeButton}
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            {item.children?.map(child => renderFloatingItem(child, 0))}
          </div>
        )}
      </div>
    );
  };

  const renderFloatingItem = (item: NavItem, depth: number): React.ReactNode => {
    const hasChildren = !!item.children && item.children.length > 0;
    const floatingKey = `__floating__${item.label}`;
    const isFloatingExpanded = expandedItems.includes(floatingKey) || hasActiveDescendant(item.children, currentPath);
    const isChildActive = isNavItemActive(item, currentPath);

    return (
      <React.Fragment key={item.path}>
        <button
          onClick={e => {
            e.stopPropagation();
            if (hasChildren) {
              setExpandedItems(prev =>
                prev.includes(floatingKey)
                  ? prev.filter(i => i !== floatingKey)
                  : autoClose
                    ? [floatingKey]
                    : [...prev, floatingKey]
              );
            } else {
              persistScrollTop();
              onNavigate(item.path);
              setOpenCollapsedMenu(null);
            }
          }}
          className={`${styles.floatingItem} ${isChildActive ? styles.floatingItemActive : ''}`}
          style={{ paddingLeft: `${1 + depth * 1}rem` }}
        >
          {item.icon && <span className="material-symbols-outlined text-[18px] opacity-70">{item.icon}</span>}
          <span className={styles.floatingLabel}>{item.label}</span>
          {item.endContent && <span className={styles.floatingEndContent}>{item.endContent}</span>}
          {hasChildren && (
            <span className={`material-symbols-outlined ${styles.floatingChevron} ${isFloatingExpanded ? styles.chevronExpanded : ''}`}>
              expand_more
            </span>
          )}
        </button>
        {hasChildren && isFloatingExpanded && item.children!.map(child => renderFloatingItem(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <aside
      className={`${styles.leftNav} ${isCollapsed ? styles.collapsed : styles.expanded}`}
      style={!isCollapsed && expandedWidth ? { width: expandedWidth, minWidth: expandedWidth } : undefined}
    >

      {!isCollapseLocked && (
        <div className={`${styles.toggleWrapper} group/toggle`}>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className={styles.toggleButton}>
            <span className="material-symbols-outlined text-[16px] font-bold">
              {isCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
          <div className={styles.tooltip}>
            <div className={styles.tooltipContent}>{isCollapsed ? 'Expand' : 'Collapse'}</div>
          </div>
        </div>
      )}

      {headerSlot}

      {headerSlot && <div className={styles.separator} />}

      <div
        ref={navContainerRef}
        onScroll={persistScrollTop}
        className={`${styles.navContainer} ${isCollapsed ? styles.navContainerCollapsed : ''} custom-scrollbar`}
      >
        {groups.map((group, idx) => (
          <React.Fragment key={idx}>
            {isCollapsed
              ? <div className={styles.sectionDivider} />
              : group.label && <div className={styles.sectionHeader}>{group.label}</div>
            }
            {group.items.map(item => renderNavItem(item))}
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
};

export default LeftNav;
