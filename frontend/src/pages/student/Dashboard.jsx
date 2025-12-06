import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { format } from 'date-fns'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentDashboard() {
  const { user, loading: authLoading } = useAuth()
  
  const { data: applicationsData, isLoading, error, isFetching } = useQuery(
    'applications',
    () => api.get('/applications?limit=5').then(res => {
      // Handle both direct data and nested data structures
      const responseData = res.data
      return {
        applications: responseData?.applications || responseData || [],
        pagination: responseData?.pagination
      }
    }),
    {
      retry: 1,
      refetchOnWindowFocus: false,
      enabled: !authLoading, // Only fetch when auth is loaded
      staleTime: 0, // Always consider data stale to avoid 304 issues
      cacheTime: 0, // Don't cache to ensure fresh data
      onError: (err) => {
        console.error('Dashboard error:', err)
        console.error('Error details:', err.response?.data)
      },
      onSuccess: (data) => {
        console.log('Applications loaded:', data)
      }
    }
  )

  // Handle different response structures
  const applications = Array.isArray(applicationsData?.applications) 
    ? applicationsData.applications 
    : Array.isArray(applicationsData) 
    ? applicationsData 
    : []

  const stats = {
    total: applications?.length || 0,
    underReview: applications?.filter(a => a.status === 'under_review').length || 0,
    documentsPending: applications?.filter(a => a.status === 'documents_pending').length || 0,
    approved: applications?.filter(a => a.status === 'approved').length || 0,
  }

  // Always show content, even if loading or error
  const showContent = !isLoading

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      under_review: 'bg-yellow-100 text-yellow-600',
      documents_pending: 'bg-orange-100 text-orange-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
    }
    return colors[status] || colors.draft
  }

  const getStatusLabel = (status) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  // Show loading only for auth, not for applications
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Debug info
  console.log('Dashboard render:', { 
    user, 
    isLoading, 
    error, 
    applicationsCount: applications?.length,
    applicationsData 
  })

  return (
    <div className="space-y-6" style={{ minHeight: '400px' }}>
      {/* Welcome Banner - Always visible */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Student'}!
        </h1>
        <p className="text-blue-100 mb-6">Track your applications and manage your documents all in one place.</p>
        <Link to="/applications/new" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 inline-flex items-center gap-2 transition-colors">
          <i className="fas fa-plus"></i>
          New Application
        </Link>
      </div>

      {(isLoading || isFetching) && (
        <div className="flex items-center justify-center py-8 bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading applications...</span>
        </div>
      )}

      {/* Error Display */}
      {error && !isLoading && !isFetching && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-exclamation-circle text-red-500 text-xl"></i>
            <p className="text-red-800 font-semibold">Error loading applications</p>
          </div>
          <p className="text-red-600 text-sm mb-3">
            {error.response?.data?.error || error.message || 'Unable to fetch applications'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500 mt-1">Total Applications</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.underReview}</p>
          <p className="text-sm text-gray-500 mt-1">Under Review</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <i className="fas fa-exclamation-circle text-orange-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.documentsPending}</p>
          <p className="text-sm text-gray-500 mt-1">Documents Pending</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
          <p className="text-sm text-gray-500 mt-1">Approved</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12">
            <i className="fas fa-exclamation-circle text-red-300 text-5xl mb-4"></i>
            <p className="text-red-500 mb-2">Failed to load applications</p>
            <p className="text-gray-500 text-sm mb-4">
              {error.response?.data?.error || error.message || 'Unable to fetch applications'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Retry
            </button>
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {applications.map((app) => (
              <Link
                key={app.id}
                to={`/applications/${app.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-university text-gray-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.university?.name || 'University'}</p>
                    <p className="text-sm text-gray-500">{app.program}</p>
                    <p className="text-xs text-gray-400 mt-1">{app.applicationNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                    {getStatusLabel(app.status)}
                  </span>
                  <i className="fas fa-chevron-right text-gray-400"></i>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-500 mb-4">No applications yet</p>
            <Link to="/applications/new" className="btn-primary inline-block">
              Create Your First Application
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

