import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import { format } from 'date-fns'

export default function StudentApplications() {
  const { data, isLoading } = useQuery('applications', () =>
    api.get('/applications').then(res => res.data)
  )

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-500 mt-1">Manage and track all your university applications</p>
        </div>
        <Link to="/applications/new" className="btn-primary">
          <i className="fas fa-plus mr-2"></i>
          New Application
        </Link>
      </div>

      {data?.applications && data.applications.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Application #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">University</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Program</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((app) => (
                  <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600">{app.applicationNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{app.university?.name || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-700">{app.program}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {app.submissionDate ? format(new Date(app.submissionDate), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/applications/${app.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <i className="fas fa-file-alt text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 mb-4">No applications yet</p>
          <Link to="/applications/new" className="btn-primary inline-block">
            Create Your First Application
          </Link>
        </div>
      )}
    </div>
  )
}


