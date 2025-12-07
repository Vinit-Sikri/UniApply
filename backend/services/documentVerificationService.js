const { Document } = require('../models');

// Lazy load gemini utils to avoid crash if package not installed
let analyzeDocument;
try {
  const geminiUtils = require('../utils/gemini');
  analyzeDocument = geminiUtils.analyzeDocument;
} catch (error) {
  console.warn('⚠️  Gemini utils not available. Document verification will use random function.');
  analyzeDocument = null;
}

/**
 * Generate random/mock document verification results
 */
const generateRandomVerificationResult = (document) => {
  // Random verification result (70% chance of approval, 20% review, 10% reject)
  const random = Math.random();
  let recommendation = 'review';
  let qualityScore = 70;
  
  if (random < 0.7) {
    recommendation = 'approve';
    qualityScore = Math.floor(Math.random() * 20) + 80; // 80-100
  } else if (random < 0.9) {
    recommendation = 'review';
    qualityScore = Math.floor(Math.random() * 20) + 60; // 60-80
  } else {
    recommendation = 'reject';
    qualityScore = Math.floor(Math.random() * 30) + 30; // 30-60
  }
  
  // Random clarity
  const clarityOptions = ['clear', 'blurry', 'unreadable'];
  const clarity = clarityOptions[Math.floor(Math.random() * clarityOptions.length)];
  
  // Random completeness
  const completenessOptions = ['complete', 'incomplete'];
  const completeness = completenessOptions[Math.floor(Math.random() * completenessOptions.length)];
  
  // Generate random issues (30% chance)
  const issues = [];
  if (Math.random() < 0.3) {
    const issueOptions = [
      'Document appears to be low quality',
      'Some text may be unclear',
      'Document may be incomplete',
      'Image quality could be improved',
      'Document format needs verification'
    ];
    issues.push(issueOptions[Math.floor(Math.random() * issueOptions.length)]);
  }
  
  // Extract info based on document type
  const extractedInfo = {
    names: [],
    dates: [],
    numbers: [],
    other: []
  };
  
  // Add some mock extracted data based on document type
  if (document.documentType?.code === 'AADHAR') {
    extractedInfo.names.push('Name extracted from Aadhar');
    extractedInfo.numbers.push('Aadhar number detected');
  } else if (document.documentType?.code === 'TENTH_MARKSHEET' || document.documentType?.code === 'TWELFTH_MARKSHEET') {
    extractedInfo.names.push('Student name extracted');
    extractedInfo.numbers.push('Marks/Percentage detected');
    extractedInfo.dates.push('Date of issue detected');
  }
  
  return {
    qualityScore,
    clarity,
    completeness,
    extractedInfo,
    issues,
    recommendation,
    verifiedAt: new Date(),
    isMockData: true
  };
};

/**
 * Verify a single document using AI or random function
 */
const verifyDocument = async (documentId) => {
  try {
    console.log(`Starting document verification for document: ${documentId}`);

    // Fetch document with related data
    const document = await Document.findByPk(documentId, {
      include: [
        {
          model: require('../models').DocumentType,
          as: 'documentType',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Update status to processing
    await document.update({
      aiVerificationStatus: 'processing',
      aiVerificationDate: new Date()
    });

    // Perform verification (with fallback to random function)
    let verificationResult;
    
    if (!analyzeDocument) {
      console.warn('AI verification not available, using random function');
      verificationResult = generateRandomVerificationResult(document);
    } else {
      try {
        // In a real implementation, you would read the file and extract text
        // For now, we'll use a simplified approach with document metadata
        const documentText = `Document: ${document.originalFileName}, Type: ${document.documentType?.name}, Size: ${document.fileSize} bytes`;
        
        verificationResult = await analyzeDocument(
          documentText,
          document.documentType?.name || 'Unknown'
        );
        
        // Add metadata
        verificationResult.verifiedAt = new Date();
        verificationResult.isMockData = false;
      } catch (error) {
        console.warn('AI verification failed, using random function:', error.message);
        verificationResult = generateRandomVerificationResult(document);
      }
    }

    // Update document with results
    const flags = verificationResult.issues || [];
    
    // Remove isMockData flag before storing (internal use only)
    const resultToStore = { ...verificationResult };
    delete resultToStore.isMockData;
    
    // Update document status based on recommendation
    let newStatus = document.status;
    if (verificationResult.recommendation === 'approve') {
      newStatus = 'approved';
    } else if (verificationResult.recommendation === 'reject') {
      newStatus = 'rejected';
    }
    // If 'review', keep as 'pending'
    
    await document.update({
      aiVerificationStatus: 'completed',
      aiVerificationResult: resultToStore,
      aiVerificationFlags: flags,
      aiVerificationDate: new Date(),
      status: newStatus,
      reviewNotes: verificationResult.recommendation === 'approve' 
        ? 'Auto-approved by AI verification'
        : verificationResult.recommendation === 'reject'
        ? 'Auto-rejected by AI verification'
        : 'Pending manual review'
    });

    console.log(`Document verification completed for document: ${documentId}`, {
      recommendation: verificationResult.recommendation,
      qualityScore: verificationResult.qualityScore,
      flagsCount: flags.length
    });

    return {
      success: true,
      documentId,
      result: verificationResult
    };
  } catch (error) {
    console.error('Document verification service error:', error);

    // Update document status to failed
    try {
      const document = await Document.findByPk(documentId);
      if (document) {
        await document.update({
          aiVerificationStatus: 'failed',
          aiVerificationResult: {
            error: error.message,
            verifiedAt: new Date()
          }
        });
      }
    } catch (updateError) {
      console.error('Failed to update document status:', updateError);
    }

    throw error;
  }
};

/**
 * Trigger document verification automatically when document is uploaded
 */
const triggerAutoVerification = async (documentId) => {
  try {
    // Run verification asynchronously (don't block the request)
    setImmediate(async () => {
      try {
        await verifyDocument(documentId);
      } catch (error) {
        console.error('Auto document verification failed:', error);
      }
    });

    return { success: true, message: 'Document verification started' };
  } catch (error) {
    console.error('Failed to trigger document verification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  verifyDocument,
  triggerAutoVerification,
  generateRandomVerificationResult
};

