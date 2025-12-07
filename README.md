# 🎓 UniApply - Unified University Application Portal

> A full-stack platform simplifying university applications with centralized management, AI-powered document verification, and a robust admin review system.

## 📖 Overview

**UniApply** is a unified platform designed to bridge the gap between students and universities. It allows students to apply to multiple institutions, upload documents, and track progress from a single dashboard. For administrators, it offers a powerful **two-level verification system** combining Artificial Intelligence with manual oversight to ensure authenticity and eligibility.

---

## 🚀 Key Features

### 👨‍🎓 Student Portal
* **One-Stop Dashboard:** View all applications, status updates, and notifications in one place.
* **University & Program Selection:** Browse universities and apply to specific programs (e.g., M.Tech CSE).
* **Comprehensive Application Form:** Detailed input for personal, academic, and contact information.
* **Guided Document Wizard:**
    * Dynamic list of required documents per program (Aadhar, Marksheets, etc.).
    * Single-page uploader with drag-and-drop support.
* **Real-time Status Tracking:** Track application movement from *Submitted* → *Verified* → *Final Submission*.
* **Issue Resolution:** Receive feedback on rejected documents and re-upload them directly.

### 🛡️ Admin Panel
* **Role-Based Access:** Secure login for administrators.
* **Dashboard & Analytics:** Overview of total applications, acceptance rates, and pending reviews.
* **Two-Level Verification System:**
    1.  **Level 1 (AI Automation):** Auto-verifies document quality, extracts data, and checks eligibility criteria.
    2.  **Level 2 (Manual Review):** Admins review AI-flagged issues to Accept, Reject, or Raise Issues.
* **Configuration Management:** Admins can define eligibility criteria and required documents for different programs.

---

## 🤖 AI & Verification Flow

UniApply uses an intelligent pipeline to streamline admissions:

1.  **Upload:** Student uploads PDF/Images.
2.  **Extraction:** The system (integrated with LLaMA/Gemini/OCR) extracts key fields (Name, DOB, Marks).
3.  **Comparison:** AI compares extracted data against the filled application form.
4.  **Scoring:** An eligibility score is generated.
5.  **Review:**
    * *Green Flag:* Passed AI checks.
    * *Red Flag:* Discrepancy found (sent to Admin queue).

---

## 💳 Payment Model

The platform implements a tiered payment system:

1.  **Free Tier:** Registration, Form Filling, and Document Upload are free.
2.  **Issue Resolution Fee:** If an admin raises an issue (e.g., blurry document), the student pays a nominal fee to view specific comments and resubmit.
3.  **Final Application Fee:** Once an application reaches the `VERIFIED` status, the student pays the full application fee to finalize the submission.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** Next.js (React)
* **Styling:** Tailwind CSS
* **State Management:** React Hooks / Context API
* **HTTP Client:** Axios

### Backend
* **Runtime:** Node.js
* **Framework:** Express.js / Nest.js
* **Database:** PostgreSQL (Relational Data)
* **ORM:** Sequelize / Prisma
* **Authentication:** JWT (JSON Web Tokens)
* **File Handling:** Multer
* **AI Integration:** Python Service or API calls (LLaMA/OpenAI)

### DevOps
* **Containerization:** Docker
* **Deployment:** Railway / Render / Heroku

---

## ⚙️ Local Setup Instructions

Follow these steps to set up UniApply locally.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16+)
* [PostgreSQL](https://www.postgresql.org/) (running locally or cloud)
* [Git](https://git-scm.com/)

### 1. Clone the Repository
git clone [https://github.com/Vinit-Sikri/UniApply.git](https://github.com/Vinit-Sikri/UniApply.git)
cd UniApply

cd backend
npm install

# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
# Format: postgres://username:password@localhost:5432/database_name
DATABASE_URL=postgres://postgres:password@localhost:5432/uniapply

# Security
JWT_SECRET=development_secret_key_change_me
SESSION_SECRET=development_session_secret

# AI & Upload Services (Optional for basic setup)
AI_API_KEY=your_ai_api_key

cd frontend
npm install

NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
docker-compose up --build
