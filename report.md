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

| Feature                                 | SAPUI5                  | UI5 Web Components for React           | React + MUI (today)                              |
| --------------------------------------- | ----------------------- | -------------------------------------- | ------------------------------------------------ |
| Theme selection (Horizon, Quartz, Dark) | Inherited automatically | Inherited via UI5 WC `setTheme` API    | **Not propagating** — app stays in its own theme |
| Language switching from launchpad       | Inherited               | Inherited via UI5 WC i18n bundles      | Needs explicit wiring via i18next                |
| RTL / a11y / keyboard                   | Inherited               | Inherited (Fiori-grade by default)     | Manual; depends on MUI defaults and discipline   |
| User info / logged-in user              | Inherited               | Custom via approuter `/user-api`       | Custom via approuter `/user-api`                 |
| Intent-based navigation parameters      | Inherited               | Custom parsing                         | Custom parsing                                   |
| Cross-app navigation                    | First-class             | Possible but not idiomatic             | Possible but not idiomatic                       |

The theme selection issue is the most visible and the most likely to be raised in customer demos. With **MUI** it requires custom work (subscribing to launchpad theme events and mapping them to MUI tokens). With **UI5 Web Components for React** it is essentially free — see §4.6.

**Mitigation:** Treat Launchpad integration as a sub-project of the deployment template above. Document which features we support and which we deliberately don't. If full Launchpad parity is a hard requirement, UI5 Web Components for React eliminates most of the gap by construction.

### 4.3 Customer acceptance and the "Fiori contract"

Customers buying into the SAP stack often have an implicit expectation that frontends will be Fiori-branded — both visually (Horizon theme, standard controls) and operationally ("we know how to support a Fiori app"). Delivering a React app means:

- A conversation about why we chose React and what the customer gets in return
- Commitments around look-and-feel parity (achievable with MUI theming or UI5 Web Components for React)
- Commitments around long-term maintainability and handover

Some customers will welcome this; others will see it as deviation from the standard and push back. We should be prepared to qualify deals on this question early.

### 4.4 Loss of built-in Fiori behavior

UI5 controls give us — for free — a baseline of accessibility, RTL support, consistent keyboard handling, theme-aware visuals, and translations of standard control labels. With React this is our responsibility. Two paths to close the gap:

1. **UI5 Web Components for React** — official SAP project, brings Fiori controls to React. Reduces parity gap significantly but introduces a runtime dependency on UI5 web components. Treated in detail in §4.6.
2. **MUI + discipline** — keep MUI but invest in a11y review, RTL support, and a curated theme. More flexible visually but more ongoing work.

The Bookshop currently uses option 2. Both are viable; the choice depends on how strictly Fiori parity is required. For most customer engagements the answer is option 1.

### 4.5 In-house and market expertise

The SAP consulting world has many UI5 developers and few experienced React-on-BTP developers.

### 4.6 UI5 Web Components for React: bridging React and Fiori

The single most important option to evaluate when choosing React on BTP is **[UI5 Web Components for React](https://ui5.github.io/webcomponents-react/v2)**. It is SAP's own React wrapper around the UI5 Web Components — a set of framework-agnostic, Fiori-branded web components — and it directly closes most of the parity gaps raised in §4.2, §4.3, and §4.4.

#### What it is

- **Officially maintained by SAP** as part of the OpenUI5 / Fiori organization on GitHub.
- A library of **real React components** (proper props, refs, events, TypeScript types) that internally render UI5 Web Components. No iframes, no UI5 runtime overhead beyond the web component layer.
- Ships with the **Horizon, Quartz, and dark themes** built in, switchable at runtime via a single `setTheme()` call.
- Integrates with the broader UI5 Web Components project, so the same controls used in a UI5 app are available — `Button`, `Input`, `Dialog`, `Table`, `DatePicker`, `Card`, `MessageStrip`, `ObjectPage`, etc.
- Currently at **v2** (stable), with active monthly releases.

#### What it solves

| Gap raised earlier                                  | How UI5 WC for React addresses it                                                                                  |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| §4.2 Launchpad theme propagation does not work      | Theme can be set programmatically; Launchpad theme events map directly to `setTheme()`. No custom token mapping.   |
| §4.2 Language switching from Launchpad              | UI5 Web Components carry their own i18n bundles for control labels — switches with the locale automatically.       |
| §4.3 "Fiori contract" with the customer             | Visually indistinguishable from a Fiori app. Removes the bulk of the customer-acceptance conversation.             |
| §4.4 Loss of accessibility, RTL, keyboard handling  | Built into the controls. Fiori-grade a11y and RTL come for free, same as in a UI5 app.                             |
| §4.4 Translations of standard control labels        | Shipped with the components for all SAP-supported languages.                                                       |

In effect, it gives us **the React developer experience for our own code** (JSX, hooks, type safety via `#cds-models`, npm ecosystem) while **the user-visible surface remains Fiori**.

#### What it does *not* solve

- **Component coverage is narrower than MUI.** UI5 Web Components cover the Fiori control set, but advanced controls our admin app already uses (Sankey, treemap, polar/radar charts, heatmaps, the shipment map) are not in scope. We would still pull in chart and map libraries from the React ecosystem.
- **Mixing UI5 WC and MUI in one app is visually inconsistent.** A project should commit to one as the primary system. Limited mixing (e.g. an MUI chart inside a UI5 WC `Card`) is workable; broad mixing is not.
- **Theming customization is more constrained.** Fiori themes are designed to look like Fiori. Heavy custom branding (the Bookshop's storefront-style hero, custom typography, marketing pages) is harder to do well than in MUI. For a customer-facing storefront we would still likely choose MUI; for a back-office app, UI5 WC for React is a strong default.
- **Shell-level Launchpad APIs (user info, intent-based navigation, cross-app navigation)** still need custom integration — these live above the control layer regardless of which library we pick.
- **Bundle weight is higher** than a tightly-tree-shaken MUI build, but lower than full SAPUI5. The web component runtime is shared across all controls used.

#### i18n: UI5 Web Components bundles vs react-i18next

A concrete example of where the two paths diverge is internationalization. UI5 Web Components ship their own [i18n facility for app code](https://ui5.github.io/webcomponents/docs/advanced/using-i18n-for-apps/), which is materially different from the **react-i18next** library the Bookshop currently uses.

| Aspect                          | UI5 Web Components i18n                                              | react-i18next (today)                                                            |
| ------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Bundle format                   | `.properties` files (SAP standard, same as CAP / Fiori / UI5)        | JSON files (one per locale)                                                      |
| API style                       | Imperative — `fetchI18nBundle(...)` then `bundle.getText(key, ...)`  | React-first — `const { t } = useTranslation()`, re-renders on language change    |
| Placeholders                    | Positional `{0}`, `{1}` (`MessageFormat`-style)                      | Named interpolation `{{name}}` plus full ICU pluralization, contexts, nesting    |
| Pluralization & formatting      | Manual / limited                                                     | First-class: plurals, gender, ordinals, dates, numbers, custom formatters        |
| Locale detection                | Via UI5 WC config (`getLanguage()`); auto-syncs with `setLanguage()` | Via `i18next-browser-languagedetector` plus explicit handlers                    |
| Launchpad locale propagation    | **Automatic** once `setLanguage()` is wired to Launchpad events      | Custom: subscribe to Launchpad locale events, call `i18n.changeLanguage()`       |
| Translation tooling             | Native fit with **SAP Translation Hub** and existing CAP `.properties` workflows | Standard JSON tooling (Lokalise, Crowdin, Phrase, etc.); not the SAP standard    |
| Re-render on language change    | Manual (controls re-render themselves; app code typically reloads bundle) | Automatic via React context                                                      |
| Type safety on keys             | None by default                                                      | Available via i18next's typed-keys configuration                                 |

**What this means in practice.** UI5 WC i18n is the right choice when:

- Translations are managed by the customer's SAP organization (Translation Hub, existing `.properties` pipelines).
- Launchpad locale parity matters and we don't want to maintain custom wiring.
- The translation surface is mostly static control labels.

react-i18next is the right choice when:

- We need rich formatting — pluralization, ICU messages, dynamic date/number formatting, language-aware sorting (the storefront uses several of these today).
- The translation pipeline is JSON-based / handled by a non-SAP localization team.
- Translation keys benefit from React-aware re-rendering and TypeScript autocomplete.

#### Where it fits

| Project shape                                                         | Recommended frontend                |
| --------------------------------------------------------------------- | ----------------------------------- |
| Internal back-office / admin tool with Fiori-trained users            | **React + UI5 Web Components for React** |
| Customer-facing app with strict Fiori parity in the contract          | **React + UI5 Web Components for React** |
| Customer-facing storefront / marketing-style UX where branding wins   | React + MUI                         |
| Greenfield internal app where UX velocity dominates                   | React + MUI                         |
| Existing UI5 project                                                  | Stay on UI5                         |

#### Strategic significance

UI5 Web Components for React is SAP's own answer to "how do we let teams use React without leaving the Fiori ecosystem." Its existence is the strongest signal that React-on-BTP is a path SAP intends to support long-term. Adopting it where appropriate gives us:

- A defensible answer to the customer-acceptance question (§4.3): "We use SAP's official React project."
- An easier handover and support story than pure MUI.
- Most of the React velocity wins (§3) without paying the Fiori-parity cost (§4.4).

The trade-off versus MUI is real but bounded: more constrained visual design, narrower component coverage, slightly larger runtime. For most BTP projects we would deliver, this is the right trade.

---

## 5. Cost and Effort Assessment

Rough estimates based on the Bookshop project, assuming a comparable team:

| Phase                              | SAPUI5     | React + UI5 WC for React | React + MUI    |
| ---------------------------------- | ---------- | ------------------------ | -------------- |
| Initial scaffolding                | Low        | Low-Medium               | Medium         |
| Per-feature implementation         | Medium     | **Low**                  | **Low**        |
| BTP deployment setup               | Low        | Medium\*                 | Medium-High\*  |
| Launchpad integration (theme/i18n) | Low        | Low                      | Medium\*       |
| Fiori parity (visual + a11y)       | Built-in   | Built-in                 | Manual work    |
| Long-term maintenance              | Medium     | Low-Medium               | Low-Medium     |
| Onboarding new developers          | Medium     | Low-Medium               | Low            |

\* One-time investment via the proposed "React-on-BTP" reference template, then "Low" for every future project.

The single most expensive cell — "BTP deployment setup" for React + MUI — collapses to "Low" once the template exists. The "Launchpad integration" cell collapses similarly. Both are paid once.

---

## 6. Strategic Implications

### 6.1 Why this matters now

Frontend expectations are rising. Customers comparing our deliverables to modern web apps (any SaaS product they use day-to-day) will increasingly notice when a Fiori app feels heavier or less responsive. React + modern tooling gives us a credible answer.

At the same time, SAP itself is diversifying — UI5 Web Components, the CAP-first direction, and the broader push to make BTP attractive to non-SAP-native developers all signal that "Fiori-only" is no longer the only blessed path. Adopting React now positions us ahead of a shift that is already underway.

### 6.2 What we would commit to by adopting React

- Maintaining a hardened "React-on-BTP" reference template (deployment, auth, Launchpad integration)
- A clear policy on which component library we use per project shape — **UI5 Web Components for React** as the default for back-office and Fiori-bound projects, **MUI** where storefront-style branding is the priority (see §4.6)
- Internal training so React-on-BTP is not a single-person specialty

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
- UI5 Web Components catalog (browse available components) — https://ui5.github.io/webcomponents/components/
- App Router (`@sap/approuter`) configuration reference
