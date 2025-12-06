import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminRefunds() {
  const queryClient = useQueryClient()
  const [filters, setFilters] = useState({
    status: '',
    page: 1
  })

  const { data, isLoading, error } = useQuery(
    ['admin-refunds', filters],
    () => api.get('/admin/refunds', { params: filters }).then(res => res.data),
    { keepPreviousData: true }
  )

  const reviewMutation = useMutation(
    ({ refundId, data }) => api.post(`/admin/refunds/${refundId}/review`, data),
    {
      onSuccess: () => {
        toast.success('Refund reviewed successfully')
        queryClient.invalidateQueries(['admin-refunds'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to review refund')
      }
    }
  )

  const refunds = data?.refunds || []
  const pagination = data?.pagination || {}

  const handleReview = (refund, status) => {
    reviewMutation.mutate({
      refundId: refund.id,
      data: { status, reviewNotes: `Refund ${status}` }
    })
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      approved: 'bg-green-100 text-green-600',
      processed: 'bg-blue-100 text-blue-600',
      rejected: 'bg-red-100 text-red-600'
    }
    return colors[status] || 'bg-gray-100 text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-600">Error loading refunds</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Refunds</h1>
        <p className="text-gray-500 mt-1">Review and process refund requests</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processed">Processed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="col-span-2 flex items-end">
            <button
              onClick={() => setFilters({ status: '', page: 1 })}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Refund ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <i className="fas fa-undo text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500">No refunds found</p>
                  </td>
                </tr>
              ) : (
                refunds.map((refund) => (
                  <tr key={refund.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900">#{refund.refundNumber || refund.id.slice(0, 8)}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">
                        {refund.user?.firstName} {refund.user?.lastName}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900">
                        {refund.payment?.gatewayTransactionId || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">
                        ₹{parseFloat(refund.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900 text-sm">{refund.reason || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(refund.status)}`}>
                        {refund.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {new Date(refund.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {refund.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(refund, 'approved')}
                            disabled={reviewMutation.isLoading}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(refund, 'rejected')}
                            disabled={reviewMutation.isLoading}
                            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {refund.status === 'approved' && (
                        <button
                          onClick={() => handleReview(refund, 'processed')}
                          disabled={reviewMutation.isLoading}
                          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                        >
                          Mark Processed
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} refunds
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
