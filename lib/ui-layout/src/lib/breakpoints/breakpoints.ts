export class Breakpoints {

  private static getVar(name: string): number {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    return parseInt(value.replace("px", ""), 10);
  }

  static get tabletMin(): number {
    return this.getVar("--breakpoint-tablet-min");
  }

  static get desktopMin(): number {
    return this.getVar("--breakpoint-desktop-min");
  }

  static isTabletUp(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(min-width:${this.tabletMin}px)`).matches;
  }

  static isDesktopUp(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(min-width:${this.desktopMin}px)`).matches;
  }

  /** True only in the tablet zone (≥tablet and <desktop). */
  static isTablet(): boolean {
    if (typeof window === 'undefined') return false;
    return this.isTabletUp() && !this.isDesktopUp();
  }

  static current(): "mobile" | "tablet" | "desktop" {
    if (this.isDesktopUp()) return "desktop";
    if (this.isTabletUp()) return "tablet";
    return "mobile";
  }

  static onChange(callback: (mode: "mobile" | "tablet" | "desktop") => void) {
    const tablet = window.matchMedia(`(min-width:${this.tabletMin}px)`);
    const desktop = window.matchMedia(`(min-width:${this.desktopMin}px)`);

    const handler = () => callback(this.current());

    tablet.addEventListener("change", handler);
    desktop.addEventListener("change", handler);

    return () => {
      tablet.removeEventListener("change", handler);
      desktop.removeEventListener("change", handler);
    };
  }
}
