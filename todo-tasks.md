# DOnC-key Improvement Roadmap & TODO List

## 🛑 Category 1: Critical Code & Architectural Fixes
- [x] **Fix the Big-O Indexing Claim**
  - [x] Correct references to $\mathcal{O}(1)$ query speed for API key lookups in [ApiKey.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/ApiKey.js#L17)
  - [x] Correct references in [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js#L13) and [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js#L54)
  - [x] Correct references in [README.md](file:///c:/Users/Prasad/Downloads/Projects/donk/README.md)
- [x] **Fix the Distributed State Anti-Pattern**
  - [x] Refine architectural comments in [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js#L71) and [documentProcessor.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/documentProcessor.js#L31) clarifying stateless cloud storage vs single-node local fallback
  - [x] Document production cloud object storage (Firebase/S3) vs single-instance local fallback in [README.md](file:///c:/Users/Prasad/Downloads/Projects/donk/README.md) for interview defense
- [x] **Fix API Key Verification Security**
  - [x] Format keys as prefix.secret (e.g., `doc_abc123.xyz789`) on generation in [apiKeys.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/apiKeys.js)
  - [x] Update key verification in [data.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/data.js) to query only by prefix and use `crypto.timingSafeEqual` in application memory
- [x] **Fix RAM Exhaustion Vulnerability**
  - [x] Reconfigure Multer storage engine in [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js) away from `memoryStorage`
  - [x] Implement streaming uploads or `diskStorage`
- [ ] **Fix Document Chunking Strategy**
  - [ ] Implement a Recursive Character Text Splitting helper (e.g., 500 tokens, 50-token overlap)
  - [ ] Refactor [documentProcessor.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/documentProcessor.js) to chunk text and generate vector embeddings for chunks instead of the entire document
  - [ ] Update [DocumentData.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/models/DocumentData.js) model to support chunk storage and update Search/Chat logic to utilize chunk embeddings

## 🛠️ Category 2: Missing Core Production Features
- [ ] **Implement Automated Testing**
  - [ ] Setup Vitest or Jest/Supertest in the backend
  - [ ] Add integration tests covering auth, document upload, and worker jobs
- [ ] **Implement Webhook Payload Signing**
  - [ ] Compute HMAC signature (SHA-256) of webhook payload using a shared project/user secret
  - [ ] Dispatch signature in `X-Hub-Signature-256` header in [worker.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/worker.js)
- [ ] **Implement Webhook Dead Letter Queue (DLQ)**
  - [ ] Route permanently failed webhook jobs to a BullMQ DLQ
  - [ ] Expose an endpoint and UI options to replay failed webhook events
- [ ] **Implement Proactive Rate-Limiting**
  - [ ] Configure BullMQ queue-level limiters in [queue.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/queue.js) to proactively restrict execution speeds to match upstream Gemini API constraints
- [ ] **Implement Deep File Validation**
  - [ ] Sniff magic bytes using a library like `file-type` on the server in [documents.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/routes/documents.js) rather than trusting client-supplied MIME headers
- [ ] **Implement Cost/Usage Guardrails**
  - [ ] Establish daily/monthly token/operational usage limits per user/project
  - [ ] Check limits before uploading or processing files
- [ ] **Implement API Versioning**
  - [ ] Standardize all backend routes (like `/api/documents`, `/api/projects`, etc.) to use `/api/v1/...` in [server.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/server.js)
- [ ] **Address Prompt Injection Risk**
  - [ ] Refactor system prompts in [gemini.js](file:///c:/Users/Prasad/Downloads/Projects/donk/backend/utils/gemini.js) to segregate user content and treat it strictly as raw, unexecutable data
- [ ] **Setup Basic CI/CD**
  - [ ] Create GitHub Actions workflow to run lint checks and testing on every pull request

## 👔 Category 3: Interview Defense & Verbal Mastery
- [ ] **De-AI the Project Persona**
  - [ ] Edit [README.md](file:///c:/Users/Prasad/Downloads/Projects/donk/README.md) to remove academic/robotic LLM phrasing in favor of direct developer terminology
- [ ] **Defend API Key Hashing Selection**
  - [ ] Review differences between password hashing (bcrypt/Argon2) and random key hashing (SHA-256) for interview prep
- [ ] **Explain Retry Mechanics**
  - [ ] Review how BullMQ exponential backoff works and how Redis locks are managed
- [ ] **Map System Failure Lifecycles**
  - [ ] Map transaction rollback logic and failure recovery steps for queue jobs
- [ ] **Deepen Your Core Feature Focus**
  - [ ] Prepare technical deep-dives on vector similarity query pipelines and background task scheduling
