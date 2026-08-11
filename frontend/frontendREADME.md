# DOnC-key Platform — Frontend Architecture & Minute UI Specification

Welcome to the **DOnC-key Frontend Architecture & UI Specification Guide**. This document provides an exhaustive, component-by-component, element-by-element, class-by-class, and property-by-property breakdown of the React frontend codebase. It is specifically written to provide another developer or AI agent with complete clarity on every visual style, layout structure, Tailwind class, CSS design token, component property, internal state, user interaction flow, responsive grid, icon, micro-animation, and conditional view trigger in the application.

---

## 🛠️ Tech Stack & Architecture

- **Core Framework:** React 18 (Vite bundler with Hot Module Replacement)
- **Routing:** `react-router-dom` v6 with nested layout rendering and authorization guards
- **Design System & Styling:** Tailwind CSS v4, Custom CSS Utilities, Glassmorphic overlays, Dual Theme Engine (Dark/Light mode)
- **Typography:** Google Fonts — **Outfit** (Headings) & **Plus Jakarta Sans / Inter** (Body text)
- **Icons:** `@heroicons/react` (24/outline and 24/solid)
- **HTTP Client:** `axios` with global request/response authorization interceptors
- **Authentication:** Firebase Client SDK (Email/Password, Google OAuth Popup)
- **Portal Rendering:** React `createPortal` for glassmorphic modal overlays

---

## 📁 Directory Hierarchy

```text
frontend/
├── public/                # Static public assets
├── src/
│   ├── assets/            # Project images and SVG assets
│   ├── components/        # Reusable UI components & tab views
│   │   ├── ApiDocsTab.jsx
│   │   ├── ApiLogsTab.jsx
│   │   ├── AppLayout.jsx
│   │   ├── Aurora.css
│   │   ├── Aurora.jsx
│   │   ├── ChatTab.jsx
│   │   ├── OAuth.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StructureTab.jsx
│   │   ├── TryApiTab.jsx
│   │   └── WebhookSettingsTab.jsx
│   ├── context/           # React Context Providers
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── pages/             # Page view components
│   │   ├── Dashboard.jsx
│   │   ├── DocumentDetail.jsx
│   │   ├── Documents.jsx
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── PlatformDocs.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── Projects.jsx
│   │   ├── Signup.jsx
│   │   ├── UploadDocument.jsx
│   │   └── Usage.jsx
│   ├── utils/             # Helper utilities & API clients
│   │   ├── api.js
│   │   └── firebase.js
│   ├── App.css
│   ├── App.jsx            # Main app router component
│   ├── index.css          # Design system CSS tokens & utility classes
│   └── main.jsx           # App entry point
├── .env                   # Environment variables configuration
├── .env.example           # Template environment file
├── index.html             # HTML root document
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS design config
└── vite.config.js         # Vite bundler config
```

---

## ⚙️ Environment Variables (`.env`)

The frontend requires the following environment variables to communicate with Firebase and the Express backend API:

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | Base URL for backend API (Default: `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | String | Firebase Web API Key for Authentication |
| `VITE_FIREBASE_AUTH_DOMAIN` | String | Firebase Authentication domain |
| `VITE_FIREBASE_PROJECT_ID` | String | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | String | Firebase Storage bucket URI |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | String | Firebase Cloud Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | String | Firebase Web Application ID |

---

## 🎨 Global Design System & CSS Utility Tokens (`src/index.css`)

The application enforces a dark/light mode theme engine controlled by toggling the `.dark` class on `document.documentElement`. The design tokens and custom utility classes in `src/index.css` include:

### 1. Typography & Global Body Rules
- **Base Font:** `'Plus Jakarta Sans', 'Inter', sans-serif`
- **Headings Font (`h1`-`h6`):** `'Outfit', sans-serif` with `@apply tracking-tight font-semibold`
- **Light Theme Background:** `bg-slate-50 text-slate-800`
- **Dark Theme Background:** `dark:bg-[#090d16] dark:text-slate-200`
- **Smooth Transition:** `@apply antialiased transition-colors duration-300`

### 2. Custom Webkit Scrollbar Styling
- **Width & Height:** `8px`
- **Track:** `@apply bg-transparent`
- **Thumb (Light Mode):** `@apply rounded-full bg-slate-200 hover:bg-slate-300 transition-colors`
- **Thumb (Dark Mode):** `@apply dark:bg-slate-800 dark:hover:bg-slate-700`

### 3. Reusable UI Component Utility Classes

#### `.heading-main`
- **CSS:** `@apply text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white bg-clip-text`

#### `.card-premium` (Interactive Card with Hover Lift)
- **CSS:** `@apply rounded-2xl border transition-all duration-300 bg-white border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 dark:bg-[#0f172a] dark:border-slate-800/40 dark:shadow-black/20 dark:hover:border-slate-700/60`

#### `.card-premium-no-hover` (Static Container Card)
- **CSS:** `@apply rounded-2xl border transition-all duration-300 bg-white border-slate-100 shadow-sm dark:bg-[#0f172a] dark:border-slate-800/40 dark:shadow-black/20`

#### `.input-premium` (Standard Form Field)
- **CSS:** `@apply w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:bg-slate-900 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-blue-500/80`

#### `.btn-primary` (Primary Action Button)
- **CSS:** `@apply inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 active:translate-y-0 text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none`

#### `.btn-secondary` (Secondary Action Button)
- **CSS:** `@apply inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer border bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed`

#### `.btn-danger` (Destructive Action Button)
- **CSS:** `@apply inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed`

#### Status Pill Badges (`.badge-status-*`)
- **Ready (`.badge-status-ready`):** `bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20`
- **Processing (`.badge-status-processing`):** `bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20`
- **Queued (`.badge-status-queued`):** `bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20`
- **Failed (`.badge-status-failed`):** `bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20`

#### Modal Glassmorphism Overlays (`.backdrop-glass` & `.modal-theme`)
- **Backdrop Overlay (`.backdrop-glass`):** `fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-md`
- **Modal Container (`.modal-theme`):** `relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden p-6 bg-white border-slate-100 dark:bg-[#0f172a] dark:border-slate-800/80`

---

## 🔒 Authentication & Global Contexts

### 1. `AuthContext.jsx` (`AuthProvider` & `useAuth`)
Provides global authentication state managed via Firebase Auth SDK.

#### Exported Hook / Context Value (`useAuth()`):
- `currentUser` (`Object | null`): Firebase User object containing `uid`, `email`, `displayName`, etc.
- `isAuthenticated` (`Boolean`): `true` if `currentUser` is logged in, `false` otherwise.
- `loading` (`Boolean`): `true` while checking initial Firebase auth state on app boot.
- `signup(email, password)` (`Function`): Returns Promise created by `createUserWithEmailAndPassword`.
- `login(email, password)` (`Function`): Returns Promise created by `signInWithEmailAndPassword`.
- `logout()` (`Function`): Returns Promise created by `signOut`.
- `resetPassword(email)` (`Function`): Returns Promise created by `sendPasswordResetEmail`.
- `googleLogin()` (`Function`): Triggers Google OAuth popup using `GoogleAuthProvider`.

#### Internal Mechanics:
- Listens to Firebase auth state using `onAuthStateChanged(auth, callback)`.
- When user logs in, obtains JWT ID token via `user.getIdToken()` and invokes `setupAuthInterceptor(token)` to attach `Authorization: Bearer <token>` to all outgoing Axios requests.
- When user logs out, invokes `setupAuthInterceptor(null)` to remove token headers.

---

### 2. `ThemeContext.jsx` (`ThemeProvider` & `useTheme`)
Provides a theme switching mechanism supporting Dark and Light themes with local storage persistence and system preference fallback.

#### Exported Hook / Context Value (`useTheme()`):
- `theme` (`'dark' | 'light'`): Current active theme state string.
- `toggleTheme()` (`Function`): Toggles theme state between `'dark'` and `'light'`.

---

## 🛰️ Utility Modules (`src/utils/`)

### 1. `src/utils/api.js`
Axios wrapper configured with base URL `http://localhost:5000/api`. Provides method interfaces for all platform endpoints:

| Function Signature | Method & Endpoint | Description |
| :--- | :--- | :--- |
| `setupAuthInterceptor(token)` | Client Header Setup | Sets or deletes `Authorization: Bearer <token>` header on default Axios instance. |
| `uploadDocument(file, projectId, modelSelected, customSchema)` | `POST /documents/upload` | Uploads single/multiple files (`Multipart/Form-Data`) with optional project ID, model selection (`gemini-2.5-flash`), and custom JSON extraction schema. |
| `getDocuments()` | `GET /documents` | Fetches list of documents for authenticated user; normalizes `_id` to `id` and formats file sizes. |
| `getDocumentDetail(documentId)` | `GET /documents/:id` | Fetches details and extraction results for a specific document by ID. |
| `generateApiKey(documentId)` | `POST /documents/:id/api-keys` | Generates a new `doc_...` API key bound to the specified document. |
| `getApiKeys(documentId)` | `GET /documents/:id/api-keys` | Lists all active and revoked API keys generated for a document. |
| `revokeApiKey(documentId, keyId)` | `PATCH /documents/:id/api-keys/:keyId/revoke` | Revokes a document API key by ID. |
| `getUsageAnalytics()` | `GET /usage/analytics` | Fetches overall API usage analytics. |
| `getUsageAnalyticsWithRange(range)` | `GET /usage/analytics?range=:range` | Fetches usage analytics for given range (`7d`, `30d`, `90d`). |
| `getDashboardStats()` | `GET /usage/dashboard-stats` | Fetches high-level metrics for dashboard cards (document counts, API requests). |
| `getUserProfile()` | `GET /user/profile` | Fetches user profile data. |
| `getProjects()` | `GET /projects` | Lists all projects owned by the user. |
| `createProject(data)` | `POST /projects` | Creates a new project with `{ name, description }`. |
| `getProjectDetail(id)` | `GET /projects/:id` | Fetches project info along with linked documents. |
| `deleteProject(id)` | `DELETE /projects/:id` | Deletes project by ID. |
| `chatWithDocument(documentId, question, chatHistory)` | `POST /documents/:id/chat` | Sends question and conversation history to Gemini Q&A model. |
| `searchDocuments(query, type)` | `GET /documents/search?q=:query&type=:type` | Performs text/vector search across document contents. |
| `exportDocument(documentId, format)` | `GET /documents/:id/export?format=:format` | Downloads document extraction output as JSON or CSV blob. |
| `getWebhooks(projectId)` | `GET /webhooks?projectId=:id` | Lists webhook endpoints registered for a project. |
| `createWebhook(data)` | `POST /webhooks` | Registers a new webhook URL and subscribed events (`{ url, events, projectId }`). |
| `deleteWebhook(id)` | `DELETE /webhooks/:id` | Deletes a webhook registration by ID. |

---

## 🧭 Minute UI Component Specifications (`src/components/`)

### 1. `AppLayout.jsx`
- **Container Hierarchy:**
  - Outer Wrapper: `<div className="h-screen w-screen overflow-hidden flex bg-slate-50 text-slate-800 dark:bg-[#090d16] dark:text-slate-200">`
  - Left Container: `<div className="flex-shrink-0 h-full">` wrapping `<Sidebar />`.
  - Main Content Area: `<div className="flex-1 h-full overflow-y-auto">` wrapping React Router's `<Outlet />`.
- **Layout Behavior:** The viewport is strictly non-scrollable (`overflow-hidden`). Only the right main area scrolls vertically (`overflow-y-auto`).

---

### 2. `Sidebar.jsx`
- **Container & Animation:**
  - Main Sidebar Div: `<div className={`flex flex-col h-screen ${isCollapsed ? 'w-20' : 'w-72'} ${theme === 'dark' ? 'bg-[#0B1120] text-gray-400' : 'bg-white text-gray-600'} border-r ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'} transition-all duration-300 ease-in-out flex-shrink-0 relative shadow-xl z-20`}>`
- **Logo & Collapse Toggle Header:**
  - Logo Box: `<div className="bg-blue-600 p-2 rounded-xl shadow-md shadow-blue-500/20">` holding `<DocumentTextIcon className="h-6 w-6 text-white" />`.
  - Brand Text: `<span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">DOnC-key</span>` (hidden when collapsed).
  - Collapse Button: Positioned absolute `-right-3 top-8` when collapsed with circular border and chevron SVG indicator.
- **Navigation Links (`navItems` array):**
  - Items: `Dashboard` (`HomeIcon`), `Projects` (`FolderIcon`), `Documents` (`DocumentTextIcon`), `Usage` (`ChartBarIcon`), `Platform Docs` (`BookOpenIcon`).
  - Active Link Classes: If route matches path or starts with `path + '/'`:
    - Dark mode: `bg-blue-600/10 text-blue-400 font-semibold`
    - Light mode: `bg-blue-50 text-blue-600 font-semibold`
    - Left Indicator Pill: `before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-md before:bg-blue-500`
- **Footer Buttons:**
  - Theme Switcher Button: Displays `<SunIcon className="h-5 w-5" />` and `'Light Mode'` text in dark mode, or `<MoonIcon />` and `'Dark Mode'` in light mode.
  - Logout Button: Hover effect `hover:bg-red-500/10 hover:text-red-400` in dark mode, rendering `<ArrowLeftOnRectangleIcon className="h-5 w-5" />`.

---

### 3. `StructureTab.jsx`
- **Layout Grid:** 2-Column Grid (`grid-cols-1 lg:grid-cols-2 gap-6 items-stretch`).
- **Left Column — Visual Document Source Viewer:**
  - Outer Card: `<div className="card-premium-no-hover p-6 flex flex-col space-y-4">`
  - Header: `<DocumentIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />` + title `"Document Source Viewer"`.
  - Media Renderer Container: `flex-1 min-h-[500px] border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center`.
    - Image (`image/*`): Rendered via `<img src={fileUrl} className="max-w-full max-h-[550px] object-contain p-2 shadow-sm rounded-lg" />`.
    - PDF (`application/pdf`): Rendered via `<iframe src={`${fileUrl}#toolbar=0&navpanes=0`} className="w-full h-full min-h-[550px] border-0" />`.
    - Fallback Binary: Rendered as notice text + download link `<a href={fileUrl} className="btn-secondary text-[11px] px-3.5 py-1.5">Download Source File</a>`.
- **Right Column — Extracted Metadata JSON & Schema Definitions:**
  - Extracted JSON Card: Pre-formatted JSON code block inside `<div className="p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-blue-400 overflow-auto max-h-[350px]">`.
  - Schema Definition Table: Styled table (`max-h-36 overflow-y-auto border border-slate-100 dark:border-slate-800/60 rounded-xl`) displaying Field Name (`font-mono font-bold`), Field Type (`text-blue-600 dark:text-blue-400 uppercase`), and Description text.

---

### 4. `TryApiTab.jsx` (API Interactive Sandbox)
- **Top Section — Sandbox Authentication Card:**
  - Header: `"Sandbox Authentication"` + info notice with `<InformationCircleIcon className="h-4 w-4 mr-1.5 text-blue-500" />`.
  - Password Input: `<input type="password" value={apiKey} placeholder="Enter your secret API key (doc_xxxx...)" className="input-premium" />`.
- **Middle Section — Request Playground Card:**
  - Target Endpoint Dropdown (`<select className="input-premium focus:ring-4 focus:ring-blue-500/10 pr-10 appearance-none font-medium">`):
    - Option 1: `GET /api/v1/data` (Standard Extraction Wrapper)
    - Option 2: `GET /api/v1/extract/:documentId` (Direct Extracted Object)
  - Live Endpoint URL Bar: Monospace bar `<div className="flex items-center space-x-2.5 font-mono text-xs border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl select-all">` featuring a `GET` green badge (`bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400`).
  - Headers Preview Box: Displays `Content-Type: application/json` and truncated API Key `x-api-key`.
  - Execute Request Button: `<button onClick={handleExecute} className="w-full btn-primary py-3 flex items-center justify-center gap-2">` featuring `<PlayIcon className="h-4 w-4" />`.
- **Bottom Section — Response Display Panel:**
  - Appears conditionally when `response !== null`.
  - Metrics Pills:
    - Status Pill: `Status: 200 OK` (`bg-emerald-50 text-emerald-700` if 2xx, `bg-rose-50 text-rose-700` if error).
    - Latency Pill: `Latency: 145 ms` (`bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400`).
    - Content-Type Pill: `Type: application/json`.
  - Response Body Scrollbox: Monospace JSON viewer (`p-4 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-800 max-h-96 overflow-auto`) with clipboard copy button (`<ClipboardIcon />` / `<CheckIcon className="text-emerald-500" />`).

---

### 5. `ApiDocsTab.jsx`
- **Base URL Box:** Renders `http://localhost:5000/api/v1` inside a code box with copy button (`<ClipboardIcon />`).
- **Authentication Box:** Explains `x-api-key` request header format.
- **Endpoint Specification:** Shows `GET /data` badge, expected response payload schema, and copyable cURL code block:
  ```bash
  curl -X GET http://localhost:5000/api/v1/data \
    -H "x-api-key: YOUR_API_KEY"
  ```

---

### 6. `ApiLogsTab.jsx`
- **Stats Row (3 Cards):**
  - Total Requests (`stats.total`)
  - Avg Latency (`stats.avgLatency ms`)
  - Success Rate (`stats.successRate %` formatted in `text-emerald-500` if >=90% or `text-amber-500` if lower).
- **Request History Table:**
  - Header: `"Request History"` + Refresh button featuring `<ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />`.
  - Table Columns: `Timestamp`, `Method` (`GET` green pill), `Endpoint` (`font-mono text-xs`), `Status` (`badge-premium` with `<CheckCircleIcon />` or `<XCircleIcon />`), `Latency` (`text-right font-mono`).

---

### 7. `ChatTab.jsx` (Document RAG Q&A Assistant)
- **Container:** `<div className="card-premium-no-hover overflow-hidden flex flex-col backdrop-blur-md bg-white/50 dark:bg-[#0f172a]/30 h-[600px] border border-slate-100 dark:border-slate-800/40">`
- **Header:** Sparkles Icon (`<SparklesIcon className="h-5 w-5 text-purple-500 animate-pulse" />`) + Title `"Chat with Document"` + Pill Badge `"AI-Powered"`.
- **Empty State (0 Messages):**
  - Center illustration box with `<ChatBubbleLeftRightIcon className="h-10 w-10 text-purple-600" />`.
  - Heading `"Document Q&A Sandbox"`.
  - 4 Suggested Question Chips: Clicking any populates the chat input field.
- **Message Thread (Active Messages):**
  - User Messages: Right-aligned (`justify-end`), blue bubble (`bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-blue-500/10`), user avatar icon (`<UserIcon />`).
  - Assistant Messages: Left-aligned (`justify-start`), dark slate bubble (`bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border`), AI avatar icon (`<SparklesIcon />`).
  - Loading State: Animated 3-dot typing indicator (`animate-bounce` with staggered animation delays `0ms`, `150ms`, `300ms`).
- **Footer Input Form:**
  - Input: `<input type="text" placeholder="Ask a question about this document..." className="flex-1 input-premium" />`.
  - Send Button: Circle button with `<PaperAirplaneIcon className="h-5 w-5" />` (active: `bg-blue-600 text-white`, disabled: `bg-slate-100 text-slate-400`). Handles `Enter` key press.

---

### 8. `WebhookSettingsTab.jsx`
- **Layout Grid:** 5-Column Grid (`grid-cols-1 lg:grid-cols-5 gap-6`).
- **Left Column (3 Cols) — Active Subscriptions Table:**
  - Table headers: `Endpoint URL`, `Events`, `Action`.
  - Delete Button: `<button onClick={() => handleDelete(webhook._id)} className="text-slate-400 hover:text-rose-500 p-1">` holding `<TrashIcon className="h-4.5 w-4.5" />`.
- **Right Column (2 Cols) — Register Webhook Form:**
  - Input field for Endpoint URL (`<input type="url" placeholder="https://yourdomain.com/webhooks" className="input-premium" />`).
  - Event Checkboxes:
    - `document.ready`
    - `document.failed`
  - Register Button: `<button type="submit" className="w-full btn-primary py-2.5 text-xs flex items-center justify-center space-x-1.5">` holding `<PlusIcon className="h-4 w-4" />`.

---

## 🖥️ Minute Page UI Specifications (`src/pages/`)

### 1. `Dashboard.jsx`
- **Page Title Header:** `"Dashboard"` (`text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white`) + Subtitle `"Overview of your document intelligence status."`.
- **Upload Drop Zone Section Card:**
  - Icon Badge: `<div className="p-4 rounded-2xl mb-5 bg-blue-50 dark:bg-blue-950/35 text-blue-600 dark:text-blue-400 shadow-inner">` holding `<CloudArrowUpIcon className="h-8 w-8" />`.
  - Drag & Drop Text: Supported formats notice (`PDF, DOCX, XLSX, CSV, JPG, PNG, GIF. Max 10MB`).
  - File Input Label: `<label htmlFor="document-upload" className="flex-1 w-full px-5 py-3 rounded-xl cursor-pointer font-semibold border bg-white text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200">`. Displays selected file name or `'Choose File'`.
  - Upload Trigger Button: `<button onClick={handleInitiateUpload} className="btn-primary py-3 px-8 text-sm">`.
  - Upload Progress Bar (when `isUploading === true`): Animated bar `<div className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}>` + text `{uploadProgress}% Uploading...`.
- **4-Column Metric Stats Grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6`):**
  1. Total Documents (`stats.totalDocuments`) + `<DocumentTextIcon className="h-6 w-6 text-blue-600" />`
  2. Processing Documents (`stats.processingDocuments`) + Pulsing Amber Radar Dot (`<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>`)
  3. API Keys (`stats.apiKeys`) + `<KeyIcon className="h-6 w-6 text-purple-600" />`
  4. Total API Calls (`stats.totalApiCalls`) + `<ChartBarIcon className="h-6 w-6 text-emerald-600" />`
- **Project Selection Portal Modal (`showProjectModal`):**
  - Rendered via React `createPortal(..., document.body)`.
  - Backdrop: `.backdrop-glass` (`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-md`).
  - Dialog Card: `.modal-theme` (`relative w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden p-6 bg-white dark:bg-[#0f172a]`).
  - Mode 1 (Select Existing): `<select className="input-premium">` listing existing projects + OR divider line + dashed border button `<button onClick={() => setIsCreatingProject(true)} className="w-full py-3 border-dashed border-slate-300 text-slate-600 hover:bg-slate-50">` holding `<PlusIcon /> Create New Project`.
  - Mode 2 (Create New): Text input for `newProjectName` + `'Back to select existing'` link button.

---

### 2. `UploadDocument.jsx` (Document & Schema Pipeline Uploader)
- **Header:** Back button (`<ArrowLeftIcon className="h-4 w-4" />`) + Title `"Upload Documents"` + Subtitle `"Add documents to your custom data projects."`.
- **Layout Grid:** 5-Column Grid (`grid-cols-1 lg:grid-cols-5 gap-6`).
- **Left Column (3 Cols) — Pipeline Uploader:**
  - Project Association Selector: Dropdown `<select className="input-premium pr-10 appearance-none">` with `<FolderIcon />` overlay + Quick Project Add button (`<PlusIcon />`).
  - Drag & Drop Zone (`onDragEnter`, `onDragOver`, `onDragLeave`, `onDrop`):
    - Default Style: `border-2 border-dashed border-slate-200 hover:border-blue-400/80 dark:border-slate-800`
    - Drag Active Style: `border-blue-500 bg-blue-50/20 dark:bg-blue-950/10`
    - Icon & Copy: `<CloudArrowUpIcon className="h-10 w-10 text-slate-400 mb-3" />` + `"Drag and drop files here, or browse"`.
  - Chosen Files List (`files.length > 0`): Max height scrollbox (`max-h-48 overflow-y-auto space-y-1.5`) displaying filename, file size in MB (`(f.size / (1024 * 1024)).toFixed(2) MB`), and delete icon button (`<TrashIcon />`).
  - Upload Action Button: `<button onClick={handleUpload} className="w-full btn-primary py-3 px-8 text-sm">Upload N Documents</button>`.
- **Right Column (2 Cols) — AI Configuration Panel:**
  - Gemini Model Selector: `<select value={selectedModel} className="input-premium pr-10 appearance-none">`:
    - Option 1: `Gemini 2.5 Flash (Fast / OCR-focused)`
    - Option 2: `Gemini 2.5 Pro (Deep Reasoning / Contracts)`
  - Custom Schema Toggle Switch: Pill toggle button (`bg-blue-600` when enabled, `bg-slate-200` when disabled) sliding smooth knob (`translate-x-5` vs `translate-x-0`).
  - Dynamic Schema Builder (when `useCustomSchema === true`):
    - Scrollbox (`max-h-[350px] overflow-y-auto`): Attribute card items containing:
      - Attribute Name input (`border-b text-xs font-mono font-bold`)
      - Data Type dropdown (`String`, `Number`, `Boolean`, `Array`)
      - Description text field
      - Delete row button (`<TrashIcon />`)
    - `'Add Attribute'` button (`<PlusIcon className="h-3 w-3" />`).

---

### 3. `DocumentDetail.jsx` (Document Command Center)
- **Top Command Bar:**
  - Back Button: `<button onClick={() => navigate('/documents')} className="btn-secondary p-2.5">` holding `<ArrowLeftIcon />`.
  - Title & Badges: Document Filename + Status Badge (`ready` green, `processing` amber, `queued` indigo, `failed` red) + Gemini Model Pill (`gemini-2.5-flash`).
  - Actions: Manual Status Refresh button (`<ArrowPathIcon className={loading ? 'animate-spin' : ''} />`) + Download File button (`<ArrowDownTrayIcon />`).
- **5-Tab Navigation Bar:**
  - Tab 1: `Structure` (`<TableCellsIcon className="h-4 w-4" />`) — Loads `<StructureTab document={document} />`.
  - Tab 2: `Try API` (`<PlayIcon className="h-4 w-4" />`) — Loads `<TryApiTab documentId={id} />`.
  - Tab 3: `API Integration` (`<KeyIcon className="h-4 w-4" />`) — Key generation & management UI.
  - Tab 4: `AI Chat` (`<ChatBubbleLeftRightIcon className="h-4 w-4" />`) — Loads `<ChatTab documentId={id} documentStatus={document.status} />`.
  - Tab 5: `API Logs` (`<ClockIcon className="h-4 w-4" />`) — Loads `<ApiLogsTab documentId={id} />`.
- **API Key Management Sub-View (Tab 3):**
  - Generate Key Card: Button `<button onClick={handleGenerateKey} className="btn-primary">Generate Document API Key</button>`.
  - Secret Key Modal / Notice: Displays freshly generated key string `doc_a1b2c3...` in a highlighted monospaced box with clipboard copy button.
  - Active Keys Table: Lists prefix `keyPrefix`, creation timestamp, revoked status badge, and Revoke Action button (`<button onClick={() => handleRevokeKey(key._id)} className="btn-danger text-xs">Revoke Key</button>`).

---

### 4. `Projects.jsx`
- **Header & Search Controls:**
  - Title: `"Projects"` + Subtitle `"Manage your custom document analysis groups."`.
  - Search Input: `<input type="text" value={searchQuery} placeholder="Search projects..." className="input-premium pl-10" />` with `<MagnifyingGlassIcon className="h-5 w-5 absolute left-3 text-slate-400" />`.
  - New Project Button: `<button onClick={() => setShowCreateModal(true)} className="btn-primary">` holding `<PlusIcon /> Create Project`.
- **3-Column Project Cards Grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`):**
  - Card Container: `.card-premium p-6 flex flex-col justify-between`.
  - Folder Icon Badge: `<div className="p-3 bg-blue-50 dark:bg-blue-950/45 text-blue-600 rounded-xl">` holding `<FolderIcon className="h-6 w-6" />`.
  - Card Details: Project Name (`font-bold text-lg text-slate-900 dark:text-white`), Description (`text-xs text-slate-500 line-clamp-2`), Document Count badge (`N documents`).
  - Delete Button: Red trash icon button triggering project deletion confirmation.
- **Create Project Modal (`showCreateModal`):**
  - Rendered inside `.backdrop-glass` + `.modal-theme`.
  - Form Fields: Project Name input (`input-premium`) + Project Description textarea.
  - Action buttons: `'Cancel'` (`btn-secondary`) and `'Create Project'` (`btn-primary`).

---

### 5. `ProjectDetail.jsx` (`/projects/:id`)
- **Breadcrumb Header:** Navigation link `Projects / [Project Name]`.
- **Metadata Summary Bar:** Project Name, Description, creation date, and total linked document count.
- **Sub-View Tab Bar:**
  - Tab 1: `Documents` (`<DocumentTextIcon />`) — Renders table list of documents linked to this project.
  - Tab 2: `Webhook Settings` (`<CloudArrowUpIcon />`) — Renders `<WebhookSettingsTab projectId={id} />`.

---

### 6. `Documents.jsx`
- **Filter & Search Bar:**
  - Search Input: `<input type="text" placeholder="Search by document name..." className="input-premium" />`.
  - Status Dropdown Filter: `<select value={statusFilter} className="input-premium">`:
    - Options: `All Statuses`, `Ready`, `Processing`, `Queued`, `Failed`.
  - Upload Shortcut Button: `<Link to="/documents/upload" className="btn-primary">Upload Document</Link>`.
- **Master Document Table:**
  - Table Headers: `Document Name`, `File Size`, `Uploaded At`, `Status`, `Action`.
  - Row Cell Elements: Document Name link (`text-blue-600 font-semibold hover:underline`), formatted size string (`"2.45 MB"`), date string, status pill (`.badge-status-*`), and View Detail link (`<Link to={`/documents/${doc.id}`} className="btn-secondary text-xs">View Details</Link>`).

---

### 7. `Landing.jsx`
- **Header Navbar:** Glassmorphic floating header (`backdrop-blur-md bg-white/70 dark:bg-[#090d16]/70 border-b border-slate-200/50 dark:border-slate-800/50 fixed top-0 w-full z-50`), brand logo `DOnC-key`, navigation links (`Features`, `Docs`, `Pricing`), and Auth action buttons (`Login`, `Sign Up`).
- **Hero Section:**
  - Animated Aurora Background canvas ([Aurora.jsx](file:///c:/Users/Prasad/Downloads/Projects/donk/frontend/src/components/Aurora.jsx)).
  - Main Headline: `"Extract Structured Intelligence from Any Document in Seconds"` (`text-5xl lg:text-7xl font-extrabold tracking-tight`).
  - CTA Buttons: `'Get Started Free'` (`btn-primary py-4 px-8 text-lg`) and `'Read Documentation'` (`btn-secondary py-4 px-8 text-lg`).
- **Feature Cards Grid (3 Columns):** Cards for OCR Extraction, Gemini 2.5 Flash Reasoning, Webhook Subscriptions, and REST API Sandboxes.
- **Interactive Code Snippet Preview:** Tabbed snippet switcher (`cURL`, `JavaScript`, `Python`) displaying syntax-highlighted integration code.

---

### 8. `Login.jsx` & `Signup.jsx`
- **Centered Layout:** `<div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#090d16]">`.
- **Auth Card Container:** `.card-premium-no-hover p-8 max-w-md w-full shadow-2xl`.
- **Form Controls:** Email input (`input-premium`), Password input (`input-premium`), Confirm Password input (Signup only).
- **OAuth Divider:** Horizontal line divider with `"OR CONTINUE WITH"` center text.
- **Google OAuth Button:** `<OAuth buttonText="Sign in with Google" onSuccess={...} onError={...} />`.
- **Footer Route Switcher:** Link text `"Don't have an account? Sign up"` or `"Already have an account? Log in"`.

---

### 9. `PlatformDocs.jsx`
- **Documentation Sections:**
  1. Quickstart Overview
  2. Authentication Header Tutorial (`x-api-key`)
  3. Interactive Code Snippets (`cURL`, `JavaScript Axios/Fetch`, `Python Requests`)
  4. Response Schema Definitions
  5. HTTP Error Code Reference Table

---

### 10. `Usage.jsx`
- **Header Controls:** Time Range Dropdown (`<select value={timeRange} className="input-premium">` with options `7 Days`, `30 Days`, `90 Days`).
- **Analytics Cards Grid:**
  - Total API Calls
  - Total Bandwidth Consumed (MB/GB)
  - Average Latency (ms)
  - Error Rate (%)
- **Endpoint Request Distribution Table:** Breakdown of requests by route (`/api/v1/data`, `/api/v1/extract`, `/documents/:id/chat`).

---

## 🎨 Design System & Styling Rules (`src/index.css`)

The project uses a unified glassmorphism design system built on top of Tailwind CSS with custom utility classes defined in `src/index.css`:

- **`.card-premium`**: Dark/Light adaptive card container with hover scaling (`hover:-translate-y-0.5`), subtle border styling, and backdrop blur.
- **`.card-premium-no-hover`**: Non-interactive container variant with backdrop blur.
- **`.btn-primary`**: Gradient blue call-to-action button with active press state scaling.
- **`.btn-secondary`**: Adaptive slate button for secondary actions.
- **`.input-premium`**: Adaptive dark/light form text input with blue focus ring (`focus:ring-blue-500/20`).
- **`.badge-premium`**: Status pill badge wrapper with rounded-full border.
- **`.table-header-premium` / `.table-row-premium`**: Styled table header and hoverable table row cells.

---

## 🚀 Running & Developing Frontend

### Prerequisites
- Node.js 18+ and `npm`

### Installation & Execution
```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your backend URL and Firebase credentials

# 3. Start development server
npm run dev
```

The Vite dev server will start at `http://localhost:5173`.
