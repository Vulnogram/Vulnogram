# Using Vulnogram Publish CVEs and Manage CVE API users and credentials.

<link rel="stylesheet" href="https://vulnogram.org/1.0.0/css/min.css" />
<link rel="stylesheet" href="https://vulnogram.org/1.0.0/css/vg-icons.css" />

This guide is adapted from [Using Vulnogram with CVE Services Portal](https://www.cve.org/Resources/Roles/Cnas/UsingVulnogramCVEServices.pdf) and aligned to the current Vulnogram UI.

## 1. Access Vulnogram

Open Vulnogram and start in the CVE workspace. This screenshot shows the browser pointed at `https://www.vulnogram.org` with the URL visible.

![Vulnogram CVE editor workspace shown in a browser window with the URL visible](./screenshots/01-access-editor.png)
*Access Vulnogram at https://www.vulnogram.org.*

## 2. Login to CVE Services

Open the <b class="lbl bor vgi-org">CVE Portal</b> panel, select the target portal (`production`, `test`, `adp-test`, or local), and authenticate with your CNA short name, CVE user, and API key.

![CVE Portal login dialog in Vulnogram](./screenshots/02-portal-login.png)
*CVE Services login form from the <b class="lbl bor vgi-org">CVE Portal</b> sidebar action.*

## 3. Reserve CVE IDs

After login, use <b class="lbl bor vgi-magic">Reserve One CVE</b> or the dropdown batch actions to reserve IDs for the current year, next year, or previous year. Use state/year filters to find reserved IDs.

![CVE Portal reserve controls in Vulnogram](./screenshots/03-reserve-cve-ids.png)
*<b class="lbl bor vgi-org">CVE Portal</b> reserve controls with state and year filters.*

## 4. Enter CVE Record Details

Use the <b class="lbl bor vgi-edit">Editor</b> tab to enter vulnerability details, affected products, references, and metrics. Switch between <b class="lbl bor vgi-edit">Editor</b>, <b class="lbl bor vgi-noformat">Source</b>, and <b class="lbl bor vgi-eye">Preview</b> tabs while drafting.

![Vulnogram CVE editor detail form area](./screenshots/04-enter-cve-details.png)
*Primary <b class="lbl bor vgi-edit">Editor</b> form where record content is entered.*

## 5. Publish to CVE Services

Use <b class="lbl bor vgi-export">Publish CVE</b> to submit the record to the currently selected portal. In test mode, publishing targets the CVE Services test environment.

![Vulnogram header with Publish CVE action](./screenshots/05-publish-cve.png)
*Top action bar with <b class="lbl bor vgi-export">Publish CVE</b> control.*

To publish miltiple CVE Drfats at the same time, click <b class="lbl bor vgi-export">Manage</b> in the <b class="lbl bor vgi-edit">Drafts</b> section on the sidebar. Select and publish the drafts that need to be published. Successfully published CVE entries get removed from the <b class="lbl bor vgi-edit">Drafts</b> list.

![Vulnogram.org manage and publish multiple CVEs](./screenshots/05b-publish-multiple-cve.png)
*<b class="lbl bor vgi-edit">Drafts Manager</b> with sample cached CVE entries ready for bulk publish.*

## 6. Manage Users and API Keys (Admin)

Organization administrators can open <b class="lbl bor vgi-cog">Users</b> in the portal view to add users, update profile and role attributes, disable accounts, and reset API secrets.

![CVE Portal user management popup in Vulnogram](./screenshots/06-admin-user-management.png)
*Admin-oriented <b class="lbl bor vgi-cog">Users</b> management view in the <b class="lbl bor vgi-org">CVE Portal</b>.*
