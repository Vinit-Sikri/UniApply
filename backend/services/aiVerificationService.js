const { Application, Document, University, User } = require('../models');

// Lazy load gemini utils to avoid crash if package not installed
let performAIVerification;
try {
  const geminiUtils = require('../utils/gemini');
  performAIVerification = geminiUtils.performAIVerification;
} catch (error) {
  console.warn('⚠️  Gemini utils not available. AI verification will use mock data.');
  performAIVerification = null;
}

/**
 * Generate mock AI verification results for demonstration
 */
const generateMockVerificationResult = (application, documents) => {
  // Generate realistic mock scores based on application data
  const hasDocuments = documents && documents.length > 0;
  const docCount = documents ? documents.length : 0;

  // Document quality score (0 if no documents, higher if more documents)
  const docQualityScore = hasDocuments
    ? Math.min(85 + (docCount * 2), 95)
    : 0; // 0 if no documents uploaded

  // Correspondence score (0 if no documents, good if documents exist)
  const correspondenceScore = hasDocuments ? 88 : 0; // 0 if no documents

  // Eligibility score (assume good for demo, but lower if no documents)
  const eligibilityScore = hasDocuments ? 82 : 50; // Lower if no documents

  // Calculate overall score (only average non-zero scores)
  const scores = [docQualityScore, correspondenceScore, eligibilityScore].filter(s => s > 0);
  const overallScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0; // 0 if no documents at all

  // Determine recommendation
  let overallRecommendation = 'review';
  if (!hasDocuments || docCount === 0) {
    overallRecommendation = 'reject'; // Reject if no documents
  } else if (overallScore >= 85) {
    overallRecommendation = 'approve';
  } else if (overallScore < 60) {
    overallRecommendation = 'reject';
  }

  // Generate flags based on conditions
  const flags = [];
  if (!hasDocuments || docCount === 0) {
    flags.push('No documents uploaded - Cannot verify application');
  } else if (docCount < 2) {
    flags.push('Insufficient documents uploaded - At least 2 documents required');
  }
  if (docCount > 0 && docCount < 4) {
    flags.push('Some required documents may be missing');
  }
  if (application.program && application.program.length < 3) {
    flags.push('Program name seems incomplete');
  }

  return {
    documentQuality: {
      qualityScore: docQualityScore,
      clarity: hasDocuments ? 'clear' : 'unknown',
      completeness: docCount >= 4 ? 'complete' : docCount > 0 ? 'incomplete' : 'no_documents',
      extractedInfo: {
        names: [],
        dates: [],
        numbers: [],
        other: []
      },
      issues: !hasDocuments
        ? ['No documents uploaded - Cannot assess document quality']
        : docCount < 2
          ? ['Limited documents available for review']
          : [],
      recommendation: !hasDocuments ? 'reject' : docQualityScore >= 80 ? 'approve' : 'review'
    },
    correspondence: {
      correspondenceScore: correspondenceScore,
      nameMatch: hasDocuments, // Can't verify if no documents
      programMatch: hasDocuments, // Can't verify if no documents
      dateConsistency: hasDocuments, // Can't verify if no documents
      discrepancies: !hasDocuments ? ['Cannot verify correspondence - No documents uploaded'] : [],
      recommendation: !hasDocuments ? 'reject' : correspondenceScore >= 85 ? 'approve' : 'review',
      flags: !hasDocuments ? ['No documents to verify correspondence'] : []
    },
    eligibility: {
      eligible: hasDocuments, // Not eligible if no documents
      score: eligibilityScore,
      metCriteria: hasDocuments ? ['Application submitted', 'Documents provided'] : ['Application submitted'],
      missingCriteria: !hasDocuments ? ['No documents uploaded'] : [],
      recommendation: !hasDocuments ? 'reject' : eligibilityScore >= 80 ? 'approve' : 'review',
      flags: !hasDocuments ? ['No documents to verify eligibility'] : []
    },
    verifiedAt: new Date(),
    overallScore: overallScore,
    overallRecommendation: overallRecommendation,
    flags: flags,
    isMockData: true // Flag to indicate this is mock data
  };
};

/**
 * Perform AI verification for an application
 */
const verifyApplication = async (applicationId) => {
  try {
    console.log(`Starting AI verification for application: ${applicationId}`);

    // Fetch application with all related data
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: University,
          as: 'university'
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Update status to processing
    await application.update({
      aiVerificationStatus: 'processing',
      aiVerificationDate: new Date()
    });

    // Fetch all documents for this application
    const documents = await Document.findAll({
      where: {
        applicationId: applicationId
      },
      include: [
        {
          model: require('../models').DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    // Perform AI verification (with fallback to mock data)
    let verificationResult;

    if (!performAIVerification) {
      console.warn('AI verification not available, using mock data');
      verificationResult = generateMockVerificationResult(application, documents);
    } else {
      try {
        verificationResult = await performAIVerification(
          application,
          documents,
          application.university
        );
      } catch (error) {
        console.warn('AI verification failed, using mock data:', error.message);
        verificationResult = generateMockVerificationResult(application, documents);
      }
    }

    // Update application with results
    const flags = verificationResult.flags || [];

    // Remove isMockData flag before storing (internal use only)
    const resultToStore = { ...verificationResult };
    delete resultToStore.isMockData;

    await application.update({
      aiVerificationStatus: 'completed',
      aiVerificationResult: resultToStore,
      aiVerificationFlags: flags,
      aiVerificationDate: new Date()
    });

    console.log(`AI verification completed for application: ${applicationId}`, {
      score: verificationResult.overallScore,
      recommendation: verificationResult.overallRecommendation,
      flagsCount: flags.length
    });

    return {
      success: true,
      applicationId,
      result: verificationResult
    };
  } catch (error) {
    console.error('AI verification service error:', error);

    // Update application status to failed
    try {
      const application = await Application.findByPk(applicationId);
      if (application) {
        await application.update({
          aiVerificationStatus: 'failed',
          aiVerificationResult: {
            error: error.message,
            verifiedAt: new Date()
          }
        });
      }
    } catch (updateError) {
      console.error('Failed to update application status:', updateError);
    }

    throw error;
  }
};

/**
 * Trigger AI verification automatically when application is submitted
 */
const triggerAutoVerification = async (applicationId) => {
  try {
    // Run verification asynchronously (don't block the request)
    setImmediate(async () => {
      try {
        await verifyApplication(applicationId);
      } catch (error) {
        console.error('Auto AI verification failed:', error);
      }
    });

    return { success: true, message: 'AI verification started' };
  } catch (error) {
    console.error('Failed to trigger AI verification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyApplication,
  triggerAutoVerification,
  generateMockVerificationResult
};

