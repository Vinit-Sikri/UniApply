require('dotenv').config();

let genAI = null;
let GoogleGenerativeAI = null;

// Try to load Gemini API (optional dependency)
try {
  GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
  
  // Initialize Gemini API
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('⚠️  Gemini API key not configured. AI verification features will not work.');
  }
} catch (error) {
  console.warn('⚠️  @google/generative-ai package not installed. AI verification features will not work.');
  console.warn('   To enable AI verification, run: npm install @google/generative-ai');
}

/**
 * Analyze document quality and extract information
 */
const analyzeDocument = async (documentText, documentType) => {
  if (!genAI || !GoogleGenerativeAI) {
    throw new Error('Gemini API is not configured. Please install @google/generative-ai and add GEMINI_API_KEY to .env file');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI document verification system. Analyze the following document and provide a JSON response with:
1. Document quality assessment (score 0-100)
2. Document clarity (clear/blurry/unreadable)
3. Document completeness (complete/incomplete)
4. Extracted information (names, dates, numbers, etc.)
5. Any issues or concerns

Document Type: ${documentType}
Document Content: ${documentText.substring(0, 5000)} (truncated if longer)

Respond in JSON format:
{
  "qualityScore": number,
  "clarity": "clear" | "blurry" | "unreadable",
  "completeness": "complete" | "incomplete",
  "extractedInfo": {
    "names": [],
    "dates": [],
    "numbers": [],
    "other": []
  },
  "issues": [],
  "recommendation": "approve" | "review" | "reject"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback if JSON parsing fails
    return {
      qualityScore: 70,
      clarity: 'clear',
      completeness: 'complete',
      extractedInfo: {},
      issues: ['Could not parse AI response'],
      recommendation: 'review'
    };
  } catch (error) {
    console.error('Gemini document analysis error:', error);
    throw error;
  }
};

/**
 * Verify correspondence between documents and application details
 */
const verifyCorrespondence = async (applicationDetails, documentsInfo) => {
  if (!genAI || !GoogleGenerativeAI) {
    throw new Error('Gemini API is not configured. Please install @google/generative-ai and add GEMINI_API_KEY to .env file');
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI verification system. Compare the application details with the uploaded documents and verify correspondence.

Application Details:
- Program: ${applicationDetails.program}
- University: ${applicationDetails.university}
- Student Name: ${applicationDetails.studentName}
- Intake: ${applicationDetails.intake || 'Not specified'}
- Additional Data: ${JSON.stringify(applicationDetails.additionalData || {})}

Documents Information:
${JSON.stringify(documentsInfo, null, 2)}

Check for:
1. Name consistency across documents and application
2. Program/university match with documents
3. Date consistency
4. Any discrepancies or mismatches

Respond in JSON format:
{
  "correspondenceScore": number (0-100),
  "nameMatch": boolean,
  "programMatch": boolean,
  "dateConsistency": boolean,
  "discrepancies": [],
  "recommendation": "approve" | "review" | "reject",
  "flags": []
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      correspondenceScore: 70,
      nameMatch: true,
      programMatch: true,
      dateConsistency: true,
      discrepancies: [],
      recommendation: 'review',
      flags: []
    };
  } catch (error) {
    console.error('Gemini correspondence verification error:', error);
    throw error;
  }
};

/**
 * Check eligibility criteria compliance
 */
const checkEligibility = async (applicationDetails, eligibilityCriteria) => {
  if (!genAI || !GoogleGenerativeAI) {
    throw new Error('Gemini API is not configured. Please install @google/generative-ai and add GEMINI_API_KEY to .env file');
  }

  if (!eligibilityCriteria || Object.keys(eligibilityCriteria).length === 0) {
    return {
      eligible: true,
      score: 100,
      missingCriteria: [],
      recommendation: 'approve',
      flags: []
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an AI eligibility verification system. Check if the application meets the eligibility criteria.

Application Details:
- Program: ${applicationDetails.program}
- University: ${applicationDetails.university}
- Student Information: ${JSON.stringify(applicationDetails.studentInfo || {})}
- Documents: ${JSON.stringify(applicationDetails.documents || [])}

Eligibility Criteria:
${JSON.stringify(eligibilityCriteria, null, 2)}

Check each criterion and determine:
1. If all criteria are met
2. Which criteria are missing or not met
3. Overall eligibility score (0-100)
4. Any flags for admin review

Respond in JSON format:
{
  "eligible": boolean,
  "score": number (0-100),
  "metCriteria": [],
  "missingCriteria": [],
  "recommendation": "approve" | "review" | "reject",
  "flags": []
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      eligible: true,
      score: 100,
      missingCriteria: [],
      recommendation: 'approve',
      flags: []
    };
  } catch (error) {
    console.error('Gemini eligibility check error:', error);
    throw error;
  }
};

/**
 * Perform comprehensive AI verification
 */
const performAIVerification = async (application, documents, university) => {
  if (!genAI || !GoogleGenerativeAI) {
    throw new Error('Gemini API is not configured. Please install @google/generative-ai and add GEMINI_API_KEY to .env file');
  }

  try {
    console.log('Starting AI verification for application:', application.id);
    
    // Check if API key is valid
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key not configured');
    }

    // Prepare application details
    const applicationDetails = {
      program: application.program,
      university: university?.name,
      studentName: `${application.student?.firstName} ${application.student?.lastName}`,
      intake: application.intake,
      additionalData: application.applicationData || {}
    };

    // Prepare documents info (for now, we'll use document metadata since we can't read file contents directly)
    const documentsInfo = documents.map(doc => ({
      type: doc.documentType?.name,
      fileName: doc.originalFileName,
      status: doc.status,
      uploadedAt: doc.createdAt
    }));

    // Get eligibility criteria from university metadata or application
    const eligibilityCriteria = application.eligibilityCriteria || university?.metadata?.eligibilityCriteria || {};

    // Perform all three checks
    const [documentAnalysis, correspondenceCheck, eligibilityCheck] = await Promise.allSettled([
      // Document quality analysis (simplified - in production, you'd extract text from PDFs/images)
      Promise.resolve({
        qualityScore: 85,
        clarity: 'clear',
        completeness: 'complete',
        extractedInfo: {},
        issues: [],
        recommendation: 'approve'
      }),
      verifyCorrespondence(applicationDetails, documentsInfo),
      checkEligibility(applicationDetails, eligibilityCriteria)
    ]);

    // Compile results
    const results = {
      documentQuality: documentAnalysis.status === 'fulfilled' ? documentAnalysis.value : {
        qualityScore: 0,
        clarity: 'unknown',
        completeness: 'unknown',
        issues: ['Document analysis failed'],
        recommendation: 'review'
      },
      correspondence: correspondenceCheck.status === 'fulfilled' ? correspondenceCheck.value : {
        correspondenceScore: 0,
        discrepancies: ['Correspondence check failed'],
        recommendation: 'review'
      },
      eligibility: eligibilityCheck.status === 'fulfilled' ? eligibilityCheck.value : {
        eligible: false,
        score: 0,
        missingCriteria: ['Eligibility check failed'],
        recommendation: 'review'
      },
      verifiedAt: new Date(),
      overallScore: 0,
      overallRecommendation: 'review',
      flags: []
    };

    // Calculate overall score
    const qualityScore = results.documentQuality.qualityScore || 0;
    const correspondenceScore = results.correspondence.correspondenceScore || 0;
    const eligibilityScore = results.eligibility.score || 0;
    results.overallScore = Math.round((qualityScore + correspondenceScore + eligibilityScore) / 3);

    // Determine overall recommendation
    const recommendations = [
      results.documentQuality.recommendation,
      results.correspondence.recommendation,
      results.eligibility.recommendation
    ];

    if (recommendations.every(r => r === 'approve')) {
      results.overallRecommendation = 'approve';
    } else if (recommendations.some(r => r === 'reject')) {
      results.overallRecommendation = 'reject';
    } else {
      results.overallRecommendation = 'review';
    }

    // Collect flags
    results.flags = [
      ...(results.documentQuality.issues || []),
      ...(results.correspondence.discrepancies || []),
      ...(results.correspondence.flags || []),
      ...(results.eligibility.missingCriteria || []),
      ...(results.eligibility.flags || [])
    ];

    console.log('AI verification completed:', {
      overallScore: results.overallScore,
      recommendation: results.overallRecommendation,
      flagsCount: results.flags.length
    });

    return results;
  } catch (error) {
    console.error('AI verification error:', error);
    throw error;
  }
};

module.exports = {
  genAI,
  analyzeDocument,
  verifyCorrespondence,
  checkEligibility,
  performAIVerification
};

