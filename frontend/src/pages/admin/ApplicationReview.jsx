import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminApplicationReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [action, setAction] = useState('')
  const [issueDetails, setIssueDetails] = useState('')
  const [reviewNotes, setReviewNotes] = useState('')

  const { data, isLoading, error } = useQuery(
    ['application', id],
    () => api.get(`/applications/${id}`).then(res => res.data.application),
    { enabled: !!id }
  )

  const updateMutation = useMutation(
    (data) => api.put(`/applications/${id}`, data),
    {
      onSuccess: () => {
        toast.success('Application updated successfully')
        queryClient.invalidateQueries(['application', id])
        queryClient.invalidateQueries(['admin-applications'])
        queryClient.invalidateQueries(['admin-dashboard'])
        setAction('')
        setIssueDetails('')
        setReviewNotes('')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update application')
      }
    }
  )

  const reviewMutation = useMutation(
    (data) => api.post(`/applications/${id}/review`, data),
    {
      onSuccess: () => {
        toast.success('Application reviewed successfully')
        queryClient.invalidateQueries(['application', id])
        queryClient.invalidateQueries(['admin-applications'])
        queryClient.invalidateQueries(['admin-dashboard'])
        setAction('')
        setIssueDetails('')
        setReviewNotes('')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to review application')
      }
    }
  )

  const aiVerifyMutation = useMutation(
    () => api.post(`/applications/${id}/ai-verify`),
    {
      onSuccess: (data) => {
        toast.success('AI verification completed')
        queryClient.invalidateQueries(['application', id])
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'AI verification failed')
      }
    }
  )

  const handleVerify = () => {
    reviewMutation.mutate({
      status: 'verified',
      reviewNotes
    })
  }

  const handleRaiseIssue = () => {
    if (!issueDetails.trim()) {
      toast.error('Please provide issue details')
      return
    }
    reviewMutation.mutate({
      status: 'issue_raised',
      issueDetails: issueDetails.trim(),
      reviewNotes
    })
  }

  const handleApprove = () => {
    reviewMutation.mutate({
      status: 'approved',
      reviewNotes
    })
  }

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide rejection reason')
      return
    }
    reviewMutation.mutate({
      status: 'rejected',
      reviewNotes: reviewNotes.trim()
    })
  }

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-600',
      submitted: 'bg-blue-100 text-blue-600',
      under_review: 'bg-yellow-100 text-yellow-600',
      verified: 'bg-green-100 text-green-600',
      issue_raised: 'bg-orange-100 text-orange-600',
      payment_received: 'bg-purple-100 text-purple-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
      withdrawn: 'bg-gray-100 text-gray-600'
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

  if (error || !data) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <i className="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
          <p className="text-red-600">Application not found</p>
          <button
            onClick={() => navigate('/admin/applications')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    )
  }

  const application = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Application</h1>
          <p className="text-gray-500 mt-1">Application #{application.applicationNumber}</p>
        </div>
        <button
          onClick={() => navigate('/admin/applications')}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Applications
        </button>
      </div>

      {/* Application Details */}
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Application Number</p>
              <p className="font-medium text-gray-900">{application.applicationNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusBadge(application.status)}`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">University</p>
              <p className="font-medium text-gray-900">{application.university?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Program</p>
              <p className="font-medium text-gray-900">{application.program}</p>
            </div>
            {application.intake && (
              <div>
                <p className="text-sm text-gray-500">Intake</p>
                <p className="font-medium text-gray-900">{application.intake}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(application.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">
                {application.student?.firstName} {application.student?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{application.student?.email}</p>
            </div>
            {application.student?.phone && (
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{application.student.phone}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Verification Results */}
      <div className={`card border-2 ${
        application.aiVerificationStatus === 'completed' 
          ? application.aiVerificationResult?.overallRecommendation === 'approve'
            ? 'bg-green-50 border-green-200'
            : application.aiVerificationResult?.overallRecommendation === 'reject'
            ? 'bg-red-50 border-red-200'
            : 'bg-yellow-50 border-yellow-200'
          : application.aiVerificationStatus === 'processing'
          ? 'bg-blue-50 border-blue-200'
          : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <i className={`fas fa-robot text-2xl ${
              application.aiVerificationStatus === 'completed' 
                ? application.aiVerificationResult?.overallRecommendation === 'approve'
                  ? 'text-green-600'
                  : application.aiVerificationResult?.overallRecommendation === 'reject'
                  ? 'text-red-600'
                  : 'text-yellow-600'
                : 'text-blue-600'
            }`}></i>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Verification (Level 1)</h2>
              <p className="text-sm text-gray-600">
                Status: <span className="font-medium capitalize">{application.aiVerificationStatus || 'pending'}</span>
                {application.aiVerificationDate && (
                  <span className="ml-2">
                    • {new Date(application.aiVerificationDate).toLocaleString()}
                  </span>
                )}
              </p>
            </div>
          </div>
          {application.aiVerificationStatus !== 'processing' && (
            <button
              onClick={() => aiVerifyMutation.mutate()}
              disabled={aiVerifyMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {aiVerifyMutation.isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-sync"></i>
                  {application.aiVerificationStatus === 'pending' ? 'Start AI Verification' : 'Re-run AI Verification'}
                </>
              )}
            </button>
          )}
        </div>

        {application.aiVerificationStatus === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">AI verification in progress...</p>
            <p className="text-xs text-gray-500 mt-2">This may take a few moments</p>
          </div>
        )}

        {application.aiVerificationStatus === 'completed' && application.aiVerificationResult && (
          <div className="space-y-4">
            {/* Overall Score and Recommendation */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Overall Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {application.aiVerificationResult.overallScore || 0}
                  <span className="text-lg text-gray-500">/100</span>
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                <p className={`text-xl font-semibold ${
                  application.aiVerificationResult.overallRecommendation === 'approve'
                    ? 'text-green-600'
                    : application.aiVerificationResult.overallRecommendation === 'reject'
                    ? 'text-red-600'
                    : 'text-yellow-600'
                }`}>
                  {application.aiVerificationResult.overallRecommendation?.toUpperCase() || 'REVIEW'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Flags</p>
                <p className="text-3xl font-bold text-gray-900">
                  {application.aiVerificationFlags?.length || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Issues found</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="grid grid-cols-3 gap-4">
              {/* Document Quality */}
              {application.aiVerificationResult.documentQuality && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-file-alt text-blue-500"></i>
                    Document Quality
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Score: <span className="font-medium text-lg">{application.aiVerificationResult.documentQuality.qualityScore || 0}/100</span>
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Clarity: <span className="font-medium">{application.aiVerificationResult.documentQuality.clarity || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Completeness: <span className="font-medium">{application.aiVerificationResult.documentQuality.completeness || 'N/A'}</span>
                    </p>
                  </div>
                  {application.aiVerificationResult.documentQuality.issues?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-red-600 mb-1">Issues:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {application.aiVerificationResult.documentQuality.issues.slice(0, 2).map((issue, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Correspondence */}
              {application.aiVerificationResult.correspondence && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-check-double text-green-500"></i>
                    Correspondence
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Score: <span className="font-medium text-lg">{application.aiVerificationResult.correspondence.correspondenceScore || 0}/100</span>
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-500">
                      Name Match: <span className={`font-medium ${application.aiVerificationResult.correspondence.nameMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {application.aiVerificationResult.correspondence.nameMatch ? '✓ Yes' : '✗ No'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Program Match: <span className={`font-medium ${application.aiVerificationResult.correspondence.programMatch ? 'text-green-600' : 'text-red-600'}`}>
                        {application.aiVerificationResult.correspondence.programMatch ? '✓ Yes' : '✗ No'}
                      </span>
                    </p>
                  </div>
                  {application.aiVerificationResult.correspondence.discrepancies?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-red-600 mb-1">Discrepancies:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {application.aiVerificationResult.correspondence.discrepancies.slice(0, 2).map((disc, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{disc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Eligibility */}
              {application.aiVerificationResult.eligibility && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <i className="fas fa-graduation-cap text-purple-500"></i>
                    Eligibility
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Score: <span className="font-medium text-lg">{application.aiVerificationResult.eligibility.score || 0}/100</span>
                  </p>
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">
                      Eligible: <span className={`font-medium ${application.aiVerificationResult.eligibility.eligible ? 'text-green-600' : 'text-red-600'}`}>
                        {application.aiVerificationResult.eligibility.eligible ? '✓ Yes' : '✗ No'}
                      </span>
                    </p>
                  </div>
                  {application.aiVerificationResult.eligibility.missingCriteria?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-red-600 mb-1">Missing Criteria:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {application.aiVerificationResult.eligibility.missingCriteria.slice(0, 2).map((crit, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Flags */}
            {application.aiVerificationFlags && application.aiVerificationFlags.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <i className="fas fa-flag text-yellow-600"></i>
                  AI Flags for Review ({application.aiVerificationFlags.length})
                </h3>
                <ul className="space-y-2">
                  {application.aiVerificationFlags.map((flag, idx) => (
                    <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2 bg-white rounded p-2">
                      <span className="text-yellow-600 mt-0.5">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {(!application.aiVerificationFlags || application.aiVerificationFlags.length === 0) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <i className="fas fa-check-circle text-green-600 text-2xl mb-2"></i>
                <p className="text-sm text-green-800 font-medium">No issues flagged by AI</p>
              </div>
            )}
          </div>
        )}

        {application.aiVerificationStatus === 'failed' && (
          <div className="text-center py-8">
            <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-3"></i>
            <p className="text-sm text-red-600 font-medium mb-2">AI verification failed</p>
            <p className="text-xs text-gray-600 mb-4">Please try running verification again</p>
            <button
              onClick={() => aiVerifyMutation.mutate()}
              disabled={aiVerifyMutation.isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {aiVerifyMutation.isLoading ? 'Retrying...' : 'Retry AI Verification'}
            </button>
          </div>
        )}

        {(!application.aiVerificationStatus || application.aiVerificationStatus === 'pending') && (
          <div className="text-center py-8">
            <i className="fas fa-robot text-gray-400 text-4xl mb-4"></i>
            <p className="text-sm text-gray-600 mb-2 font-medium">AI verification has not been run yet</p>
            <p className="text-xs text-gray-500 mb-4">Click the button below to start AI verification</p>
            <button
              onClick={() => aiVerifyMutation.mutate()}
              disabled={aiVerifyMutation.isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {aiVerifyMutation.isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Starting...
                </>
              ) : (
                <>
                  <i className="fas fa-play"></i>
                  Start AI Verification
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Issue Details (if issue raised) */}
      {application.status === 'issue_raised' && application.issueDetails && (
        <div className="card bg-orange-50 border-2 border-orange-200">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">Issue Details</h2>
          <p className="text-orange-800 whitespace-pre-wrap">{application.issueDetails}</p>
          {application.issueRaisedAt && (
            <p className="text-sm text-orange-600 mt-2">
              Raised on: {new Date(application.issueRaisedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

      {/* Review Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Actions</h2>
        
        <div className="space-y-4">
          {/* Verify Application */}
          {['draft', 'submitted', 'under_review'].includes(application.status) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Verify Application</h3>
                  <p className="text-sm text-gray-500">Mark application as verified to allow payment</p>
                </div>
                <button
                  onClick={() => setAction(action === 'verify' ? '' : 'verify')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {action === 'verify' ? 'Cancel' : 'Verify'}
                </button>
              </div>
              {action === 'verify' && (
                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Review notes (optional)"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows="3"
                  />
                  <button
                    onClick={handleVerify}
                    disabled={reviewMutation.isLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {reviewMutation.isLoading ? 'Processing...' : 'Confirm Verification'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Raise Issue */}
          {['draft', 'submitted', 'under_review', 'verified'].includes(application.status) && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Raise Issue</h3>
                  <p className="text-sm text-gray-500">Require student to pay issue resolution fee to view details</p>
                </div>
                <button
                  onClick={() => setAction(action === 'issue' ? '' : 'issue')}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  {action === 'issue' ? 'Cancel' : 'Raise Issue'}
                </button>
              </div>
              {action === 'issue' && (
                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Issue details (required) - Student will need to pay to view this"
                    value={issueDetails}
                    onChange={(e) => setIssueDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="4"
                    required
                  />
                  <textarea
                    placeholder="Review notes (optional)"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="2"
                  />
                  <button
                    onClick={handleRaiseIssue}
                    disabled={reviewMutation.isLoading || !issueDetails.trim()}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                  >
                    {reviewMutation.isLoading ? 'Processing...' : 'Confirm Issue'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Approve Application */}
          {application.status === 'payment_received' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">Approve Application</h3>
                  <p className="text-sm text-gray-500">Final approval after payment received</p>
                </div>
                <button
                  onClick={() => setAction(action === 'approve' ? '' : 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {action === 'approve' ? 'Cancel' : 'Approve'}
                </button>
              </div>
              {action === 'approve' && (
                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Approval notes (optional)"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows="3"
                  />
                  <button
                    onClick={handleApprove}
                    disabled={reviewMutation.isLoading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {reviewMutation.isLoading ? 'Processing...' : 'Confirm Approval'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reject Application */}
          {['draft', 'submitted', 'under_review', 'verified', 'payment_received'].includes(application.status) && (
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-red-900">Reject Application</h3>
                  <p className="text-sm text-red-700">Reject application with reason</p>
                </div>
                <button
                  onClick={() => setAction(action === 'reject' ? '' : 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  {action === 'reject' ? 'Cancel' : 'Reject'}
                </button>
              </div>
              {action === 'reject' && (
                <div className="mt-4 space-y-3">
                  <textarea
                    placeholder="Rejection reason (required)"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="4"
                    required
                  />
                  <button
                    onClick={handleReject}
                    disabled={reviewMutation.isLoading || !reviewNotes.trim()}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {reviewMutation.isLoading ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
