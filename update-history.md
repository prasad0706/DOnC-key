# DOnC-key Project Update History: Prompt-Wise Log

This document records the incremental updates made to the DOnC-key platform, categorized by individual prompts/sessions. This format allows developers and agent instances to track changes, features, and fixes in a clear chronological order.

---

### 📝 Prompt 1: Core Backend Architecture, Chat APIs, and Docker Setup
* **Date**: March 16, 2026
* **Objective**: Create the core platform APIs, user usage aggregation models, background BullMQ queues, and containerization.
* **Work Done & Edits**:
  * **Backend Setup**: Initialized Node/Express backend. Added global error handlers, validator middlewares, and Winston logging.
  * **Database Models**: Created Mongoose schemas: `ApiKey`, `ApiLog`, `ApiUsage`, `Document`, `DocumentData`, `Project`, and `Webhook`.
  * **Queue Infrastructure**: Configured BullMQ for background queues (`documentProcessing` and `webhookDelivery`) connected via Redis.
  * **AI Integration**: Wired up the Gemini Generative AI SDK, exposing endpoints for document summarization, entity extraction, and contextual chat Q&A (`POST /api/documents/:id/chat`).
  * **Containerization**: Configured `Dockerfile` for frontend and backend, and unified services in a `docker-compose.yml`.

---

### 📝 Prompt 2: Redis Queues & Backend Logic Fixes
* **Date**: March 23 – June 17, 2026
* **Objective**: Stabilize queue tasks inside Docker and finalize core endpoints.
* **Work Done & Edits**:
  * **Queue Adjustments**: Standardized connection parameters in [queue.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/queue.js) to cleanly connect to local Redis when running within Docker networking.
  * **Endpoint Fixes**: Corrected paths and route declarations for [projects.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/projects.js), [apiKeys.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/apiKeys.js), and [admin.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/admin.js).

---

### 📝 Prompt 3: Frontend UX Overhaul, Bulk Uploads, and Local Storage Fallback
* **Date**: June 17, 2026
* **Objective**: Polish the styling system of the React app and improve uploading resiliency.
* **Work Done & Edits**:
  * **UX/UI Redesign**: Overhauled all page structures (Login, Sign-Up, Dashboard, Workspace tabs, Metrics visual charts) utilizing Tailwind CSS to achieve a modern visual style.
  * **Bulk Uploads**: Built a React-based dropzone accepting multiple files concurrently. Linked it to backend routes handling parallel array mapping.
  * **Dual-Storage Engine**: Added a fallback in [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js) that routes uploads to a local folder `/backend/temp` if Firebase configuration is missing or Firebase billing accounts are closed.

---

### 📝 Prompt 4: Dynamic Extraction Schemas & Semantic Search
* **Date**: June 18, 2026
* **Objective**: Give developers control over AI extraction schemas and implement conceptual vector-based searches.
* **Work Done & Edits**:
  * **Custom Schema Editor**: Created a drag-and-build JSON schema designer in the frontend and mapped the output to Gemini's `responseSchema` parameters.
  * **Vector Embeddings**: Integrated the `text-embedding-004` model in [gemini.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/gemini.js) to generate 768-dimension vectors for document extracts.
  * **MongoDB Search Route**: Wrote search endpoint combining MongoDB text indexes with `$vectorSearch` similarity pipelines.

---

### 📝 Prompt 5: Webhook Subscriptions, Auditing logs, and API Sandbox
* **Date**: June 18, 2026
* **Objective**: Implement callbacks for processed files, build metrics logging, and create a live sandbox.
* **Work Done & Edits**:
  * **Webhooks Delivery**: Created background workers that dispatch JSON payloads when document jobs resolve to `ready` or `failed`.
  * **API Log Auditing**: Embedded a middleware logger in [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js) that audits client IP, method, status codes, and latencies, exposing them via `/api/logs`.
  * **Playground sandbox**: Added an interactive playground tab where developers can input API keys and test routes directly from the dashboard.

---

### 📝 Prompt 6: API Key Secure Routing, Theme Tuning, and Documentation
* **Date**: June 20 – July 10, 2026
* **Objective**: Add key routing, finish theme toggle styles, and detail testing plans.
* **Work Done & Edits**:
  * **Secure Hashing**: Implemented SHA-256 API key hashing on creation.
  * **Light Theme Style Tuning**: Polished colors and visibility rules across Tailwind classes for the new Light Theme toggles.
  * **Verification Guides**: Created [test-setup.md](file:///c:/Users/Prasad/Downloads/Projects/donk/test-setup.md) detailing the step-by-step verification checklist.

---

### 📝 Prompt 7: Landing Page Polish & Fluid Animations
* **Date**: July 12, 2026
* **Objective**: Add landing page visual effects.
* **Work Done & Edits**:
  * **Aurora CSS Canvas**: Created [Aurora.jsx](file:///c:/Users/Prasad/Downloads/Projects/donk/frontend/src/components/Aurora.jsx) and its stylesheet [Aurora.css](file:///c:/Users/Prasad/Downloads/Projects/donk/frontend/src/components/Aurora.css) generating interactive, glowing gradients.
  * **Marketing Copy**: Adjusted landing titles to showcase DOnC-key's developer-first tool profile.

---

### 📝 Prompt 8: Improvement Roadmap & TODO List
* **Date**: July 13, 2026 (11:38 AM)
* **Objective**: Go through suggestions in `new3.md` and build an architectural roadmap.
* **Work Done & Edits**:
  * **Roadmap File**: Created [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md) containing structured tasks grouping code modifications, new backend features, and interview preparations.

---

### 📝 Prompt 9: Big-O Indexing Complexity Corrections
* **Date**: July 13, 2026 (11:46 AM - Current Prompt)
* **Objective**: Address the mathematical indexing complexity claims in comments and documentation.
* **Work Done & Edits**:
  * **Complexity correction**: Replaced claims of instant $\mathcal{O}(1)$ query times with logarithmic B-tree search complexity ($\mathcal{O}(\log n)$).
  * **Modified files**:
    * [ApiKey.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/ApiKey.js#L17) (Schema index documentation)
    * [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js#L13) (Verify API key middleware documentation)
    * [README.md](file:///c:/Users/Prasad/Downloads/Projects/donk/README.md) (Security practices description)
  * **Roadmap Update**: Marked "Fix the Big-O Indexing Claim" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 10: Storage Architecture & Distributed State Defense (Option B)
* **Date**: July 21, 2026
* **Objective**: Refine storage architecture logic and interview documentation for state isolation without adding unnecessary Docker overhead.
* **Work Done & Edits**:
  * **Architecture Refinement**: Clarified cloud object storage (Firebase/S3) as the stateless production mechanism and single-node disk fallback (`/backend/temp`) as the offline dev mechanism.
  * **Modified files**:
    * [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js#L71) (Added storage provider selection comments and fallback warnings)
    * [documentProcessor.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/documentProcessor.js#L31) (Enhanced logger metadata for local vs cloud storage loading)
    * [README.md](file:///c:/Users/Prasad/Downloads/Projects/donk/README.md) (Updated Section 3 under Resilience & Distributed Scaling Constraints for interview defense)
  * **Roadmap Update**: Marked "Fix the Distributed State Anti-Pattern" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 11: Timing-Safe API Key Verification Security Upgrade
* **Date**: July 22, 2026
* **Objective**: Eliminate timing side-channel attack vulnerabilities in API key verification and adopt standard `prefix.secret` formatting.
* **Work Done & Edits**:
  * **Key Formatting**: Updated API key generation to produce `doc_<8-hex-prefix>.<48-hex-secret>` tokens.
  * **Timing Attack Defense**: Updated `verifyApiKey` middleware in `data.js` to query database candidate keys strictly by `keyPrefix`, performing SHA-256 hash comparison in Node.js memory using constant-time `crypto.timingSafeEqual()`.
  * **Modified files**:
    * [apiKeys.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/apiKeys.js#L28) (Formatted newly generated keys as prefix.secret)
    * [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js#L50) (Upgraded middleware to use prefix-only DB queries and crypto.timingSafeEqual)
  * **Roadmap Update**: Marked "Fix API Key Verification Security" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 12: Fix RAM Exhaustion Vulnerability (Multer diskStorage)
* **Date**: July 26, 2026
* **Objective**: Reconfigure Multer from `memoryStorage` to `diskStorage` to eliminate process-crashing Out-of-Memory (OOM) risks during concurrent file uploads.
* **Work Done & Edits**:
  * **Disk Storage Engine**: Replaced `multer.memoryStorage()` with `multer.diskStorage()` targeting temporary disk directory `backend/temp/uploads_tmp`.
  * **Direct Streaming & Cleanup**: Updated Firebase cloud upload to use `bucket.upload(file.path, ...)` streaming directly from disk path without buffering in V8 RAM. Added `finally` cleanup block to automatically delete temporary Multer artifacts after saving to storage.
  * **Modified files**:
    * [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js#L15) (Reconfigured Multer storage engine and added disk cleanup logic)
  * **Roadmap Update**: Marked "Fix RAM Exhaustion Vulnerability" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 13: Fix Document Chunking Strategy (Recursive Text Splitting & Multi-Chunk Vectors)
* **Date**: August 11, 2026
* **Objective**: Replace text truncation with a Recursive Character Text Splitting strategy (~500 tokens / ~1500 chars with ~50 tokens / ~150 chars overlap) and generate multi-chunk vector embeddings for RAG and semantic search.
* **Work Done & Edits**:
  * **Text Splitter Module**: Created [textSplitter.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/textSplitter.js) implementing recursive splitting along natural separators (`\n\n`, `\n`, `. `, ` `, `""`).
  * **Multi-Chunk Schema**: Updated [DocumentData.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/DocumentData.js#L18) to store a `chunks` array containing `chunkIndex`, `text`, and `embedding`.
  * **Chunk Vector Ingestion**: Updated [documentProcessor.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/documentProcessor.js#L59) to split extracted document text and generate vector embeddings per chunk.
  * **Vector Search Pipeline**: Updated [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js#L284) to query `chunks.embedding` and return targeted chunk snippets in semantic search results.
  * **Roadmap Update**: Marked "Fix Document Chunking Strategy" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md) — completing all tasks in **Category 1: Critical Code & Architectural Fixes**.

---

### 📝 Prompt 14: Implement Automated Testing (Jest & Supertest Integration)
* **Date**: August 11, 2026
* **Objective**: Configure an automated unit and integration testing environment replacing manual QA checklists with automated test suites.
* **Work Done & Edits**:
  * **Environment Setup**: Configured Jest test runner environment in [jest.config.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/jest.config.js) and registered `"test": "jest --detectOpenHandles --forceExit"` script in [package.json](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/package.json#L9). Added `jest` and `supertest` to `devDependencies`.
  * **Test Suites**:
    * Created [textSplitter.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/textSplitter.test.js) for recursive text splitter unit testing.
    * Created [auth.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/auth.test.js) for token parsing and timing-safe API key hash verification testing.
    * Created [documents.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/documents.test.js) for Express REST API endpoint integration testing via Supertest.
  * **Roadmap Update**: Marked "Implement Automated Testing" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 15: Implement Webhook Payload Signing (HMAC SHA-256 & X-Hub-Signature-256)
* **Date**: August 12, 2026
* **Objective**: Add cryptographic authenticity guarantees to outgoing webhooks using HMAC SHA-256 signatures dispatched via the `X-Hub-Signature-256` header.
* **Work Done & Edits**:
  * **Signing Utility**: Created [webhookSigner.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/webhookSigner.js) implementing `generateWebhookSignature` and constant-time `verifyWebhookSignature`.
  * **Secret Management**: Updated [Webhook.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/Webhook.js#L19) and [webhooks.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/webhooks.js#L13) to auto-generate or accept 48-char random secrets on listener registration.
  * **Worker Header Dispatch**: Updated [worker.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/worker.js#L66) to compute HMAC signatures and attach `X-Hub-Signature-256: sha256=<signature>` headers to outgoing POST deliveries.
  * **Unit Test Suite**: Created [webhooks.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/webhooks.test.js) testing header formatting, validity checks, and payload tampering rejections (100% test pass rate across 4 suites and 14 tests).
  * **Roadmap Update**: Marked "Implement Webhook Payload Signing" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 16: Implement Webhook Dead Letter Queue (DLQ) & Manual Replay
* **Date**: August 15, 2026
* **Objective**: Prevent failed webhook payload data loss by routing exhausted retry jobs to a Dead Letter Queue and providing manual replay API endpoints.
* **Work Done & Edits**:
  * **DLQ Schema**: Created [WebhookDLQ.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/WebhookDLQ.js) to store failed delivery payloads, URLs, error messages, and retry timestamps.
  * **Worker DLQ Routing**: Updated `webhookWorker.on('failed')` in [worker.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/worker.js#L103) to automatically capture and persist permanently failed jobs into the `WebhookDLQ` collection.
  * **Replay Endpoints**: Updated [webhooks.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/webhooks.js#L56) adding `GET /api/webhooks/dlq` (to list failed jobs) and `POST /api/webhooks/dlq/:id/replay` (to re-queue failed deliveries back to BullMQ).
  * **Unit Test Suite**: Updated [webhooks.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/webhooks.test.js#L50) testing DLQ schema formatting and payload replay integrity (100% test pass rate across 4 suites and 15 tests).
  * **Roadmap Update**: Marked "Implement Webhook Dead Letter Queue (DLQ)" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 17: Implement Proactive Rate-Limiting (BullMQ Worker Limiter)
* **Date**: August 19, 2026
* **Objective**: Supplement reactive exponential backoff for 429 Too Many Requests responses by implementing proactive, queue-level rate limiters configured to Google Gemini API limits.
* **Work Done & Edits**:
  * **Worker Proactive Limiter**: Updated [worker.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/worker.js#L44) to add BullMQ's native `limiter: { max: GEMINI_MAX_RPM, duration: GEMINI_RPM_DURATION_MS }` option (defaulting to 15 Requests Per Minute).
  * **Fallback Queue Throttling**: Updated [queue.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/queue.js#L44) to enforce proactive minimum delay intervals between tasks during local testing without Redis.
  * **Environment Defaults**: Added `GEMINI_MAX_RPM=15` and `GEMINI_RPM_DURATION_MS=60000` to [.env.example](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/.env.example).
  * **Unit Test Suite**: Created [rateLimiter.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/rateLimiter.test.js) testing RPM calculations and interval window math (100% test pass rate across 5 suites and 18 tests).
  * **Roadmap Update**: Marked "Implement Proactive Rate-Limiting" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).

---

### 📝 Prompt 18: Implement Deep File Validation (Magic Byte Signature Sniffing)
* **Date**: August 19, 2026
* **Objective**: Protect against MIME header spoofing and malicious file uploads by performing deep server-side magic byte inspection on temporary disk files prior to cloud upload.
* **Work Done & Edits**:
  * **Magic Byte Inspector**: Created [fileValidator.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/fileValidator.js) inspecting binary headers for PDF (`%PDF-`), PNG (`0x89504E47`), JPEG (`0xFFD8FF`), GIF (`GIF87a`/`89a`), OpenXML (`PK\x03\x04`), and plain text/CSV. Includes strict rejection of executable headers (`MZ` `.exe`, `\x7fELF`, `0xCAFEBABE`).
  * **Upload Route Integration**: Updated [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js#L65) to inspect magic bytes before Firebase upload and immediately purge non-valid files from disk.
  * **Unit Test Suite**: Created [fileValidator.test.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/tests/fileValidator.test.js) testing document signatures, plain text inspection, and spoofed `.exe` binary header rejections (100% test pass rate across 6 suites and 25 tests).
  * **Roadmap Update**: Marked "Implement Deep File Validation" as complete in [todo-tasks.md](file:///c:/Users/Prasad/Downloads/Projects/donk/todo-tasks.md).
