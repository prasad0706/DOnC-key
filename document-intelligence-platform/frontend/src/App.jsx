import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import DocumentDetail from './pages/DocumentDetail';
import ApiKeys from './pages/ApiKeys';
import Usage from './pages/Usage';
import Profile from './pages/Profile';
import PlatformDocs from './pages/PlatformDocs';
import UploadDocument from './pages/UploadDocument';
import Upload from './pages/Upload';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes with AppLayout */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Protected routes with AppLayout - main app routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/upload" element={<UploadDocument />} />
        <Route path="/documents/:id" element={<DocumentDetail />} />
        <Route path="/documents/:id/api-keys" element={<ApiKeys />} />
        <Route path="/platform-docs" element={<PlatformDocs />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

