# 🌐 SoT Command Center

A comprehensive Next.js application for the Summer of Tech Command Center, featuring AI-powered student and employer management tools.

## 🌍 Live Demo

**🔗 [View Live Application](https://sot-command-center.vercel.app/)**


## 🤖 AI Integration

This application uses **OpenAI GPT-4** for advanced AI features:

- **Student Validator**: AI-powered profile analysis and validation
- **Job Enhancer**: AI-enhanced job descriptions and suggestions
- **Matchmaking**: AI-powered student-employer matching
- **Document Analysis**: AI analysis of CVs and academic records

## 🔐 Test Login Credentials

For development and testing purposes, you can use these credentials:

- **Email**: `hello@yun-xu.com`
- **Password**: `password123`

## 🚀 Features

### **1. Dashboard**

- 📊 Real-time metrics: active students, approved profiles, live job postings
- ⚠️ Alerts & tasks: pending student approvals, employer job ads needing review
- 🔍 Quick access to all major sections
- 📈 Program health overview with key statistics

### **2. Student Management**

- 👥 Complete student profile management
- 📄 Document upload and AI analysis (CVs and academic records)
- ✅ Profile validation and approval workflow
- 🔍 Search and filter capabilities
- 📊 Student eligibility checking

### **3. Employer Management**

- 🏢 Employer profile management
- 📝 Company information and contact details
- 🔍 Search and filter capabilities
- 📊 Employer engagement tracking

### **4. Job Posting Management**

- 💼 Job posting creation and management
- ✍️ AI-enhanced job descriptions
- 📈 Job quality scoring and analysis
- ✅ Approval workflow for job postings
- 🔍 Search and filter by skills, location, etc.

### **5. AI Student Profile Validator**

- ✅ Automated profile completeness checks
- 📄 Document analysis (CV and academic records)
- 🧑‍⚖️ Manual approval/rejection with AI recommendations
- 🔄 Bulk approval capabilities
- 📊 AI scoring and detailed feedback

### **6. AI Job Enhancer**

- ✍️ AI-powered job description improvements
- 📈 Quality scoring and bias detection
- 🎯 Skill mapping and requirement optimization
- ✅ Approval workflow with AI suggestions
- 🔄 Bulk processing capabilities

### **7. AI Matchmaking**

- 🤝 Smart student-employer matching based on skills and preferences
- 📊 AI-generated compatibility scores
- 🔄 Bulk match generation
- 📋 Match management and tracking

### **8. Analytics & Reports**

- 📊 Comprehensive analytics dashboard
- 📈 Program performance metrics
- 🔍 Detailed filtering and data exploration
- 📑 Student, employer, and job posting statistics

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript
- **Deployment**: Vercel


## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── ai/                # AI-powered tools
│   │   ├── student-validator/
│   │   ├── job-enhancer/
│   │   └── matchmaking/
│   ├── analytics/         # Analytics dashboard
│   ├── students/         # Student Management
│   ├── employers/        # Employer Management
│   ├── jobs/             # Job Posting Management
│   ├── login/            # Authentication
│   └── api/              # API routes
│       ├── analyze-document/
│       ├── send-email/
│       └── students/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard-specific components
│   ├── forms/           # Form components
│   └── layout/          # Layout components
├── lib/                 # Utility functions and services
│   ├── supabase.ts      # Supabase client configuration
│   ├── data-services.ts # Data access layer
│   ├── auth-utils.ts    # Authentication utilities
│   ├── eligibility-utils.ts # Student eligibility logic
│   ├── pdf-utils.ts     # PDF processing utilities
│   └── email-service.ts # Email functionality
└── types/               # TypeScript type definitions
    └── database.ts      # Database schema types
```
