import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const IIT_DOCUMENTS = [
  {
    id: 'aadhar',
    name: 'Aadhar Card',
    description: 'Identity verification document',
    required: true,
    code: 'AADHAR',
    maxSize: 5242880, // 5MB
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    id: 'driving_license',
    name: 'Driver License',
    description: 'Optional secondary ID',
    required: false,
    code: 'DRIVING_LICENSE',
    maxSize: 5242880,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    id: 'tenth_marksheet',
    name: '10th Marksheet',
    description: 'Secondary education qualification',
    required: true,
    code: 'TENTH_MARKSHEET',
    maxSize: 5242880,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  },
  {
    id: 'twelfth_marksheet',
    name: '12th Marksheet',
    description: 'Higher secondary qualification',
    required: true,
    code: 'TWELFTH_MARKSHEET',
    maxSize: 5242880,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }
]

export default function DocumentUploadWizard() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const applicationId = location.state?.applicationId

  const [currentStep, setCurrentStep] = useState(0)
  const [uploadedDocs, setUploadedDocs] = useState({})
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)

  // Fetch document types from backend
  const { data: documentTypesData } = useQuery('document-types', () =>
    api.get('/documents/types').then(res => res.data.documentTypes || [])
  )

  const documentTypes = documentTypesData || []
  
  // Map IIT documents to backend document types
  const getDocumentTypeId = (docCode) => {
    const docType = documentTypes.find(dt => dt.code === docCode)
    return docType?.id
  }

  const currentDocument = IIT_DOCUMENTS[currentStep]
  const totalSteps = IIT_DOCUMENTS.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const uploadMutation = useMutation(
    async (formData) => {
      const response = await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },
    {
      onSuccess: (data) => {
        toast.success(`${currentDocument.name} uploaded successfully!`)
        setUploadedDocs(prev => ({
          ...prev,
          [currentDocument.id]: data.document
        }))
        setFile(null)
        setPreview(null)
        queryClient.invalidateQueries('documents')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to upload document')
      }
    }
  )

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!currentDocument.allowedTypes.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload PDF, JPEG, or PNG file.')
      return
    }

    // Validate file size
    if (selectedFile.size > currentDocument.maxSize) {
      toast.error(`File size exceeds ${(currentDocument.maxSize / 1024 / 1024).toFixed(0)}MB limit`)
      return
    }

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first')
      return
    }

    const documentTypeId = getDocumentTypeId(currentDocument.code)
    
    if (!documentTypeId) {
      toast.error(`Document type "${currentDocument.name}" not found. Please contact administrator.`)
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('documentTypeId', documentTypeId)
    
    if (applicationId) {
      formData.append('applicationId', applicationId)
    }
    
    try {
      await uploadMutation.mutateAsync(formData)
    } catch (error) {
      console.error('Upload error:', error)
      // Error is handled by mutation onError
    } finally {
      setUploading(false)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      setFile(null)
      setPreview(null)
    } else {
      // Wizard complete
      toast.success('All documents uploaded successfully!')
      navigate('/documents')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setFile(null)
      setPreview(null)
    }
  }

  const handleSkip = () => {
    if (!currentDocument.required) {
      toast.info(`${currentDocument.name} skipped`)
      handleNext()
    }
  }

  const isUploaded = uploadedDocs[currentDocument.id] !== undefined
  const canProceed = isUploaded || (!currentDocument.required && file === null)
  const documentTypeId = getDocumentTypeId(currentDocument.code)

  // Show loading if document types not loaded
  if (documentTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading document types...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Upload Documents</h1>
          <span className="text-sm text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Document Card */}
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-file-upload text-blue-600 text-4xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentDocument.name}
          </h2>
          <p className="text-gray-600 mb-1">{currentDocument.description}</p>
          {currentDocument.required && (
            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium mt-2">
              Required
            </span>
          )}
          {!currentDocument.required && (
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium mt-2">
              Optional
            </span>
          )}
        </div>

        {/* Upload Status */}
        {isUploaded && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
              <div>
                <p className="text-green-800 font-medium">Document uploaded successfully</p>
                <p className="text-green-600 text-sm">
                  {uploadedDocs[currentDocument.id]?.originalFileName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {!isUploaded && (
          <div className="mb-6">
            <label className="block mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg border border-gray-200"
                    />
                    <p className="text-sm text-gray-600">{file?.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file?.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : file ? (
                  <div className="space-y-2">
                    <i className="fas fa-file-pdf text-red-500 text-5xl"></i>
                    <p className="text-gray-700 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <i className="fas fa-cloud-upload-alt text-gray-400 text-5xl"></i>
                    <div>
                      <p className="text-gray-700 font-medium mb-1">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-gray-500">
                        PDF, JPEG, or PNG (Max 5MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
                disabled={uploading}
              />
            </label>

            {file && (
              <div className="flex gap-3">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload mr-2"></i>
                      Upload Document
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                  }}
                  className="btn-secondary"
                  disabled={uploading}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <div>
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="btn-secondary"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
            )}
            {currentStep === 0 && (
              <button
                onClick={() => navigate('/documents')}
                className="btn-secondary"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {!currentDocument.required && !isUploaded && (
              <button
                onClick={handleSkip}
                className="btn-secondary"
              >
                Skip
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
              <i className="fas fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Document List Preview */}
      <div className="mt-6 card">
        <h3 className="font-semibold text-gray-900 mb-4">Document Checklist</h3>
        <div className="space-y-2">
          {IIT_DOCUMENTS.map((doc, index) => (
            <div
              key={doc.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index === currentStep
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {uploadedDocs[doc.id] ? (
                  <i className="fas fa-check-circle text-green-600"></i>
                ) : (
                  <i className="fas fa-circle text-gray-300"></i>
                )}
                <span className={uploadedDocs[doc.id] ? 'text-gray-700' : 'text-gray-500'}>
                  {doc.name}
                </span>
                {doc.required && (
                  <span className="text-xs text-red-600">*</span>
                )}
              </div>
              {index === currentStep && (
                <span className="text-xs text-blue-600 font-medium">Current</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

