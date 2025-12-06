import { useState } from 'react'
import { useQuery } from 'react-query'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function StudentApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [issueDetails, setIssueDetails] = useState(null)
  
  const { data, isLoading, refetch } = useQuery(['application', id], () =>
    api.get(`/applications/${id}`).then(res => res.data.application)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link to="/applications" className="btn-primary mt-4 inline-block">
          Back to Applications
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      under_review: 'bg-yellow-100 text-yellow-600',
      documents_pending: 'bg-orange-100 text-orange-600',
      verified: 'bg-green-100 text-green-600',
      issue_raised: 'bg-orange-100 text-orange-600',
      payment_received: 'bg-purple-100 text-purple-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
    }
    return colors[status] || colors.draft
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/applications" className="text-gray-500 hover:text-gray-700">
          <i className="fas fa-arrow-left"></i>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Details</h1>
          <p className="text-gray-500 mt-1">{data.applicationNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">University</label>
                <p className="text-gray-900 mt-1">{data.university?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Program</label>
                <p className="text-gray-900 mt-1">{data.program}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Intake</label>
                <p className="text-gray-900 mt-1">{data.intake || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(data.status)}`}>
                    {data.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Created</p>
                <p className="text-gray-900 mt-1">
                  {data.createdAt ? format(new Date(data.createdAt), 'MMM dd, yyyy') : '-'}
                </p>
              </div>
              {data.submissionDate && (
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="text-gray-900 mt-1">
                    {format(new Date(data.submissionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
              {data.decisionDate && (
                <div>
                  <p className="text-gray-500">Decision</p>
                  <p className="text-gray-900 mt-1">
                    {format(new Date(data.decisionDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Issue Details Section */}
          {data.status === 'issue_raised' && (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Issue Details</h3>
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">
                  Issue Raised
                </span>
              </div>
              
              {issueDetails?.canViewDetails ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 font-medium mb-2">Issue Comments:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{issueDetails.issueDetails}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/applications/${id}/edit`)}
                    className="btn-primary"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Resubmit Application
                  </button>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
                  <i className="fas fa-lock text-orange-500 text-4xl mb-4"></i>
                  <p className="text-orange-800 font-medium mb-2">
                    Issue Resolution Fee Required
                  </p>
                  <p className="text-orange-600 text-sm mb-4">
                    Pay ₹500 to view detailed issue comments and resubmit your application
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        const response = await api.get(`/applications/${id}/issue-details`)
                        if (response.data.canViewDetails) {
                          setIssueDetails(response.data)
                          refetch()
                        } else {
                          navigate(`/applications/${id}/payment`, {
                            state: { paymentType: 'issue_resolution_fee' }
                          })
                        }
                      } catch (error) {
                        if (error.response?.data?.requiresPayment) {
                          navigate(`/applications/${id}/payment`, {
                            state: { paymentType: 'issue_resolution_fee' }
                          })
                        } else {
                          toast.error('Failed to load issue details')
                        }
                      }
                    }}
                    className="btn-primary"
                  >
                    <i className="fas fa-credit-card mr-2"></i>
                    Pay Issue Resolution Fee (₹500)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment Required for Application Fee */}
          {data.status === 'verified' && (
            <div className="card bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Application Verified!</h3>
                  <p className="text-sm text-gray-600">
                    Pay the application fee to complete your submission
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{data.university?.applicationFee?.toLocaleString('en-IN') || '0'}
                  </p>
                  <p className="text-sm text-gray-500">Application Fee</p>
                </div>
                <button
                  onClick={() => navigate(`/applications/${id}/payment`, {
                    state: { paymentType: 'application_fee' }
                  })}
                  className="btn-primary"
                >
                  <i className="fas fa-credit-card mr-2"></i>
                  Pay Now
                </button>
              </div>
            </div>
          )}

          {data.reviewNotes && data.status !== 'issue_raised' && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Review Notes</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{data.reviewNotes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

