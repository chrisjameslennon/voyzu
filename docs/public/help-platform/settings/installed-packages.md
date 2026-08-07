# Installed Packages

Installed Packages shows the packages composed into this Voyzu instance. Use it to review package identity, source, routes, and whether the package is visible in the application.

## Package list

The list shows each installed package and its current visibility. Activate or deactivate an optional package to show or hide its application navigation. Required platform packages cannot be deactivated.

Changing visibility does not install or uninstall package code and does not delete package data. Package installation and removal are command-line operations.

## Package details

Open a package to view its description, repository, root paths, installation type, and visibility. The **View** menu displays the installed `package.json` or `voyzu.package.ts` definition used by the composed runtime.

Only optional packages provide an editable visibility control. Required packages have no editable setting and cannot be saved or hidden.

## Navigation order

Where supported, change the order of packages in the platform top navigation from the package list. The order applies to visible packages that contribute top-level navigation.

## See also

* [Commands](../../voyzu-platform-guide/commands.md)
* [Package contract](../../voyzu-platform-guide/package-contract.md)
