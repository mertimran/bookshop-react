# React vs. SAPUI5 for SAP BTP Frontends

**A strategic assessment based on the Bookshop reference project**

---

## 1. Executive Summary

This report evaluates the use of **React** as the frontend technology for our SAP BTP / CAP-based projects, in place of **SAPUI5**, the SAP-recommended default. The evaluation is grounded in the Bookshop reference project (`app/shop` and `app/admin`), where we have built two production-shaped React frontends on top of a CAP backend.

The short version:

- **React significantly accelerates development.** Co-located view and logic, JSX, the npm ecosystem, and modern tooling (Vite, TanStack Router, MUI) measurably reduce the time from requirement to working feature compared to a UI5 equivalent.
- **End-to-end type safety via CAP's `#cds-models` is a genuine differentiator.** A CDS schema change becomes a TypeScript compile error in the UI — a class of defect UI5 catches only at runtime, if at all.
- **The strategic risks are real but bounded.** They cluster in three areas: BTP deployment maturity, customer/stakeholder expectations around Fiori, and Launchpad integration gaps (most visibly: theme propagation does not work).
- **Recommendation:** Adopt React as our **default** for new internal apps and for greenfield customer engagements where we control the UX contract. Keep SAPUI5 as the choice when Fiori parity is contractually required or when the Launchpad integration gaps below are deal-breakers. Invest in a small "React-on-BTP" reference template to de-risk future projects.

---

## 2. Background and Scope

The Bookshop project is our reference implementation for evaluating modern frontend stacks on SAP BTP. It consists of:

- A CAP service layer (`srv/`) with `catalog-service` (shop-facing) and `admin-service` (back-office)
- A CDS data model (`db/schema.cds`) covering authors, books, orders, shipments, and order events
- Two React SPAs:
  - `app/shop` — customer-facing storefront
  - `app/admin` — back-office for orders, shipments, authors, publishers, statistics
- A shared library (`app/shared`) with components (`BookCover`, `ShipmentMap`, `StatusTimeline`), API client, and i18n
- `#cds-models`-based TypeScript typing across the boundary
- Deployment via MTA to Cloud Foundry on BTP

The frontends use **React 19**, **TanStack Router**, **MUI 7**, **i18next**, **Zustand**, and **Vite 8**. This stack is intentionally close to what a contemporary React team outside SAP would choose, so that lessons learned generalize beyond this one project.

The comparison baseline is **SAPUI5 / SAP Fiori Elements** as we would use it on the same backend.

---

## 3. Technical Comparison

### 3.1 Developer experience and view logic

| Concern               | SAPUI5                                           | React                                               |
| --------------------- | ------------------------------------------------ | --------------------------------------------------- |
| View definition       | XML view file                                    | JSX inside the component                            |
| View logic            | Controller `.js`/`.ts` file                      | Same component file (hooks)                         |
| Data binding          | Declarative model bindings + formatter functions | Direct JavaScript expressions and GET/POST requests |
| Conditional rendering | `visible="{= ${...} }"` expressions              | `{condition && <X />}`                              |
| List rendering        | Aggregation bindings + factory functions         | `array.map(...)`                                    |
| State management      | JSONModel / ManagedObject lifecycles             | `useState`, `useReducer`, Zustand                   |

In practice this means a React feature lives in **one file** that a developer can read top-to-bottom. The UI5 equivalent typically spans an XML view, a controller, a fragment for dialogs, an i18n properties file, and a manifest entry. The cognitive overhead of UI5's split-file MVC is significant, especially for new joiners and during refactoring.

JSX in particular reduces a class of UI5-specific knowledge (binding syntax, expression binding, formatter wiring) to plain JavaScript that any frontend developer already knows.

### 3.2 Ecosystem and reuse

The Bookshop frontends use ~15 third-party packages that have **no first-class UI5 equivalent**, including:

- **TanStack Router** for typed routing with route loaders and route-level data fetching
- **MUI (Material UI)** for a comprehensive component library and theming system
- **Swiper** for the carousel stuff
- **Zustand** for lightweight client state (e.g. cart), for keeping the state across refreshes and different tabs
- **i18next** + browser language detector + HTTP backend for i18n

Each of these is mature, actively maintained, and has a much larger contributor base than the UI5 equivalents. This compounds: when a new requirement comes in (charts, drag-and-drop, rich text, PDF export), React almost always has several mature options; UI5 typically has one official answer or none.

### 3.3 Type safety: `#cds-models`

This is the single strongest technical argument for React + TypeScript on CAP. CAP's `cds-typer` generates TypeScript types directly from the CDS schema and exposes them via the `#cds-models/*` import alias (configured in the root `package.json`). This means:

- Service clients are typed with the same shapes the backend uses
- Route loaders, component props, and form state can all share generated types
- A schema change (e.g. renaming a field, changing a type) produces a **compile error** in every UI file that touches it

UI5 has no equivalent. UI5 controllers and XML views consume OData metadata at runtime; field renames or type changes surface as broken bindings in the browser, often only on the affected screen and only with the right data. This is one of the most common sources of regressions in long-lived UI5 projects, and React + `#cds-models` eliminates it by construction.

### 3.4 Tooling and inner loop

- Vite-based dev server with HMR: sub-second feedback on edits
- Type-checked builds (`tsc -b && vite build`)
- Standard npm workspace layout; `app/shared` is a normal workspace package

UI5 tooling has improved significantly (UI5 Tooling, ui5 cli) but still lags Vite on cold start, HMR responsiveness, and ecosystem integration. The gap is not catastrophic but it is felt every day.

### 3.5 Performance and bundle size

React + Vite produces small, code-split bundles per route. UI5's runtime is heavier and ships more by default, though preload bundles mitigate this. For a public-facing app like the storefront, React's lighter footprint is a meaningful UX win on first load. For an internal back-office app, the difference matters less.

---

## 4. Risks and Open Questions

### 4.1 BTP deployment is not yet fully validated

SAPUI5 is the documented, supported path for Fiori apps on BTP. A React SPA served via `@sap/approuter` works in our local and dev-tier setups, but we have **not yet validated** the full production path on a customer subaccount. Specifically, we still need to confirm:

- App Router authentication (XSUAA) flows end-to-end with a React SPA, including silent token refresh and session timeout UX
- Destination handling for backend calls in productive deployments
- Behavior under HTML5 Application Repository constraints (file count, size limits)
- CSP headers compatible with React's runtime

**Mitigation:** Build a hardened deployment template as a follow-up to this project. Estimated effort: 1–2 weeks for one engineer, one-time investment that all future projects inherit.

### 4.2 Fiori Launchpad integration gaps

Several Launchpad features that "just work" for UI5 apps require custom work — or are not currently working — for our React app:

| Feature                                 | UI5                     | React (today)                                    |
| --------------------------------------- | ----------------------- | ------------------------------------------------ |
| Theme selection (Horizon, Quartz, Dark) | Inherited automatically | **Not propagating** — app stays in its own theme |
| Language switching from launchpad       | Inherited               | Needs explicit wiring via i18next                |
| User info / logged-in user              | Inherited               | Needs custom retrieval via approuter `/user-api` |
| Intent-based navigation parameters      | Inherited               | Needs explicit parsing                           |
| Cross-app navigation                    | First-class             | Possible but not idiomatic                       |

The theme selection issue is the most visible and the most likely to be raised in customer demos. Closing this gap is technically feasible (subscribe to launchpad theme events, map to MUI theme tokens) but is real engineering work.

**Mitigation:** Treat Launchpad integration as a sub-project of the deployment template above. Document which features we support and which we deliberately don't.

### 4.3 Customer acceptance and the "Fiori contract"

Customers buying into the SAP stack often have an implicit expectation that frontends will be Fiori-branded — both visually (Horizon theme, standard controls) and operationally ("we know how to support a Fiori app"). Delivering a React app means:

- A conversation about why we chose React and what the customer gets in return
- Commitments around look-and-feel parity (achievable with MUI theming or UI5 Web Components for React)
- Commitments around long-term maintainability and handover

Some customers will welcome this; others will see it as deviation from the standard and push back. We should be prepared to qualify deals on this question early.

### 4.4 Loss of built-in Fiori behavior

UI5 controls give us — for free — a baseline of accessibility, RTL support, consistent keyboard handling, theme-aware visuals, and translations of standard control labels. With React this is our responsibility. Two paths to close the gap:

1. **UI5 Web Components for React** — official SAP project, brings Fiori controls to React. Reduces parity gap significantly but introduces a runtime dependency on UI5 web components.
2. **MUI + discipline** — keep MUI but invest in a11y review, RTL support, and a curated theme. More flexible visually but more ongoing work.

The Bookshop currently uses option 2. Both are viable; the choice depends on how strictly Fiori parity is required.

### 4.5 In-house and market expertise

The SAP consulting world has many UI5 developers and few experienced React-on-BTP developers.

---

## 5. Cost and Effort Assessment

Rough estimates based on the Bookshop project, assuming a comparable team:

| Phase                      | UI5 baseline | React (today) | React (with template) |
| -------------------------- | ------------ | ------------- | --------------------- |
| Initial scaffolding        | Low          | Medium        | Low                   |
| Per-feature implementation | Medium       | **Low**       | **Low**               |
| BTP deployment setup       | Low          | Medium-High   | Low                   |
| Launchpad integration      | Low          | Medium        | Low-Medium            |
| Long-term maintenance      | Medium       | Low-Medium    | Low-Medium            |
| Onboarding new developers  | Medium       | Low           | Low                   |

The high cell — "BTP deployment setup" for React today — is a **one-time** cost we pay once and amortize across future projects via the proposed reference template.

---

## 6. Strategic Implications

### 6.1 Why this matters now

Frontend expectations are rising. Customers comparing our deliverables to modern web apps (any SaaS product they use day-to-day) will increasingly notice when a Fiori app feels heavier or less responsive. React + modern tooling gives us a credible answer.

At the same time, SAP itself is diversifying — UI5 Web Components, the CAP-first direction, and the broader push to make BTP attractive to non-SAP-native developers all signal that "Fiori-only" is no longer the only blessed path. Adopting React now positions us ahead of a shift that is already underway.

### 6.2 What we would commit to by adopting React

- Maintaining a hardened "React-on-BTP" reference template (deployment, auth, launchpad)
- A lightweight design system (MUI theme, or UI5 Web Components for React) so apps look consistent across projects

---

## 7. Appendix

### A. Bookshop technology stack (current)

- **Backend:** `@sap/cds` 9, `@cap-js/hana`, `@sap/xssec`, TypeScript
- **Frontend:** React 19, TypeScript, Vite 8, TanStack Router, MUI 7, Zustand, i18next, Swiper
- **Shared:** workspace package `@bookshop/shared` for components, API client, i18n
- **Type bridge:** CAP `cds-typer` exposing `#cds-models/*` to the frontends
- **Deployment:** MTA → Cloud Foundry on BTP, served via approuter

### B. Open questions to resolve before customer rollout

1. Production-grade XSUAA flow with React SPA — validated under session timeout, silent refresh, logout
2. Theme propagation from Fiori Launchpad to MUI theme tokens
3. Language and user-info propagation from Launchpad
4. CSP and HTML5 App Repo constraints under realistic bundle size
5. Decision: MUI vs. UI5 Web Components for React as the standard component library

### C. Related references

- CAP `cds-typer` documentation
- SAP HTML5 Application Repository constraints
- UI5 Web Components for React project — https://ui5.github.io/webcomponents-react/v2
- App Router (`@sap/approuter`) configuration reference
