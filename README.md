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

## ⚠️ Current Limitations

### **Technical Limitations**

- **AI Dependency**: Relies on OpenAI API with potential rate limits and costs

### **Functional Limitations**

- **Basic Matching**: Simple rule-based matching without ML optimization
- **Manual Workflows**: Many approval processes require manual intervention
- **Fixed Workflows**: Cannot customize approval processes or workflows
- **Limited Notifications**: Basic email notifications only
- **Limited Analytics**: Basic reporting without advanced insights

### **Security Limitations**

- **Basic Authentication**: Simple email/password only, no MFA
- **Limited Encryption**: Basic data protection

## 🚀 Quick Setup

### **Prerequisites**

- Node.js 18.0+
- Supabase account (free tier available)
- OpenAI API key (required for AI features)
- Zoho Mail account (optional, for email notifications)

### **1. Environment Setup**

```bash
# Clone repository
git clone <your-repository-url>
cd Sot-Command-Center

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### **2. Environment Variables**

Create `.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration (Required for AI features)
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# Email Configuration (Optional)
ZOHO_EMAIL_USER=your_zoho_email
ZOHO_EMAIL_PASSWORD=your_zoho_password

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **3. Database Setup**

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the entire `database/schema.sql` script
3. Create storage bucket named `documents` (public)
4. Set up storage policies for document access

### **4. OpenAI Setup**

1. Get API key from [platform.openai.com](https://platform.openai.com)
2. Add to environment variables
3. Ensure sufficient credits for API usage

### **5. Start Development**

```bash
# Start development server
npm run dev

# Access application
open http://localhost:3000
```

### **6. Test Login**

- **Email**: `your-email@example.com`
- **Password**: `password123`

### **7. Production Deployment**

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **8. Create Admin User**

1. Create user in Supabase Auth with email `your-email@example.com`
2. Run SQL to link auth user to organizer:

```sql
UPDATE organizers
SET auth_user_id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com')
WHERE email = 'your-email@example.com';
```
