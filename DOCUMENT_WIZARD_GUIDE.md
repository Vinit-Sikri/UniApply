# Document Upload Wizard Guide

## ✅ What Was Created

A **guided step-by-step document upload wizard** that asks for each document separately.

## 🎯 Features

### Step-by-Step Process
1. **Aadhar Card** (Required) - Identity verification
2. **Driver License** (Optional) - Secondary ID
3. **10th Marksheet** (Required) - Secondary education
4. **12th Marksheet** (Required) - Higher secondary education

### Wizard Features
- ✅ Progress bar showing current step
- ✅ One document at a time
- ✅ File preview (for images)
- ✅ File validation (type and size)
- ✅ Skip option for optional documents
- ✅ Previous/Next navigation
- ✅ Document checklist showing progress
- ✅ Upload status for each document

## 🚀 How to Use

### Access the Wizard

1. **From Documents Page:**
   - Go to "My Documents"
   - Click "Guided Upload Wizard" button

2. **Direct URL:**
   - Navigate to: `/documents/upload-wizard`

### Using the Wizard

1. **Step 1: Aadhar Card**
   - Click the upload area
   - Select your Aadhar card file (PDF, JPEG, or PNG)
   - Click "Upload Document"
   - Wait for success message
   - Click "Next"

2. **Step 2: Driver License** (Optional)
   - Upload if you have it
   - Or click "Skip" to move to next
   - Click "Next"

3. **Step 3: 10th Marksheet**
   - Upload your 10th marksheet
   - Click "Next"

4. **Step 4: 12th Marksheet**
   - Upload your 12th marksheet
   - Click "Finish"

### Navigation

- **Previous**: Go back to previous document
- **Next**: Move to next document (only if required doc is uploaded)
- **Skip**: Skip optional documents
- **Cancel**: Exit wizard (from first step)

## 📋 Document Checklist

The wizard shows a checklist on the right side:
- ✅ Green checkmark = Document uploaded
- ⚪ Gray circle = Not uploaded yet
- **Current** = Currently active step

## ✅ Document Types Seeded

The following document types are now in your database:
- Aadhar Card
- Driver License
- 10th Marksheet
- 12th Marksheet
- Graduation Certificate
- Passport

## 🎨 UI Features

- **Progress Bar**: Visual indicator of completion
- **File Preview**: See image files before uploading
- **File Info**: Shows file name and size
- **Status Messages**: Clear feedback on upload status
- **Required/Optional Badges**: Clear indication of requirements

## 🔧 Technical Details

- File size limit: 5MB per document
- Allowed formats: PDF, JPEG, PNG
- Automatic file validation
- Error handling with user-friendly messages
- Integration with backend document types

## 🎉 Ready to Use!

The wizard is fully functional. Just:
1. Go to "My Documents"
2. Click "Guided Upload Wizard"
3. Follow the step-by-step process!


