# Installed Packages

Installed Packages shows the packages composed into this Voyzu instance. Use it to review package identity, source, routes, and UI visibility.

## Package list

The list shows each installed package, whether its page routes are visible, and whether it contributes top navigation. Required platform packages keep their page routes visible.

Changing UI visibility does not install or uninstall package code and does not delete package data. Package installation and removal are command-line operations. Package API routes are not affected by either visibility setting.

## Package details

Open a package to view its description, repository, page and API root paths, installation type, and UI visibility. The **View** menu displays the installed `package.json` or `voyzu.package.ts` definition used by the composed runtime.

**Show top navigation** controls whether the package contributes items to the platform top navigation. It does not block direct access to page routes.

**Show page routes** controls whether callers can open the package's registered pages. Required packages cannot have their page routes hidden.

## Navigation order

Where supported, change the order of packages in the platform top navigation from the package list. The order applies to packages that contribute visible top-level navigation.

## See also

* [Commands](../../voyzu-platform-guide/commands.md)
* [Package contract](../../voyzu-platform-guide/package-contract.md)
