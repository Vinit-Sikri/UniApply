import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function StudentDocuments() {
  const queryClient = useQueryClient()

  const { data: documentsData, isLoading } = useQuery('documents', () =>
    api.get('/documents').then(res => res.data)
  )

  const documents = documentsData?.documents || []

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-600',
      approved: 'bg-green-100 text-green-600',
      rejected: 'bg-red-100 text-red-600',
    }
    return colors[status] || colors.pending
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
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500 mt-1">Upload and manage your application documents</p>
        </div>
        <Link
          to="/documents/upload-wizard"
          className="btn-primary"
        >
          <i className="fas fa-upload mr-2"></i>
          Quick Upload
        </Link>
      </div>

      {documents.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Document Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <i className="fas fa-file-pdf text-red-500"></i>
                        <span className="font-medium text-gray-900">{doc.originalFileName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-gray-700">{doc.documentType?.name || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <i className="fas fa-upload text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 mb-4">No documents uploaded yet</p>
          <Link
            to="/documents/upload-wizard"
            className="btn-primary inline-block"
          >
            <i className="fas fa-upload mr-2"></i>
            Quick Upload
          </Link>
        </div>
      )}
    </div>
  )
}
