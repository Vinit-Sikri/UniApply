import { useQuery } from 'react-query'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { format } from 'date-fns'

export default function StudentPayments() {
  const navigate = useNavigate()
  
  const { data: paymentsData, isLoading: isLoadingPayments } = useQuery('payments', () =>
    api.get('/payments').then(res => res.data)
  )

  const { data: applicationsData, isLoading: isLoadingApplications } = useQuery('applications', () =>
    api.get('/applications').then(res => res.data)
  )

  const payments = paymentsData?.payments || []
  const applications = applicationsData?.applications || []
  
  // Find applications that need payment
  const pendingPayments = applications.filter(app => 
    app.status === 'verified' || app.status === 'issue_raised'
  )
  
  const isLoading = isLoadingPayments || isLoadingApplications

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      processing: 'bg-blue-100 text-blue-600',
      completed: 'bg-green-100 text-green-600',
      failed: 'bg-red-100 text-red-600',
      refunded: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || colors.pending
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-500 mt-1">View and manage your payment history</p>
      </div>

      {/* Pending Payments Section - Always Show */}
      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Make Payment</h2>
            <p className="text-sm text-gray-600 mt-1">
              {pendingPayments.length > 0 
                ? `You have ${pendingPayments.length} application${pendingPayments.length > 1 ? 's' : ''} requiring payment`
                : 'Select an application to make a payment'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
            <i className="fas fa-credit-card text-blue-600 text-xl"></i>
          </div>
        </div>

        {pendingPayments.length > 0 ? (
          <div className="space-y-3">
            {pendingPayments.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-lg p-4 border border-blue-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{app.applicationNumber}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        app.status === 'verified' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-orange-100 text-orange-600'
                      }`}>
                        {app.status === 'verified' ? 'Application Fee Due' : 'Issue Resolution Fee Due'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {app.university?.name} - {app.program}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {app.status === 'verified' 
                        ? `₹${app.university?.applicationFee?.toLocaleString('en-IN') || '0'}`
                        : '₹500'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {app.status === 'verified' 
                        ? 'Application fee required to complete submission'
                        : 'Pay to view issue details and resubmit'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/applications/${app.id}/payment`, {
                      state: { 
                        paymentType: app.status === 'verified' ? 'application_fee' : 'issue_resolution_fee'
                      }
                    })}
                    className="btn-primary ml-4 whitespace-nowrap"
                  >
                    <i className="fas fa-credit-card mr-2"></i>
                    Pay Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-6 border border-blue-200">
            <div className="text-center py-4">
              <i className="fas fa-info-circle text-blue-500 text-4xl mb-3"></i>
              <p className="text-gray-700 font-medium mb-2">No pending payments</p>
              <p className="text-sm text-gray-500 mb-4">
                {applications.length > 0 
                  ? 'All your applications are up to date. Payments will appear here when required.'
                  : 'Create an application first to make payments.'}
              </p>
              {applications.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">Or make a payment for any application:</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{app.applicationNumber}</p>
                          <p className="text-xs text-gray-500">{app.university?.name} - {app.program}</p>
                          <p className="text-xs text-gray-400 mt-1">Status: {app.status.replace('_', ' ')}</p>
                        </div>
                        <button
                          onClick={() => {
                            // Determine payment type based on status
                            let paymentType = 'application_fee'
                            if (app.status === 'issue_raised') {
                              paymentType = 'issue_resolution_fee'
                            }
                            navigate(`/applications/${app.id}/payment`, {
                              state: { paymentType }
                            })
                          }}
                          className="btn-secondary text-sm ml-3 whitespace-nowrap"
                        >
                          <i className="fas fa-credit-card mr-1"></i>
                          Pay
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {applications.length === 0 && (
                <button
                  onClick={() => navigate('/applications/new')}
                  className="btn-primary"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Application
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-credit-card text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{payments.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Transactions</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-rupee-sign text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
          <p className="text-sm text-gray-500 mt-1">Total Paid</p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
              <i className="fas fa-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {payments.filter(p => p.status === 'pending' || p.status === 'processing').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Pending</p>
        </div>
      </div>

      {/* Payments Table */}
      {payments.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Application</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600">{payment.transactionId}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-700">
                        {payment.application?.applicationNumber || 'N/A'}
                      </div>
                      {payment.application?.program && (
                        <div className="text-xs text-gray-500">{payment.application.program}</div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <i className="fas fa-credit-card text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 mb-4">No payment history yet</p>
          <p className="text-sm text-gray-400">Payments will appear here when you make transactions</p>
        </div>
      )}
    </div>
  )
}
