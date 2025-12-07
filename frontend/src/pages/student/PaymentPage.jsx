import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function PaymentPage() {
  const { applicationId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const paymentType = location.state?.paymentType || 'application_fee'
  const queryClient = useQueryClient()
  
  const [processing, setProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const { data: applicationData } = useQuery(
    ['application', applicationId],
    () => api.get(`/applications/${applicationId}`).then(res => res.data.application),
    { enabled: !!applicationId }
  )

  const application = applicationData

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      setRazorpayLoaded(true)
    }
    script.onerror = () => {
      toast.error('Failed to load Razorpay. Please refresh the page.')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  // Debug log
  useEffect(() => {
    if (application) {
      console.log('Application data loaded:', {
        id: application.id,
        status: application.status,
        university: application.university,
        applicationFee: application.university?.applicationFee
      })
    }
  }, [application])

  const verifyMutation = useMutation(
    (data) => api.post('/payments/verify', data),
    {
      onSuccess: () => {
        toast.success('Payment successful!')
        queryClient.invalidateQueries(['application', applicationId])
        queryClient.invalidateQueries(['admin-applications'])
        navigate(`/applications/${applicationId}`)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Payment verification failed')
      }
    }
  )

  const handlePayment = async () => {
    if (!application) {
      toast.error('Application not found')
      return
    }

    if (!razorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...')
      return
    }

    // Validate application status before payment
    if (paymentType === 'application_fee' && application.status !== 'verified') {
      toast.error('Application must be verified before making payment. Current status: ' + application.status, {
        duration: 5000
      })
      return
    }

    if (paymentType === 'issue_resolution_fee' && application.status !== 'issue_raised') {
      toast.error('No issue raised for this application. Current status: ' + application.status, {
        duration: 5000
      })
      return
    }

    // Determine amount based on payment type
    let amount = 0
    if (paymentType === 'application_fee') {
      amount = parseFloat(application.university?.applicationFee || 0)
    } else if (paymentType === 'issue_resolution_fee') {
      amount = 500 // Issue resolution fee (can be configured)
    }

    if (amount <= 0) {
      toast.error('Invalid payment amount')
      return
    }

    setProcessing(true)

    try {
      // Create payment order
      const response = await api.post('/payments/create-order', {
        applicationId: application.id,
        amount: amount,
        paymentType: paymentType
      })

      const { orderId, key, paymentId } = response.data

      // Initialize Razorpay checkout
      const options = {
        key: key,
        amount: response.data.amount, // Amount in paise
        currency: response.data.currency || 'INR',
        name: 'UniApply',
        description: paymentType === 'application_fee' 
          ? `Application Fee for ${application.university?.name}`
          : 'Issue Resolution Fee',
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            await verifyMutation.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: paymentId
            })
          } catch (error) {
            console.error('Payment verification error:', error)
            toast.error('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: `${application.student?.firstName} ${application.student?.lastName}`,
          email: application.student?.email || '',
          contact: application.student?.phone || ''
        },
        theme: {
          color: '#3395FF'
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            toast.info('Payment cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', function (response) {
        setProcessing(false)
        toast.error('Payment failed: ' + (response.error.description || 'Unknown error'))
      })
      
      razorpay.open()
      setProcessing(false)
    } catch (error) {
      setProcessing(false)
      console.error('Payment initiation error:', error)
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Failed to initiate payment')
    }
  }


  if (!application) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if application is verified for application fee payment
  const canMakePayment = paymentType === 'application_fee' 
    ? application.status === 'verified'
    : application.status === 'issue_raised'

  const amount = paymentType === 'application_fee' 
    ? parseFloat(application.university?.applicationFee || 0)
    : 500

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-credit-card text-blue-600 text-4xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {paymentType === 'application_fee' ? 'Application Fee Payment' : 'Issue Resolution Fee'}
          </h1>
          <p className="text-gray-600">
            {paymentType === 'application_fee' 
              ? 'Complete your application by paying the application fee'
              : 'Pay to view issue details and resubmit your application'}
          </p>
        </div>

        {/* Application Details */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Application Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Application Number:</span>
              <span className="font-medium text-gray-900">{application.applicationNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">University:</span>
              <span className="font-medium text-gray-900">{application.university?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Program:</span>
              <span className="font-medium text-gray-900">{application.program}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium px-2 py-1 rounded text-xs ${
                application.status === 'verified' 
                  ? 'bg-green-100 text-green-700'
                  : application.status === 'issue_raised'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {application.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {paymentType === 'application_fee' ? 'Application Fee' : 'Issue Resolution Fee'}:
              </span>
              <span className="text-2xl font-bold text-gray-900">₹{amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">₹{amount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Status Warning */}
        {!canMakePayment && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-xl mt-1"></i>
              <div>
                <p className="text-yellow-800 font-medium mb-1">
                  {paymentType === 'application_fee' 
                    ? 'Application Not Verified'
                    : 'No Issue Raised'}
                </p>
                <p className="text-yellow-700 text-sm">
                  {paymentType === 'application_fee' 
                    ? `Your application status is "${application.status}". Please wait for admin verification before making payment.`
                    : `Your application status is "${application.status}". An issue must be raised before you can pay the resolution fee.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="space-y-4">
          <button
            onClick={handlePayment}
            disabled={processing || amount <= 0 || !canMakePayment || !razorpayLoaded}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!razorpayLoaded ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading Payment Gateway...
              </>
            ) : processing ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Processing...
              </>
            ) : !canMakePayment ? (
              <>
                <i className="fas fa-lock mr-2"></i>
                Payment Not Available
              </>
            ) : (
              <>
                <i className="fas fa-lock mr-2"></i>
                Pay Securely with Razorpay
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            <i className="fas fa-shield-alt mr-2"></i>
            Your payment is secured by Razorpay
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Payment Methods Accepted</h4>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Credit Card</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Debit Card</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Net Banking</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">UPI</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-700">Wallet</span>
          </div>
        </div>
      </div>

    </div>
  )
}
