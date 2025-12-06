import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function StudentSupport() {
  const [showForm, setShowForm] = useState(false)
  const queryClient = useQueryClient()
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: ticketsData, isLoading } = useQuery('tickets', () =>
    api.get('/tickets').then(res => res.data)
  )

  const tickets = ticketsData?.tickets || []

  const createTicket = useMutation(
    (data) => api.post('/tickets', data),
    {
      onSuccess: () => {
        toast.success('Support ticket created successfully')
        queryClient.invalidateQueries('tickets')
        reset()
        setShowForm(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create ticket')
      }
    }
  )

  const onSubmit = (data) => {
    createTicket.mutate(data)
  }

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-100 text-blue-600',
      in_progress: 'bg-yellow-100 text-yellow-600',
      resolved: 'bg-green-100 text-green-600',
      closed: 'bg-gray-100 text-gray-600',
    }
    return colors[status] || colors.open
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    }
    return colors[priority] || colors.medium
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
          <h1 className="text-2xl font-bold text-gray-900">Support</h1>
          <p className="text-gray-500 mt-1">Get help with your applications</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          New Ticket
        </button>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Support Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                {...register('subject', { required: 'Subject is required' })}
                className="input-field"
                placeholder="Brief description of your issue"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { required: 'Description is required' })}
                className="input-field"
                rows={4}
                placeholder="Please provide detailed information about your issue..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  {...register('category', { required: true })}
                  className="input-field"
                  defaultValue="general"
                >
                  <option value="general">General</option>
                  <option value="technical">Technical</option>
                  <option value="payment">Payment</option>
                  <option value="application">Application</option>
                  <option value="document">Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  {...register('priority', { required: true })}
                  className="input-field"
                  defaultValue="medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={createTicket.isLoading}
                className="btn-primary disabled:opacity-50"
              >
                {createTicket.isLoading ? 'Creating...' : 'Create Ticket'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  reset()
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {tickets.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Ticket #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <span className="text-sm font-mono text-gray-600">{ticket.ticketNumber}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{ticket.subject}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{ticket.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 capitalize">{ticket.category}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <i className="fas fa-comments text-gray-300 text-5xl mb-4"></i>
          <p className="text-gray-500 mb-4">No support tickets yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <i className="fas fa-plus mr-2"></i>
            Create Your First Ticket
          </button>
        </div>
      )}
    </div>
  )
}
