# DOnC-key Platform — Backend Architecture Documentation

Welcome to the **DOnC-key Backend Architecture Guide**. This document provides a complete, component-by-component, model-by-model, and property-by-property reference for the Node.js Express API server and Redis/BullMQ background worker services. It is designed to give developers and AI agents full context on backend operations, API contracts, security mechanisms, database schemas, background job pipelines, and AI integration logic.

---

## 🛠️ Architecture & Technology Stack

The backend architecture consists of two primary operational processes:
1. **API REST Server (`server.js`):** Express HTTP server handling authentication, project/document management, REST endpoint queries, and public API data consumption.
2. **Background Processing Worker (`worker.js`):** BullMQ worker process backed by Redis for asynchronous document OCR/structured AI extraction and webhook delivery.

### Tech Stack Components:
- **Runtime:** Node.js (v18+)
- **Web Framework:** Express.js v4
- **Database:** MongoDB (via Mongoose v8 ORM)
- **Task Queue & Caching:** Redis (via IORedis) & BullMQ
- **AI Integration:** `@google/generative-ai` (Google Gemini 2.5 Flash, Gemini Vision, and `text-embedding-004`)
- **Authentication:** Firebase Admin SDK (JWT ID token verification)
- **File Parsing & Storage:** Multer, `pdf-parse`, `mammoth` (DOCX), native Buffer handling for images
- **Security:** `crypto` (SHA-256 prefix-hashing, timing-safe equality checks), `express-rate-limit`
- **Logging:** Winston logger with level-based file/console transport

---

## 📁 Backend Directory Hierarchy

```text
backend/
├── config/
│   └── firebase.js            # Firebase Admin SDK initialization
├── middleware/
│   ├── auth.js                # Firebase JWT authentication middleware
│   ├── errorHandler.js        # Global Express error response handler
│   ├── rateLimiter.js         # API rate limiting middleware
│   └── validators.js          # Express-validator schema definitions
├── models/
│   ├── ApiKey.js              # Document API Key Mongoose model
│   ├── ApiLog.js              # Request Audit Log Mongoose model
│   ├── ApiUsage.js            # Aggregated Usage Analytics Mongoose model
│   ├── Document.js            # Document metadata Mongoose model
│   ├── DocumentData.js        # Extracted AI output & vector embeddings model
│   ├── Project.js             # Project entity Mongoose model
│   └── Webhook.js             # Webhook registration Mongoose model
├── routes/
│   ├── admin.js               # System management routes
│   ├── apiKeys.js             # Document API Key lifecycle management routes
│   ├── chat.js                # Document RAG Q&A chat endpoint
│   ├── data.js                # Public API v1 endpoints with x-api-key auth
│   ├── documents.js           # Document upload, CRUD, search & export routes
│   ├── logs.js                # Request history logs audit routes
│   ├── projects.js            # Project CRUD management routes
│   ├── usage.js               # Usage analytics & dashboard stats routes
│   └── webhooks.js            # Webhook subscription management routes
├── temp/                      # Local disk temporary upload directory
├── utils/
│   ├── documentProcessor.js   # Background worker extraction execution engine
│   ├── errors.js              # Custom operational error classes
│   ├── fileProcessor.js       # File parser & Multer storage configuration
│   ├── gemini.js              # Google Gemini API wrapper (Summary, Vision, Chat)
│   ├── logger.js              # Winston logger setup
│   └── queue.js               # BullMQ queue instantiations
├── .env                       # Backend environment configuration
├── .env.example               # Environment template file
├── Dockerfile                 # Container deployment definition
├── package.json               # Backend dependencies & npm scripts
├── server.js                  # Express API server entry point
└── worker.js                  # BullMQ background worker entry point
```

---

## ⚙️ Environment Variables Configuration (`.env`)

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `PORT` | Number | Server HTTP port (Default: `5000`) |
| `MONGODB_URI` | String | MongoDB connection string URI |
| `REDIS_URL` | String | Redis connection URL (e.g., `redis://127.0.0.1:6379`) |
| `GEMINI_API_KEY` | String | Google AI Studio API Key for Gemini models |
| `FIREBASE_PROJECT_ID` | String | Firebase Project ID for Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | String | Firebase Admin service account client email |
| `FIREBASE_PRIVATE_KEY` | String | Firebase Admin service account private key string |

---

## 🚀 Server & Worker Entry Points

### 1. `server.js` (Express API Server)
- **CORS Policy:** Allows origins `localhost`, `https://d-on-c-key.vercel.app`, and `https://donc-key-frontend.onrender.com` with `credentials: true`.
- **Global Rate Limiting:** Applies `apiLimiter` (100 requests per 15 mins) to all incoming requests.
- **Port Allocation Fallback:** Contains an automated fallback algorithm (`startServer`). If port `5000` is busy (`EADDRINUSE`), automatically attempts ports up to `PORT + 10`.
- **Static File Serving:** Serves local uploaded files under `/uploads` from `temp/`.
- **Mounted Route Blueprint:**
  - `GET /api/status`: Health check endpoint.
  - `/api/documents`: `documents.js`
  - `/api/projects`: `projects.js`
  - `/api/documents`: `apiKeys.js` (Sub-resource `/documents/:id/api-keys`)
  - `/api/documents`: `chat.js` (Sub-resource `/documents/:id/chat`)
  - `/api/v1`: `data.js` (Public data API)
  - `/api/admin`: `admin.js`
  - `/api/usage`: `usage.js`
  - `/api/webhooks`: `webhooks.js`
  - `/api/logs`: `logs.js`

---

### 2. `worker.js` (BullMQ Background Worker)
Initializes two independent BullMQ workers on Redis:
1. **`documentProcessing` Worker:**
   - **Concurrency:** `1` (processes one document task sequentially).
   - **Retention:** Keeps last 100 completed and 100 failed jobs.
   - **Task Logic:** Invokes `processDocument(job.data.documentId, job.data.fileUrl)` from `documentProcessor.js`.
2. **`webhookDelivery` Worker:**
   - **Concurrency:** `5` (delivers up to 5 webhooks concurrently).
   - **Task Logic:** Dispatches HTTP POST request using `axios` with custom user agent `'DOnC-key-Platform/1.0'` and a 5-second timeout.

---

## 🗄️ Database Models Breakdown (`backend/models/`)

### 1. `Document.js` (`Document` Model)
Stores document metadata and processing state.
```javascript
{
  _id: { type: String, required: true },              // Custom unique ID string
  fileUrl: { type: String },                           // Remote or local file URI
  fileName: { type: String },                          // Original file name
  fileType: { type: String },                          // MIME type (e.g. application/pdf, image/png)
  fileSize: { type: Number },                          // File size in bytes
  status: { 
    type: String, 
    enum: ['queued', 'processing', 'ready', 'failed'], 
    default: 'queued' 
  },
  tempFilePath: { type: String },                      // Local temp path if stored locally
  storageProvider: { 
    type: String, 
    enum: ['firebase', 'local'], 
    default: 'firebase' 
  },
  modelSelected: { type: String, default: 'gemini-2.5-flash' }, // Gemini model used
  customSchema: { type: mongoose.Schema.Types.Mixed, default: null }, // User extraction schema
  error: { type: String, default: null },              // Processing failure message
  projectId: { type: ObjectId, ref: 'Project' },       // Linked project ID
  userId: { type: String, index: true }                // Firebase User UID owner
}
```

---

### 2. `DocumentData.js` (`DocumentData` Model)
Stores extracted AI output data and vector embeddings.
```javascript
{
  documentId: { type: String, required: true, unique: true, index: true },
  data: { type: Object, required: true },              // Parsed JSON extraction result
  embeddings: { type: [Number], required: false },    // Text embedding vector (text-embedding-004)
  createdAt: { type: Date, default: Date.now }
}
// Text Search Index:
documentDataSchema.index(
  { 'data.summary': 'text', 'data.extractedText': 'text' },
  { name: 'document_text_search', weights: { 'data.summary': 10, 'data.extractedText': 5 } }
);
```

---

### 3. `ApiKey.js` (`ApiKey` Model)
High-performance B-tree indexed API key authentication model.
```javascript
{
  documentId: { type: String, required: true, index: true },
  keyHash: { type: String, required: true, unique: true }, // SHA-256 hash of full API key
  keyPrefix: { type: String, required: true, index: true }, // Key prefix (e.g. 'doc_a1b2c3')
  revoked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}
// Compound Index for lightning-fast candidate lookup:
apiKeySchema.index({ keyPrefix: 1, revoked: 1 });
```

---

### 4. `ApiLog.js` (`ApiLog` Model)
Request history audit trail for document REST API consumption.
```javascript
{
  documentId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  latencyMs: { type: Number, required: true },
  ipAddress: { type: String },
  userId: { type: String, index: true },
  timestamp: { type: Date }                            // Automatically populated by timestamps setting
}
```

---

### 5. `ApiUsage.js` (`ApiUsage` Model)
Aggregated API call telemetry and response tracking.
```javascript
{
  documentId: { type: String, required: true, index: true },
  endpoint: { type: String, required: true },
  success: { type: Boolean, required: true },
  latency: { type: Number, required: true },
  timestamp: { type: Date }
}
```

---

### 6. `Project.js` (`Project` Model)
Logical container model for grouping documents and webhooks.
```javascript
{
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  userId: { type: String, required: true, index: true }
}
```

---

### 7. `Webhook.js` (`Webhook` Model)
Webhook endpoint registration model.
```javascript
{
  url: { type: String, required: true, trim: true },
  events: { 
    type: [String], 
    enum: ['document.ready', 'document.failed'], 
    default: ['document.ready', 'document.failed'] 
  },
  active: { type: Boolean, default: true },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  userId: { type: String, required: true, index: true }
}
```

---

## 🛡️ Middleware System (`backend/middleware/`)

### 1. `auth.js` (`verifyToken`)
- Extracts Bearer token from `Authorization` header (`Bearer <token>`).
- Verifies token using `admin.auth().verifyIdToken(token)`.
- Attaches decoded user payload to `req.user`.
- Returns HTTP `401 Unauthorized` if token is missing or invalid.

---

### 2. `rateLimiter.js`
Provides rate limiters powered by `express-rate-limit`:
- `apiLimiter`: 100 requests per 15 minutes window (applied globally).
- `dataApiLimiter`: 60 requests per 1 minute window (applied to `/api/v1/*` endpoints).

---

### 3. `errorHandler.js`
Central Express error handling middleware. Catches operational and unhandled runtime exceptions, logs error details via `logger.error()`, and returns standardized JSON response:
```json
{
  "error": "Error message description",
  "status": 500
}
```

---

### 4. `validators.js`
Schema validation rules using `express-validator`:
- `validateProject`: Validates `name` (required, non-empty) for project endpoints.
- `validateDocumentUpload`: Checks file presence.
- `validateWebhook`: Validates `url` format and `events` array choices.

---

## 🧰 Utility Layer (`backend/utils/`)

### 1. `gemini.js`
Encapsulates all Google Gemini Generative AI SDK interactions.
- `generateDocumentSummary(text, customSchema, modelName)`: Calls Gemini 2.5 Flash using structured JSON outputs (`responseMimeType: 'application/json'`, `responseSchema`). Extracts `summary`, `keyPoints`, `entities`, `sentiment`, `category`.
- `analyzeImage(imageBuffer, mimeType, customSchema, modelName)`: Calls Gemini Vision API with inline base64 image data to perform combined OCR and structured field extraction.
- `chatWithDocument(documentText, question, chatHistory)`: Performs contextual RAG Q&A by injecting document text and trailing message history into a strict grounded prompt.
- `generateEmbeddings(text)`: Calls model `text-embedding-004` to generate vector embeddings.
- `convertToGeminiSchema(customSchema)`: Utility that converts custom user JSON schema field definitions into Gemini `SchemaType` format.

---

### 2. `documentProcessor.js` (`processDocument`)
Main background processing routine executed by BullMQ workers:
1. Updates `Document.status` to `'processing'`.
2. Downloads file buffer or reads local temp file.
3. Parses text using `fileProcessor.js` (PDF parsing via `pdf-parse`, DOCX via `mammoth`, plain text directly).
4. If file is an image (`image/*`), executes `analyzeImage()`; otherwise executes `generateDocumentSummary()`.
5. Optionally calls `generateEmbeddings()` on extracted text.
6. Saves extraction output into `DocumentData` collection.
7. Updates `Document.status` to `'ready'`.
8. Queries `Webhook` collection for active webhooks subscribed to `document.ready` for the project and dispatches events to `webhookDeliveryQueue`.
9. On error: Updates `Document.status` to `'failed'` and records error message.

---

### 3. `fileProcessor.js`
Configures Multer disk storage pointing to `temp/` directory. Provides text extraction helper `extractTextFromFile(filePath, mimeType)` for PDF, DOCX, and TXT files.

---

### 4. `queue.js`
Instantiates BullMQ `Queue` instances connected to Redis via `IORedis`:
- `documentProcessingQueue`: Handles document OCR/analysis jobs.
- `webhookDeliveryQueue`: Handles webhook HTTP dispatch jobs.

---

### 5. `logger.js`
Winston logger configured to log info/errors to console and local log files (`logs/combined.log`, `logs/error.log`).

---

### 6. `errors.js`
Operational error hierarchy extending standard `Error`:
- `AppError(message, statusCode)`
- `NotFoundError(message)` (statusCode: 404)
- `ValidationError(message)` (statusCode: 400)
- `UnauthorizedError(message)` (statusCode: 401)

---

## 📡 API Endpoints Reference (`backend/routes/`)

### 1. Documents API (`routes/documents.js`)
- `POST /api/documents/upload` — Upload document file (`multipart/form-data`). Accepts parameters `document`, `projectId`, `modelSelected`, `customSchema`. Pushes job to BullMQ queue.
- `GET /api/documents` — List user's documents (supports search `?q=` and status filter `?status=`).
- `GET /api/documents/:id` — Fetch single document metadata and processing result.
- `DELETE /api/documents/:id` — Delete document and associated data/keys.
- `GET /api/documents/search` — Full-text text/vector search across processed documents.
- `GET /api/documents/:id/export` — Export parsed result as `json` or `csv`.

---

### 2. Public Data API (`routes/data.js`)
Requires `x-api-key` request header. Authenticated via `verifyApiKey` middleware using SHA-256 timing-safe prefix matching.
- `GET /api/v1/data` — Retrieve parsed metadata wrapper `{ documentId, data }`.
- `GET /api/v1/extract/:documentId` — Retrieve raw extracted object payload directly.

---

### 3. API Keys API (`routes/apiKeys.js`)
- `POST /api/documents/:id/api-keys` — Generate a new API key (`doc_...`). Returns plain secret key **once**.
- `GET /api/documents/:id/api-keys` — List generated API keys for a document.
- `PATCH /api/documents/:id/api-keys/:keyId/revoke` — Revoke an API key.

---

### 4. Document Chat API (`routes/chat.js`)
- `POST /api/documents/:id/chat` — Body: `{ question, chatHistory }`. Answers questions using Gemini RAG logic.

---

### 5. Projects API (`routes/projects.js`)
- `GET /api/projects` — List user projects.
- `POST /api/projects` — Create project (`{ name, description }`).
- `GET /api/projects/:id` — Fetch project details and linked documents.
- `DELETE /api/projects/:id` — Delete project.

---

### 6. Webhooks API (`routes/webhooks.js`)
- `GET /api/webhooks?projectId=:id` — List webhooks for project.
- `POST /api/webhooks` — Register webhook (`{ url, events, projectId }`).
- `DELETE /api/webhooks/:id` — Delete webhook subscription.

---

### 7. Usage & Analytics API (`routes/usage.js`)
- `GET /api/usage/analytics` — Fetch aggregated usage metrics (`?range=7d|30d|90d`).
- `GET /api/usage/dashboard-stats` — Fetch stats for dashboard metrics cards.

---

### 8. Logs Audit API (`routes/logs.js`)
- `GET /api/logs/:documentId/logs` — Fetch API request audit logs for a document.

---

## ⚡ Background Execution Pipeline Flow

```text
[ Client ] 
    │
    ▼  POST /api/documents/upload
[ Express Server ] ──(Save temp file & Document DB entry)──► [ MongoDB ]
    │
    ▼  Push Job { documentId, fileUrl }
[ Redis / BullMQ Queue ]
    │
    ▼  Pick up job asynchronously
[ BullMQ Worker (worker.js) ]
    │
    ├─► Extract text / image buffer (fileProcessor.js)
    ├─► Call Gemini 2.5 Flash / Vision API (gemini.js)
    ├─► Save extracted result to DocumentData (MongoDB)
    ├─► Update Document status = 'ready' (MongoDB)
    │
    ▼  Query active webhooks for project
[ BullMQ Webhook Queue ] ──► (HTTP POST event payload) ──► [ User Webhook Endpoint ]
```

---

## 🔒 Security & Authentication Architecture

1. **User Authentication:** Secured using Firebase Admin ID Tokens (`Authorization: Bearer <token>`). Every user-facing request verifies the token and scopes queries to `req.user.uid`.
2. **API Key Security:** Public data APIs (`/api/v1/*`) rely on prefix-based key verification. Key string format: `doc_<prefix>.<secret>`.
   - The prefix (`keyPrefix`) is indexed in MongoDB for instant B-tree lookup.
   - Incoming key secret is hashed using `crypto.createHash('sha256')`.
   - Candidate hash match uses `crypto.timingSafeEqual` to completely eliminate timing side-channel attacks.
3. **Rate Limiting:** IP-based and route-based rate limiters prevent brute-force attacks and abuse.

---

## 💻 Running & Developing Backend

### Prerequisites
- Node.js 18+
- Local or Remote MongoDB instance
- Local or Remote Redis server

### Installation & Startup Steps
```bash
# 1. Navigate to backend directory and install dependencies
cd backend
npm install

# 2. Configure environment file
cp .env.example .env
# Edit .env with your MongoDB, Redis, Gemini API key, and Firebase parameters

# 3. Start API Server (Development Mode with nodemon)
npm run dev

# 4. Start Background Worker (in a separate terminal)
npm run worker
```

The REST API server will run on `http://localhost:5000`.
