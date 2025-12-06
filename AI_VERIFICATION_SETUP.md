# AI Verification Setup Guide

This guide explains how to set up the two-level AI verification system for the UniApply platform.

## Overview

The platform uses a **two-level verification process**:

1. **Level 1 - AI Verification (Automatic)**: System automatically verifies documents, correspondence, and eligibility
2. **Level 2 - Manual Admin Verification**: Admin reviews applications with AI-flagged issues

## Features

### AI Verification Checks:
- ✅ **Document Quality**: Analyzes document clarity, completeness, and quality
- ✅ **Correspondence**: Verifies consistency between uploaded documents and application details
- ✅ **Eligibility Compliance**: Checks if application meets program eligibility criteria

### AI Verification Results:
- Overall score (0-100)
- Recommendation (approve/review/reject)
- Detailed flags for admin review
- Individual scores for each check

## Setup Instructions

### 1. Install Dependencies

The Gemini AI package should already be installed. If not, run:

```bash
cd backend
npm install @google/generative-ai
```

### 2. Get Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 3. Configure Environment Variable

Add the Gemini API key to your `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Or run the create-env script (it will skip if .env exists):

```bash
cd backend
npm run create-env
```

Then manually add the `GEMINI_API_KEY` to the `.env` file.

### 4. Database Migration

The Application model has been updated with AI verification fields. The database will automatically update when you restart the server (using `alter: true` in development).

If you need to manually sync:

```bash
cd backend
npm run migrate
```

## How It Works

### Automatic AI Verification

When a student submits an application:

1. Application status changes to `submitted`
2. AI verification is automatically triggered in the background
3. AI verification status changes to `processing`
4. System performs three checks:
   - Document quality analysis
   - Correspondence verification
   - Eligibility compliance check
5. Results are stored in the application record
6. AI verification status changes to `completed`

### Manual AI Verification

Admins can manually trigger AI verification:

1. Go to Admin Panel → Applications
2. Click "Review" on any application
3. In the AI Verification section, click "Start AI Verification" or "Re-run AI Verification"
4. Wait for processing to complete
5. Review the AI results and flags

### Admin Review Process

1. **View AI Results**: 
   - Overall score and recommendation
   - Detailed breakdown (Document Quality, Correspondence, Eligibility)
   - AI flags for review

2. **Review Flagged Issues**:
   - AI flags highlight potential problems
   - Admin can review each flag
   - Admin makes final decision

3. **Take Action**:
   - Verify application (if AI recommends approve)
   - Raise issue (if problems found)
   - Approve/Reject (final decision)

## API Endpoints

### Trigger AI Verification (Admin Only)

```http
POST /api/applications/:id/ai-verify
Authorization: Bearer <admin_token>
```

Response:
```json
{
  "message": "AI verification completed",
  "result": {
    "overallScore": 85,
    "overallRecommendation": "approve",
    "documentQuality": { ... },
    "correspondence": { ... },
    "eligibility": { ... },
    "flags": []
  }
}
```

## Application Model Fields

The Application model now includes:

- `aiVerificationStatus`: `pending` | `processing` | `completed` | `failed`
- `aiVerificationResult`: JSON object with detailed results
- `aiVerificationDate`: Timestamp of verification
- `aiVerificationFlags`: Array of issues flagged by AI
- `eligibilityCriteria`: JSON object with program eligibility criteria

## Admin Panel Features

### AI Verification Display

The admin review page shows:

1. **Status Badge**: Current AI verification status
2. **Overall Metrics**: Score, recommendation, flag count
3. **Detailed Breakdown**: 
   - Document Quality score and issues
   - Correspondence score and discrepancies
   - Eligibility score and missing criteria
4. **AI Flags Section**: List of all issues flagged for review
5. **Action Buttons**: Start/Re-run AI verification

### Color Coding

- 🟢 **Green**: AI recommends approve
- 🟡 **Yellow**: AI recommends review
- 🔴 **Red**: AI recommends reject
- 🔵 **Blue**: Processing

## Troubleshooting

### AI Verification Not Working

1. **Check API Key**: Ensure `GEMINI_API_KEY` is set in `.env`
2. **Check Logs**: Look for errors in backend console
3. **API Limits**: Free tier has rate limits; wait if exceeded
4. **Network Issues**: Ensure backend can reach Google's API

### AI Verification Fails

- Check backend logs for specific error messages
- Verify Gemini API key is valid
- Ensure application has documents uploaded
- Check network connectivity

### No AI Results Displayed

- Verify AI verification has been run (check status)
- Check if application has required data
- Ensure database fields are properly migrated

## Testing

### Test AI Verification

1. Create a test application
2. Upload some documents
3. Submit the application
4. Check admin panel for AI verification results
5. Or manually trigger AI verification from review page

### Expected Behavior

- AI verification should complete within 10-30 seconds
- Results should show scores and recommendations
- Flags should highlight any issues
- Admin can review and take action

## Notes

- AI verification runs asynchronously (doesn't block requests)
- Results are cached in the database
- You can re-run verification anytime
- AI recommendations are suggestions; admin makes final decision
- Eligibility criteria can be set per program/university

## Support

If you encounter issues:

1. Check backend console logs
2. Verify environment variables
3. Ensure database is properly migrated
4. Test API key directly with Gemini API

