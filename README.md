# Document Intelligence API Platform

A production-style developer dashboard for a Document Intelligence API Platform.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Firebase project
- MongoDB Atlas account
- Redis (Upstash) account

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-repo/document-intelligence-platform.git
cd document-intelligence-platform
```

2. **Set up backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your actual credentials
```

3. **Set up frontend:**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
```

### Running the Application

1. **Start the backend server:**
```bash
cd backend
npm run dev
```

2. **Start the frontend development server:**
```bash
cd ../frontend
npm run dev
```

3. **Access the application:**
Open your browser to `http://localhost:5173`

## 📂 Project Structure

```
document-intelligence-platform/
├── backend/              # Node.js + Express backend
│   ├── models/           # Mongoose models (Project, Document, etc.)
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   └── ...
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React context providers
    │   ├── pages/         # Application pages (Projects, Dashboard, etc.)
    │   ├── utils/         # Utility functions
    │   └── ...
    └── ...
```

## 🔧 Configuration

### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb+srv://your-mongodb-connection-string
REDIS_URL=redis://your-redis-connection-string
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
JWT_SECRET=your-jwt-secret-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

## 🛠 Tech Stack

### Frontend

- **React** + **Vite** - Modern frontend framework and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Authentication** - Email/password & Google OAuth
- **React Router** - Client-side routing
- **Chart.js** - Data visualization
- **Heroicons** - Beautiful SVG icons

### Backend

- **Node.js** + **Express** - Server framework
- **MongoDB Atlas** - Cloud database
- **Firebase Storage** - File storage
- **Redis (Upstash)** + **BullMQ** - Background job processing
- **Multer** - File upload handling
- **JWT** - Authentication tokens

## 📱 Features

### Authentication
- Email/password login and signup
- Google OAuth integration
- Protected routes
- User profile management

### Project Management
- **Create Projects**: Organize documents into separate projects
- **Project Dashboard**: View statistics and documents per project
- **Delete Projects**: Cascading delete for projects and associated documents

### Document Management
- File upload (PDF, images) linked to specific projects
- Document processing status tracking
- Document detail view with extraction results
- API key generation per document

### API Key Management
- Generate new API keys
- View existing keys
- Revoke keys
- Usage tracking

### Documentation
- **Platform Docs**: Built-in API reference and guides for users

### Usage Analytics
- API calls over time
- Requests per document
- Error vs success rates
- Average latency metrics

### UI Features
- **Landing Page**: Public facing product overview
- Dark/light theme toggle
- Collapsible sidebar navigation
- Responsive design
- Professional developer-focused UI

## 🎨 UI Structure

### Sidebar Navigation
- Dashboard
- Projects
- Documents
- API Keys
- Usage
- Platform Docs
- Profile/Settings

### Main Pages
1. **Landing Page** - Public entry point
2. **Dashboard** - Global overview
3. **Projects** - Project management list
4. **Project Detail** - Specific project view with documents
5. **Upload Document** - Upload interface with project selection
6. **Platform Docs** - Documentation viewer
7. **Api Keys & Usage** - Management and analytics

## 🔒 Security Considerations

- API keys are hashed and never shown again after generation
- Document access is scoped to authenticated users
- Project isolation (users can only see their own projects)
- JWT tokens for API authentication
- Firebase authentication for user management

## 🚀 Deployment

### Backend Deployment
Deploy the Node.js backend to any hosting provider that supports Node.js (Vercel, Render, AWS, etc.).

### Frontend Deployment
Build and deploy the React frontend:
```bash
cd frontend
npm run build
```
Deploy the `dist/` folder to any static hosting (Vercel, Netlify, Firebase Hosting, etc.).

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📬 Support

For questions or issues, please open a GitHub issue.
