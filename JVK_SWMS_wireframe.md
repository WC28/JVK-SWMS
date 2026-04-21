# JVK SWMS Sitemap and Wireframe

## Sitemap

```text
JVK SWMS
|- Home
|- Case Entry
|  |- New Case
|  |- Case List
|  |- Case Detail / Edit
|- Team Dashboard
|  |- KPI Summary
|  |- Intake Breakdown
|  |- Age/Sex/Intake Monthly Table
|  |- Area Statistics
|  |- Problem Statistics
|  |- MD Consult Statistics
|- SW Dashboard
|  |- SW KPI Cards
|  |- Top 5 Long Stay Cases
|  |- Top 5 Problems
|  |- Ward Breakdown
|  |- Area Breakdown
|- Monthly Reports
|  |- Monthly Snapshot List
|  |- Team PNG Export
|  |- SW PNG Export
|- Master Data
|  |- SW
|  |- MD
|  |- Ward
|  |- Problem List
|  |- Intervention List
|  |- Area
|  |- Thai Holidays
```

## Wireframe Overview

### 1. Home

```text
+------------------------------------------------------+
| JVK SWMS                                             |
| Information Case + Monthly KPI Dashboard             |
+-------------------+----------------------------------+
| Quick Actions     | This Month Summary               |
| - New Case        | Total / In Progress / D-C / Late |
| - Team Dashboard  | OPD / IPD / ER / Child OPD       |
| - SW Dashboard    |                                  |
| - Export PNG      |                                  |
+-------------------+----------------------------------+
| Recent Cases Table                                   |
+------------------------------------------------------+
```

### 2. Case Entry

```text
+------------------------------------------------------+
| Filters: Month | Year | SW | Status | Intake         |
+------------------------------------------------------+
| Add Case                                             |
+------------------------------------------------------+
| No | Done | Problem | Priority | Status | Consult    |
| SW | Patient | Intake | Sex | Age | HN | Ward       |
| Deadline | D/C | F/U | Note                        |
+------------------------------------------------------+
```

### 3. Team Dashboard

```text
+------------------------------------------------------+
| KPI Dashboard                                        |
+-------------+-------------+-------------+------------+
| Total Cases | Male/Female | In Progress | D/C        |
+-------------+-------------+-------------+------------+
| Late        | Wait D/C    | OPD/IPD/ER  | Child OPD  |
+------------------------------------------------------+
| Intake Breakdown Table                               |
+------------------------------------------------------+
| Monthly Breakdown by Age / Sex / Intake              |
+------------------------------------------------------+
| Area Statistics | Top Problems | MD Consult Stats    |
+------------------------------------------------------+
```

### 4. SW Dashboard

```text
+------------------------------------------------------+
| SW Selector: [Name]   Month [..] Year [..]           |
+------------------------------------------------------+
| KPI Dashboard - รายบุคคล                             |
+------------------------------------------------------+
| Total | In Progress | Late | Wait D/C | D/C          |
+------------------------------------------------------+
| Top 5 Long Stay Cases                                |
+------------------------------------------------------+
| Top 5 Problems | Ward Breakdown | Area Breakdown     |
+------------------------------------------------------+
```

### 5. Monthly Reports

```text
+------------------------------------------------------+
| Month [..] Year [..] [Generate Snapshot] [Export]    |
+------------------------------------------------------+
| Saved Snapshots                                      |
+------------------------------------------------------+
| Team PNG Preview                                     |
+------------------------------------------------------+
| SW PNG Preview                                       |
+------------------------------------------------------+
```

## Navigation Recommendation

- Main nav on top for desktop
- Sticky filter bar on dashboard pages
- Export button at page level and section level
- Monthly selector should affect all widgets in the current page
