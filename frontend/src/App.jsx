import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import StudentDashboard from './pages/student/Dashboard'
import StudentApplications from './pages/student/Applications'
import StudentApplicationDetail from './pages/student/ApplicationDetail'
import StudentNewApplication from './pages/student/NewApplication'
import StudentDocuments from './pages/student/Documents'
import DocumentUploadWizard from './pages/student/DocumentUploadWizard'
import StudentPayments from './pages/student/Payments'
import StudentSupport from './pages/student/Support'
import PaymentPage from './pages/student/PaymentPage'
import AdminDashboard from './pages/admin/Dashboard'
import AdminApplications from './pages/admin/Applications'
import AdminApplicationReview from './pages/admin/ApplicationReview'
import AdminStudents from './pages/admin/Students'
import AdminPayments from './pages/admin/Payments'
import AdminRefunds from './pages/admin/Refunds'
import AdminTickets from './pages/admin/Tickets'
import AdminFAQs from './pages/admin/FAQs'
import AdminDocumentConfig from './pages/admin/DocumentConfig'
import Layout from './components/Layout'

function PrivateRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Student Routes */}
          <Route
            index
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="applications"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentApplications />
              </PrivateRoute>
            }
          />
          <Route
            path="applications/new"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentNewApplication />
              </PrivateRoute>
            }
          />
          <Route
            path="applications/:id"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentApplicationDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="documents"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentDocuments />
              </PrivateRoute>
            }
          />
          <Route
            path="documents/upload-wizard"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <DocumentUploadWizard />
              </PrivateRoute>
            }
          />
          <Route
            path="payments"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="support"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <StudentSupport />
              </PrivateRoute>
            }
          />
          <Route
            path="applications/:applicationId/payment"
            element={
              <PrivateRoute allowedRoles={['student']}>
                <PaymentPage />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="admin"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/applications"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminApplications />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/applications/:id/review"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminApplicationReview />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/students"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminStudents />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/payments"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminPayments />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/refunds"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminRefunds />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/tickets"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminTickets />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/faqs"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminFAQs />
              </PrivateRoute>
            }
          />
          <Route
            path="admin/document-config"
            element={
              <PrivateRoute allowedRoles={['admin', 'super_admin']}>
                <AdminDocumentConfig />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  )
}

export default App

