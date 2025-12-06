import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function StudentNewApplication() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const { data: universitiesData, isLoading: isLoadingUniversities } = useQuery('universities', () =>
    api.get('/universities').then(res => res.data)
  )

  const universities = universitiesData?.universities || []

  const createApplication = useMutation(
    (data) => api.post('/applications', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('applications')
        toast.success('Application created successfully')
        navigate('/applications')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create application')
      }
    }
  )

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Ensure universityId is properly formatted
      const payload = {
        universityId: data.universityId,
        program: data.program,
        intake: data.intake || null
      }
      console.log('Submitting application:', payload)
      await createApplication.mutateAsync(payload)
    } catch (error) {
      console.error('Application creation error:', error)
      // Error is handled by mutation onError
    } finally {
      setLoading(false)
    }
  }

  if (isLoadingUniversities) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Loading universities...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Application</h1>
        <p className="text-gray-500 mt-1">Create a new university application</p>
      </div>

      {universities.length === 0 && (
        <div className="card bg-yellow-50 border-2 border-yellow-200">
          <p className="text-yellow-800">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            No universities available. Please contact administrator.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University *
            </label>
            <select
              {...register('universityId', { required: 'University is required' })}
              className="input-field"
            >
              <option value="">Select a university</option>
              {universities?.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))}
            </select>
            {errors.universityId && (
              <p className="mt-1 text-sm text-red-600">{errors.universityId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program *
            </label>
            <input
              type="text"
              {...register('program', { required: 'Program is required' })}
              className="input-field"
              placeholder="e.g., M.Tech Computer Science"
            />
            {errors.program && (
              <p className="mt-1 text-sm text-red-600">{errors.program.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intake
            </label>
            <input
              type="text"
              {...register('intake')}
              className="input-field"
              placeholder="e.g., Fall 2024"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Application'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

