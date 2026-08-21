export const organizationListReportCss = `
.orgListDocument {
  width: 100%;
  background: #fff;
  color: #0f172a;
  font-family: Inter, Arial, sans-serif;
  box-sizing: border-box;
}

.orgListDocumentHeader {
  margin-bottom: 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #222;
}

.orgListOrganizationName {
  font-size: 0.8rem;
  font-weight: 700;
}

.orgListReportHideOrganization .orgListOrganizationName {
  display: none;
}

.orgListReportHideInactive .orgListInactiveRow {
  display: none;
}

.orgListReportHide-ledgerControlAccounts .orgListReportSection-ledgerControlAccounts,
.orgListReportHide-postingCodes .orgListReportSection-postingCodes {
  display: none;
}

.orgListReportTitle {
  margin: 0.125rem 0 0;
  font-size: 1.25rem;
  line-height: 1.2;
}

.orgListReportTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.72rem;
}

.orgListReportTable th {
  padding: 0.35rem 0.45rem;
  text-align: left;
  border-bottom: 1px solid #222;
  color: #333;
  font-weight: 700;
}

.orgListReportTable td {
  padding: 0.35rem 0.45rem;
  border-bottom: 1px solid #d4d4d4;
  vertical-align: top;
}

.orgListSectionRow td {
  padding: 0.8rem 0.45rem 0.35rem;
  border-bottom: 1px solid #222;
  font-size: 0.82rem;
  font-weight: 800;
}

.orgListSubsectionRow td {
  padding: 0.55rem 0.45rem 0.25rem;
  border-bottom: 1px solid #d4d4d4;
  color: #334155;
  font-weight: 700;
}

.orgListEmptyCell {
  text-align: center;
  color: #777;
}

.orgListHasDetailRow td {
  background: #fafafa;
  border-bottom-color: #e2e8f0;
}

.orgListDetailRow td {
  padding-top: 0.1rem;
  padding-bottom: 0.5rem;
  border-bottom-color: #94a3b8;
  background: #fff;
}

.orgListSlotLines {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 1rem;
  row-gap: 0.2rem;
}

.orgListSlotLine {
  display: grid;
  grid-template-columns: 10rem 5.5rem minmax(0, 1fr);
  gap: 0.45rem;
  align-items: baseline;
}

.orgListSlotName {
  font-weight: 700;
}

.orgListSlotCode {
  white-space: nowrap;
}

.orgListSlotMissing {
  color: #777;
}

.orgListCompanyReportSettings {
  display: grid;
  gap: 0.15rem;
}

.orgListCompanyReportHeadings {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.orgListCompanyReportSettings span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
}

.orgListCompanyReportSettingsRow td {
  padding-top: 0.15rem;
  padding-bottom: 0.45rem;
  border-bottom-color: #94a3b8;
  color: #334155;
  background: #fafafa;
}

.orgListDimensionValuesRow td {
  padding-top: 0.15rem;
  padding-bottom: 0.45rem;
  border-bottom-color: #94a3b8;
  color: #334155;
  background: #fafafa;
}

.orgListDimensionValues span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
}

.orgListInventoryItemDetailsRow td {
  padding-top: 0.15rem;
  padding-bottom: 0.45rem;
  border-bottom-color: #94a3b8;
  color: #334155;
  background: #fafafa;
}

.orgListInventoryItemDetails {
  display: grid;
  grid-template-columns: 1fr 1.5fr 0.5fr;
  gap: 1rem;
}

.orgListInventoryItemDetails span {
  color: #64748b;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
}

.orgListCountryTaxSection {
  margin-top: 1.25rem;
  break-inside: avoid;
}

.orgListCountryTaxSection + .orgListCountryTaxSection {
  padding-top: 1rem;
  border-top: 2px solid #475569;
}

.orgListCountryTaxHeading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.orgListCountryTaxHeading h3 {
  margin: 0;
  font-size: 1rem;
}

.orgListCountryTaxHeading span {
  color: #64748b;
  font-size: 0.7rem;
  font-weight: 700;
}

.orgListCountryTaxGroup + .orgListCountryTaxGroup {
  margin-top: 0.8rem;
}

.orgListCountryTaxGroup h4 {
  margin: 0 0 0.2rem;
  font-size: 0.78rem;
}

.orgListCountryTaxEmpty {
  margin: 0;
  color: #64748b;
  font-size: 0.72rem;
}

.orgListDocumentFooter {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid #ddd;
  font-size: 0.7rem;
  color: #666;
}
`;
