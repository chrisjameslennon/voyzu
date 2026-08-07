# Countries

The Countries screens provide the country reference and tax integration configuration used when companies and financial documents are created.

## Concepts

* [Tax](../../voyzu-core-concepts/tax.md) explains tax authorities, rules, components, and how tax is calculated during financial document processing.
* [Organizations and Companies](../../voyzu-core-concepts/organizations-and-companies.md) explains the relationship between a company, its country, and its base currency.

## Viewing countries

The list shows code, country name, default currency, and status. Search matches those values. Use **Filter** to select statuses, click a row to view the country, and use **Refresh** to reload the list.

Export can include the selected row, the current searched or filtered view, or the full country dataset.

Countries are reference data in the application. They are not created, edited, activated, deactivated, or deleted from these screens.

## Reading a country

The detail screen is read-only and contains:

* Country code, name, default currency, and financial-year start month.
* Tax filing anchor month and filing interval.
* Tax authorities and their jurisdictions.
* Tax rules available to financial documents.
* Tax components, authorities, schemes, rates, and invoice labels.

The integration configuration determines the tax choices and calculations available when an external system posts a tax-relevant financial document. A tax rule can resolve to one or more tax components.

### In use

The **HAS POSTINGS** badge means financial records use this country or its tax configuration. The badge is informational because this screen is read-only.

Use the audit panel to see when the country configuration was loaded or changed and to open the related organization audit events.

## See also

* [Currencies](currencies.md)
* [Companies](companies.md)
* [Tax Accounts](tax-control-accounts.md)
* [Financial Document Types](financial-document-types.md)
