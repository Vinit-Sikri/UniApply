import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminFAQs() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order: 0,
    isActive: true
  })

  const { data, isLoading, error } = useQuery(
    ['admin-faqs'],
    () => api.get('/faqs').then(res => res.data),
    { keepPreviousData: true }
  )

  const createMutation = useMutation(
    (data) => api.post('/faqs', data),
    {
      onSuccess: () => {
        toast.success('FAQ created successfully')
        queryClient.invalidateQueries(['admin-faqs'])
        setShowForm(false)
        setFormData({ question: '', answer: '', category: 'general', order: 0, isActive: true })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create FAQ')
      }
    }
  )

  const updateMutation = useMutation(
    ({ faqId, data }) => api.put(`/faqs/${faqId}`, data),
    {
      onSuccess: () => {
        toast.success('FAQ updated successfully')
        queryClient.invalidateQueries(['admin-faqs'])
        setEditingFaq(null)
        setFormData({ question: '', answer: '', category: 'general', order: 0, isActive: true })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update FAQ')
      }
    }
  )

  const deleteMutation = useMutation(
    (faqId) => api.delete(`/faqs/${faqId}`),
    {
      onSuccess: () => {
        toast.success('FAQ deleted successfully')
        queryClient.invalidateQueries(['admin-faqs'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete FAQ')
      }
    }
  )

  const faqs = data?.faqs || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingFaq) {
      updateMutation.mutate({ faqId: editingFaq.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (faq) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingFaq(null)
    setFormData({ question: '', answer: '', category: 'general', order: 0, isActive: true })
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
          <p className="text-red-600">Error loading FAQs</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
          <p className="text-gray-500 mt-1">Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add FAQ'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter question"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter answer"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General</option>
                  <option value="application">Application</option>
                  <option value="payment">Payment</option>
                  <option value="document">Document</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isLoading || updateMutation.isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="card">
        <div className="space-y-4">
          {faqs.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-question-circle text-gray-300 text-5xl mb-4"></i>
              <p className="text-gray-500">No FAQs found</p>
            </div>
          ) : (
            faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        faq.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                        {faq.category}
                      </span>
                    </div>
                    <p className="text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Views: {faq.views || 0} • Order: {faq.order}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(faq)}
                      className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this FAQ?')) {
                          deleteMutation.mutate(faq.id)
                        }
                      }}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
