import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function AdminDocumentConfig() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isRequired: true,
    isActive: true
  })

  const { data, isLoading, error } = useQuery(
    ['document-types'],
    () => api.get('/admin/document-types').then(res => res.data),
    { keepPreviousData: true }
  )

  const createMutation = useMutation(
    (data) => api.post('/admin/document-types', data),
    {
      onSuccess: () => {
        toast.success('Document type created successfully')
        queryClient.invalidateQueries(['document-types'])
        setShowForm(false)
        setFormData({ name: '', description: '', isRequired: true, isActive: true })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create document type')
      }
    }
  )

  const updateMutation = useMutation(
    ({ docId, data }) => api.put(`/admin/document-types/${docId}`, data),
    {
      onSuccess: () => {
        toast.success('Document type updated successfully')
        queryClient.invalidateQueries(['document-types'])
        setEditingDoc(null)
        setFormData({ name: '', description: '', isRequired: true, isActive: true })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update document type')
      }
    }
  )

  const deleteMutation = useMutation(
    (docId) => api.delete(`/admin/document-types/${docId}`),
    {
      onSuccess: () => {
        toast.success('Document type deleted successfully')
        queryClient.invalidateQueries(['document-types'])
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete document type')
      }
    }
  )

  const documentTypes = data?.documentTypes || []

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingDoc) {
      updateMutation.mutate({ docId: editingDoc.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (doc) => {
    setEditingDoc(doc)
    setFormData({
      name: doc.name,
      description: doc.description || '',
      isRequired: doc.isRequired,
      isActive: doc.isActive
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingDoc(null)
    setFormData({ name: '', description: '', isRequired: true, isActive: true })
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
          <p className="text-red-600">Error loading document types</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Configuration</h1>
          <p className="text-gray-500 mt-1">Configure document types and requirements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Add Document Type'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDoc ? 'Edit Document Type' : 'Create New Document Type'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Aadhar Card, 10th Marksheet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Document description (optional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Required</span>
                </label>
              </div>
              <div className="flex items-center">
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
                {editingDoc ? 'Update' : 'Create'}
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

      {/* Document Types List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Description</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Required</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <i className="fas fa-file-check text-gray-300 text-5xl mb-4"></i>
                    <p className="text-gray-500">No document types found</p>
                  </td>
                </tr>
              ) : (
                documentTypes.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-gray-900">{doc.name}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-600 text-sm">{doc.description || '-'}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isRequired ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {doc.isRequired ? 'Required' : 'Optional'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        doc.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {doc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this document type?')) {
                              deleteMutation.mutate(doc.id)
                            }
                          }}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
