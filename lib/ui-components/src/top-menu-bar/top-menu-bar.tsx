import React from 'react';
import type { NavSection } from '../lib/types/nav-types';
import UserMenu from '../user-menu/user-menu';
import styles from './top-menu-bar.module.css';

interface TopMenuBarProps {
  sections: NavSection[];
  activeItem?: string;
  onSelect: (item: string) => void;
  helpUrl?: string;
  logoSrc?: string;
  settingsActive?: boolean;
  onSettingsSelect?: () => void;
}

const TopMenuBar: React.FC<TopMenuBarProps> = ({
  sections,
  activeItem,
  onSelect,
  helpUrl,
  logoSrc,
  settingsActive = false,
  onSettingsSelect,
}) => {

  return (
    <div className={styles.container}>
      {logoSrc && (
        <div className={styles.logoSection}>
          <img
            src={logoSrc}
            alt="Logo"
            className={styles.logoImg}
          />
        </div>
      )}

      {/* Menu Items */}
      <nav className={styles.nav}>
        {sections.map((section) => (
          <button
            key={section.label}
            onClick={() => onSelect(section.label)}
            className={`${styles.navItem} ${activeItem === section.label ? styles.navItemActive : ''}`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className={styles.rightSection}>
        {onSettingsSelect && (
          <button
            type="button"
            className={`${styles.iconButton} ${settingsActive ? styles.iconButtonActive : ''}`}
            title="Settings"
            onClick={onSettingsSelect}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        )}
        {helpUrl ? (
          <a href={helpUrl} target="_blank" rel="noreferrer" className={styles.iconButton} title="Help">
            <span className="material-symbols-outlined">help</span>
          </a>
        ) : null}
        <UserMenu />
      </div>
    </div>
  );
};

export default TopMenuBar;
