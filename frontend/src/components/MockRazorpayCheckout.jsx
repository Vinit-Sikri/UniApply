import { useState } from 'react'
import './MockRazorpayCheckout.css'

export default function MockRazorpayCheckout({ 
  amount, 
  currency, 
  description, 
  name, 
  email,
  onSuccess,
  onClose 
}) {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [errors, setErrors] = useState({})

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    if (errors.cardNumber) {
      setErrors({ ...errors, cardNumber: '' })
    }
  }

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value)
    setExpiry(formatted)
    if (errors.expiry) {
      setErrors({ ...errors, expiry: '' })
    }
  }

  const handleCvvChange = (e) => {
    const v = e.target.value.replace(/\D/g, '').substring(0, 3)
    setCvv(v)
    if (errors.cvv) {
      setErrors({ ...errors, cvv: '' })
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    
    if (!expiry || expiry.length < 5) {
      newErrors.expiry = 'Please enter a valid expiry date'
    } else {
      const [month, year] = expiry.split('/')
      const currentYear = new Date().getFullYear() % 100
      const currentMonth = new Date().getMonth() + 1
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = 'Invalid month'
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Card has expired'
      }
    }
    
    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Please enter CVV'
    }
    
    if (!cardName || cardName.trim().length < 2) {
      newErrors.cardName = 'Please enter cardholder name'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      // Generate mock payment response
      const mockResponse = {
        razorpay_order_id: `order_${Date.now()}`,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: `sig_${Math.random().toString(36).substring(7)}`
      }
      onSuccess(mockResponse)
    }, 2000)
  }

  return (
    <div className="mock-razorpay-overlay" onClick={onClose}>
      <div className="mock-razorpay-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mock-razorpay-header">
          <div className="mock-razorpay-logo">
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
              <path d="M10 20C10 14.477 14.477 10 20 10H30C35.523 10 40 14.477 40 20C40 25.523 35.523 30 30 30H20C14.477 30 10 25.523 10 20Z" fill="#3395FF"/>
              <path d="M50 10H60V30H50V10Z" fill="#3395FF"/>
              <path d="M70 10H80V30H70V10Z" fill="#3395FF"/>
              <text x="90" y="25" fill="#3395FF" fontSize="16" fontWeight="bold">Razorpay</text>
            </svg>
          </div>
          <button className="mock-razorpay-close" onClick={onClose}>×</button>
        </div>

        <div className="mock-razorpay-content">
          <div className="mock-razorpay-merchant">
            <div className="mock-razorpay-merchant-name">{name || 'UniApply'}</div>
            <div className="mock-razorpay-merchant-desc">{description}</div>
          </div>

          <div className="mock-razorpay-amount">
            <div className="mock-razorpay-amount-label">Amount to pay</div>
            <div className="mock-razorpay-amount-value">
              ₹{parseFloat(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mock-razorpay-form">
            <div className="mock-razorpay-field">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={handleCardNumberChange}
                maxLength="19"
                className={errors.cardNumber ? 'error' : ''}
                disabled={processing}
              />
              {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
            </div>

            <div className="mock-razorpay-field-row">
              <div className="mock-razorpay-field">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={handleExpiryChange}
                  maxLength="5"
                  className={errors.expiry ? 'error' : ''}
                  disabled={processing}
                />
                {errors.expiry && <span className="error-text">{errors.expiry}</span>}
              </div>

              <div className="mock-razorpay-field">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={handleCvvChange}
                  maxLength="3"
                  className={errors.cvv ? 'error' : ''}
                  disabled={processing}
                />
                {errors.cvv && <span className="error-text">{errors.cvv}</span>}
              </div>
            </div>

            <div className="mock-razorpay-field">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardName}
                onChange={(e) => {
                  setCardName(e.target.value)
                  if (errors.cardName) {
                    setErrors({ ...errors, cardName: '' })
                  }
                }}
                className={errors.cardName ? 'error' : ''}
                disabled={processing}
              />
              {errors.cardName && <span className="error-text">{errors.cardName}</span>}
            </div>

            <button 
              type="submit" 
              className="mock-razorpay-pay-button"
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                `Pay ₹${parseFloat(amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              )}
            </button>
          </form>

          <div className="mock-razorpay-footer">
            <div className="mock-razorpay-security">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 0L10 2H14V6L16 8V16H0V8L2 6V2H6L8 0Z" fill="#4CAF50"/>
              </svg>
              <span>Your payment is secured by Razorpay</span>
            </div>
            <div className="mock-razorpay-payment-methods">
              <span>We accept</span>
              <div className="mock-razorpay-icons">
                <span>💳</span>
                <span>🏦</span>
                <span>📱</span>
                <span>💼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

