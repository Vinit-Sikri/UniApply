import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'

export default function AdminDashboard() {
  const { data, isLoading } = useQuery('admin-dashboard', () =>
    api.get('/admin/dashboard').then(res => res.data)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const stats = data?.statistics || {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-file-alt text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Total Applications</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingApplications || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Review</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            ₹{stats.totalRevenue ? (stats.totalRevenue / 100000).toFixed(1) + 'L' : '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">Revenue (This Month)</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
              <i className="fas fa-comments text-red-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingTickets || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Pending Tickets</p>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
          <Link to="/admin/applications" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All →
          </Link>
        </div>

        {data?.recentApplications && data.recentApplications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {data.recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-university text-gray-600 text-xl"></i>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{app.university?.name || 'University'}</p>
                    <p className="text-sm text-gray-500">{app.program}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {app.student?.firstName} {app.student?.lastName} • {app.applicationNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    app.status === 'under_review' ? 'bg-yellow-100 text-yellow-600' :
                    app.status === 'approved' ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {app.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <Link
                    to={`/admin/applications/${app.id}/review`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
            <p className="text-gray-500">No applications yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

