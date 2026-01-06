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
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── context/       # React context providers
    │   ├── pages/         # Application pages
    │   ├── utils/         # Utility functions
    │   ├── App.jsx        # Main application
    │   └── main.jsx       # Entry point
    ├── public/            # Static assets
    ├── .env               # Frontend environment variables
    └── package.json      # Frontend dependencies
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
- **Firebase Authentication** - Email/password authentication
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
- Firebase authentication integration
- Protected routes
- User profile management

### Document Management
- File upload (PDF, images)
- Document processing status tracking
- Document detail view
- API key generation per document

### API Key Management
- Generate new API keys
- View existing keys
- Revoke keys
- Usage tracking

### Usage Analytics
- API calls over time
- Requests per document
- Error vs success rates
- Average latency metrics

### UI Features
- Dark/light theme toggle
- Collapsible sidebar navigation
- Responsive design
- Professional developer-focused UI

## 🎨 UI Structure

### Sidebar Navigation
- Dashboard
- Documents
- API Keys
- Usage
- Profile/Settings
- Theme toggle
- Logout

### Main Pages
1. **Dashboard** - Quick overview and actions
2. **Documents** - Document list with status
3. **Document Detail** - Document overview and API key management
4. **API Keys** - Global API key management
5. **Usage** - Analytics and metrics
6. **Profile** - User settings and account info

## 🔒 Security Considerations

- API keys are hashed and never shown again after generation
- Document access is scoped to authenticated users
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
