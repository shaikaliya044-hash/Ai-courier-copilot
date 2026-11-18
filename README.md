# AI Career Copilot 🚀
### Intelligent Resume Analyzer & ATS Optimization Engine for Fresh Tech Graduates

An AI-powered web application designed specifically for college graduates and entry-level candidates applying to software engineering and technology positions. It analyzes candidate resumes against job descriptions, computes an ATS match score, identifies keyword gaps, spotlights transferable academic projects, and suggests impact-oriented bullet point rewrites using Google's XYZ formula.

---

## 📑 Table of Contents
- [Architecture & Security Overview](#-architecture--security-overview)
- [Key Features](#-key-features)
- [Extra Credit Features](#-extra-credit-features)
- [System Prompt & Prompt Defense](#-system-prompt--prompt-defense)
- [Fictional Evaluation Test Cases](#-fictional-evaluation-test-cases)
- [Local Development Setup](#-local-development-setup)
- [Deploying to Vercel](#-deploying-to-vercel)
- [Pushing to GitHub](#-pushing-to-github)
- [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🔒 Architecture & Security Overview

### Why Client-Side API Keys are Dangerous
Many starter tutorials mistakenly advise placing the Gemini API key directly into `index.html` or client-side JavaScript. **This exposes your secret API key to anyone who opens browser Developer Tools or inspects page network traffic.** Attackers can steal your API key, exhaust your quota, and rack up charges.

### The Secure Solution: Serverless Proxy Architecture
In this project, the browser client **never** receives or handles the Gemini API key. All AI analysis requests are routed through a serverless backend function:

```
[ Browser Client ]
  │
  ├── 1. Uploads PDF or pastes resume & job description
  ├── 2. POST /api/analyze (JSON payload: { resumeText, jobDescription })
  ▼
[ Vercel Serverless Function: api/analyze.js ]
  │
  ├── Reads process.env.GEMINI_API_KEY from secure server environment
  ├── Validates payload & sanitizes inputs
  ├── Delimits untrusted inputs against prompt injection
  ├── Calls Google Gemini 1.5 Flash (v1beta JSON mode)
  ▼
[ Google Gemini API ]
  │
  └── Returns structured JSON
  ▲
[ api/analyze.js ]
  │
  ├── Validates JSON schema (ats_score, matching_skills, etc.)
  ├── Strips any residual markdown fences
  └── Sends sanitized JSON back to client
  ▼
[ Browser Client ]
  └── Safely renders report into DOM using textContent & escapeHTML()
```

---

## ✨ Key Features

1. **Fresh Graduate ATS Calibration**:
   - Accounts for academic coursework, senior capstone projects, open-source repositories, and student hackathons rather than demanding 5+ years of corporate tenure.
2. **Structured Analysis Output**:
   - `ats_score` (0–100 integer)
   - `match_summary` (concise fit overview)
   - `matching_skills` (verified skills in both resume and job)
   - `missing_keywords` (critical ATS gaps)
   - `strengths` (concrete highlights from real candidate data)
   - `improvements` (actionable advice for entry-level candidates)
   - `rewritten_bullet` (rewritten using Google's XYZ formula: *Accomplished [X] as measured by [Y] by doing [Z]*)
3. **Prompt Injection & Untrusted Input Shielding**:
   - Treats resume and job description text as raw, untrusted data wrapped in distinct delimiters.
   - Explicit instructions in the system prompt prevent jailbreaks and role reversals.
   - Forbids hallucination of fake metrics or unearned skills.
4. **Resilient Error Handling**:
   - Handles HTTP 400 (missing fields, payload limits), HTTP 429 (rate limits), HTTP 500/502 (Gemini service issues or invalid API keys).

---

## 🌟 Extra Credit Features

### 1. In-Browser PDF Resume Upload (`pdfjs-dist`)
- Upload or drag-and-drop `.pdf` resumes directly into the browser.
- Uses Mozilla's PDF.js to extract text client-side before submission.
- Extracted text automatically populates the editable resume textarea so the user can review and edit it.
- Detects scanned/image-only PDFs and provides a helpful warning prompt.

### 2. Local Analysis History (`localStorage`)
- Saves past analyses locally in the browser with ATS score badges and timestamped role summaries.
- Slide-over history drawer allows users to review previous reports or delete them one-by-one or all at once.
- Handles corrupted storage data gracefully with automatic reset fallbacks.
- Stores zero secrets or API keys.

### 3. One-Click Sample Presets
- Quick buttons to load pre-built test scenarios (**Strong Match**, **Partial Match**, **Weak Match**) for fast testing and grading.

---

## 🧪 System Prompt & Prompt Defense

The system prompt is housed in [api/analyze.js](file:///c:/Users/ELCOT/Desktop/Resume%20Analyzer/api/analyze.js):

- **Role**: AI Career Copilot for entry-level tech candidates.
- **Untrusted Input Policy**: Disallows any prompt overrides or instructions contained within candidate text.
- **No Hallucination**: Never invents credentials or metrics not present in candidate input.
- **Strict JSON Enforcement**: Enforces Gemini `responseMimeType: "application/json"` and validates the returned keys.

---

## 📊 Fictional Evaluation Test Cases

The project includes five complete fictional test cases in [tests/test-cases.json](file:///c:/Users/ELCOT/Desktop/Resume%20Analyzer/tests/test-cases.json):

| Test Case | Candidate Profile | Target Entry-Level Role | Expected ATS Range | Key Feedback Expected |
|---|---|---|---|---|
| **Case 1: Strong Match** | CS Graduate with React, TypeScript, Next.js, and web dev internship | Junior Frontend Developer | 80–95 | Highlights real-world internship and Lighthouse performance; suggests highlighting collaborative code reviews. |
| **Case 2: Partial Match** | IS Graduate with Python, Django, and PostgreSQL | Junior Full Stack Dev (React/Node) | 50–68 | Notes strong database/API core; flags React/Node stack gap; recommends porting frontend to React. |
| **Case 3: Missing Required Skills** | IT Helpdesk Graduate with basic Linux and active directory | Junior Cloud DevOps Engineer | 30–48 | Acknowledges networking/troubleshooting; flags missing Docker, Kubernetes, Terraform, and CI/CD. |
| **Case 4: Transferable Experience** | Applied Mathematics / Stats Graduate with Python & data modeling | Junior BI / Data Analyst | 65–78 | Recognizes strong statistical foundation and 1.2M row capstone; flags SQL depth and Power BI/Tableau. |
| **Case 5: Weak Match** | Hospitality & Tourism Management Graduate | Junior C++ Systems Software Engineer | 10–25 | Flags total absence of C++, memory management, and CS fundamentals; suggests fundamental CS coursework. |

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- A free Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Configure Environment
```bash
# Copy the environment template
copy .env.example .env.local
```
Open `.env.local` and set your key:
```ini
GEMINI_API_KEY=AIzaSyYourActualGeminiKeyHere
```

### 2. Run the Local Server
You can run the built-in development server (zero external npm dependencies required):
```bash
node server.js
```
Or, if you have Vercel CLI installed:
```bash
npx vercel dev
```

Open `http://localhost:3000` in your browser.

### 3. Run Automated Verification Tests
```bash
powershell -ExecutionPolicy Bypass -File .\tests\verify-app.ps1
```

---

## 🚀 Deploying to Vercel

Vercel provides native zero-config deployment for static assets with `/api` serverless functions.

### Step-by-Step Instructions:
1. **Push your code to GitHub** (see next section).
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New...** > **Project**.
4. Import your GitHub repository (`Resume-Analyzer` or `ai-career-copilot`).
5. In the **Configure Project** screen:
   - Framework Preset: **Other** (or Leave default)
   - Root Directory: `./`
6. Expand the **Environment Variables** section:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `Your_Gemini_API_Key_From_Google_AI_Studio`
   - Click **Add**.
7. Click **Deploy**.
8. Once deployment finishes, test the live URL. Your API key will remain securely stored in Vercel's encrypted environment variables.

---

## 🐙 Pushing to GitHub

Ensure `.env` or `.env.local` is never committed (it is already in `.gitignore`).

```bash
# 1. Initialize git repository
git init

# 2. Stage files
git add .

# 3. Verify no secrets are staged (should only show code and configs, no .env)
git status

# 4. Commit
git commit -m "feat: complete AI career copilot with serverless Gemini endpoint and PDF support"

# 5. Set main branch and link your GitHub remote
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git

# 6. Push
git push -u origin main
```

---

## ❓ Troubleshooting & FAQ

- **Error: "GEMINI_API_KEY is not configured on the server."**
  - **On Vercel**: Ensure you added `GEMINI_API_KEY` in Project Settings > Environment Variables, and triggered a redeployment.
  - **Locally**: Ensure `.env.local` exists in the project root with `GEMINI_API_KEY=...`.
- **Error: "Gemini API rate limit exceeded (429)."**
  - The free tier of Gemini has a per-minute request ceiling. Wait 30–60 seconds before making another request.
- **PDF Upload says "Very little text could be extracted":**
  - Scanned PDF resumes are stored as flat raster images. PDF.js extracts text from selectable PDF documents. If the PDF is scanned, paste the resume text into the textarea directly.
