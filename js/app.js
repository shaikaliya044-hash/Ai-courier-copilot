/**
 * AI Career Copilot - Frontend Application
 * Safe client-side logic: PDF.js extraction, local history, and server-side Gemini API dispatch.
 * No API keys are stored or exposed in this file.
 */

// Configure PDF.js worker
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Sample Test Data for Quick 1-Click Evaluation
const SAMPLE_DATA = {
  strong: {
    resume: `ALEX RIVERA
B.S. in Computer Science | University of Technology (Graduated May 2024)
Email: alex.rivera@example.com | GitHub: github.com/alexrivera-dev | Portfolio: alexrivera.dev

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python
- Frameworks & Libraries: React, Next.js, Redux Toolkit, Tailwind CSS, Node.js, Express
- Developer Tools: Git, GitHub, REST APIs, Jest, Vite, Postman, Vercel

PROJECTS:
Campus Event Hub (React, TypeScript, Tailwind, REST APIs)
- Built a responsive web app for 4,000+ university students to discover and register for campus activities.
- Implemented client-side filtering, state management with Redux, and integrated a backend REST API with axios.
- Achieved a 98/100 Lighthouse performance score by optimizing component re-renders and lazy-loading images.

DevConnect Blog Platform (Next.js, Node.js, Express)
- Created full-stack developer blog with Markdown parsing, user authentication (JWT), and responsive UI.
- Designed reusable UI component library adhering to accessibility standards (WCAG AA).

EXPERIENCE:
Web Development Intern | TechLaunch Studio (Summer 2023)
- Collaborated in an agile scrum team of 5 to migrate legacy client landing pages into modular React components.
- Wrote 25+ unit tests using Jest and React Testing Library, increasing test coverage from 60% to 85%.`,
    job: `Junior Frontend Developer (Entry-Level / New Grad)

We are seeking an ambitious Junior Frontend Developer to join our product engineering team. You will build user-facing web applications using modern JavaScript frameworks.

Responsibilities:
- Develop responsive, accessible web interfaces using React, TypeScript, and modern CSS/Tailwind.
- Collaborate with designers and backend engineers to integrate RESTful APIs.
- Write clean, maintainable code with unit tests (Jest/React Testing Library).
- Participate in code reviews and agile sprint planning.

Requirements:
- Bachelor's degree in Computer Science, Software Engineering, or related technical field (or equivalent bootcamp/projects).
- Solid foundation in JavaScript (ES6+), TypeScript, HTML5, and CSS3.
- Hands-on project experience with React and state management.
- Familiarity with Git version control and REST APIs.
- Eagerness to learn and strong communication skills.`
  },

  partial: {
    resume: `JORDAN CHEN
B.S. in Information Systems | State University (Graduated Dec 2023)
Contact: jordan.chen@example.com | LinkedIn: linkedin.com/in/jordan-chen

TECHNICAL PROFICIENCIES:
- Languages: Python, SQL (PostgreSQL), Java
- Frameworks: Django, Flask
- Tools: Git, Docker basics, Linux shell, Tableau

ACADEMIC PROJECTS:
Student Attendance Tracking System (Python, Django, SQLite)
- Engineered backend relational database schema for student attendance tracking.
- Created CRUD API endpoints and simple server-rendered HTML templates.
- Configured automated database backups with Python scripts.

E-Commerce Sales Data Pipeline (Python, Pandas, PostgreSQL)
- Processed 50,000+ customer transaction rows using Pandas and cleaned missing data.
- Built interactive dashboard visualizations with Tableau for university business analytics showcase.`,
    job: `Junior Full Stack Developer (React & Node.js)

Looking for an entry-level engineer to help build our cloud SaaS platform.

Responsibilities:
- Build modular React frontend components with TypeScript.
- Develop backend microservices in Node.js/Express with MongoDB.
- Write unit tests and maintain CI/CD pipelines.

Requirements:
- Degree in CS, IS, or equivalent experience.
- Strong knowledge of modern JavaScript (ES6+) and React.
- Experience with Node.js and REST APIs.
- Understanding of databases and version control.`
  },

  weak: {
    resume: `SAMANTHA REED
B.A. in Hospitality & Tourism Management (Graduated 2023)
Phone: 555-0199 | Location: Chicago, IL

EXPERIENCE:
Guest Relations Lead | Grand View Resort (2022 - Present)
- Supervised front desk staff of 8, resolved customer billing disputes, and scheduled bookings.
- Managed inventory ordering and vendor communications.
- Conducted staff onboarding training on customer service standards.

Event Coordinator Assistant (2021 - 2022)
- Organized banquet logistics and seating charts for 100+ guest wedding parties.
- Handled budget spreadsheets and event timeline schedules.

SKILLS:
Customer service, Microsoft Office (Excel, Word), Hotel PMS Software, Event Planning, Team Leadership.`,
    job: `Junior C++ Systems Software Engineer

Seeking an entry-level systems programmer to work on high-performance network storage engines.

Requirements:
- B.S. in Computer Science or Computer Engineering.
- Strong understanding of C++, memory management, pointers, multi-threading, and POSIX systems.
- Knowledge of OS internals, file systems, and Linux kernel programming.
- Familiarity with gdb debugging and Valgrind memory profiling.`
  }
};

// DOM Elements
const form = document.getElementById('analyzerForm');
const resumeTextarea = document.getElementById('resumeText');
const jobTextarea = document.getElementById('jobDescription');
const resumeCharCount = document.getElementById('resumeCharCount');
const jobCharCount = document.getElementById('jobCharCount');
const analyzeBtn = document.getElementById('analyzeBtn');
const clearBtn = document.getElementById('clearBtn');

// File upload elements
const pdfFileInput = document.getElementById('pdfFileInput');
const pdfDropzone = document.getElementById('pdfDropzone');
const pdfStatus = document.getElementById('pdfStatus');

// Results elements
const resultsPlaceholder = document.getElementById('resultsPlaceholder');
const resultsLoading = document.getElementById('resultsLoading');
const resultsError = document.getElementById('resultsError');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const errorTip = document.getElementById('errorTip');
const resultsContent = document.getElementById('resultsContent');
const resultActions = document.getElementById('resultActions');
const copyReportBtn = document.getElementById('copyReportBtn');

// Report fields
const scoreGauge = document.getElementById('scoreGauge');
const atsScoreValue = document.getElementById('atsScoreValue');
const scoreBadge = document.getElementById('scoreBadge');
const matchSummary = document.getElementById('matchSummary');
const matchingSkillsList = document.getElementById('matchingSkillsList');
const missingKeywordsList = document.getElementById('missingKeywordsList');
const strengthsList = document.getElementById('strengthsList');
const improvementsList = document.getElementById('improvementsList');
const rewrittenBullet = document.getElementById('rewrittenBullet');

// History Drawer elements
const historyToggleBtn = document.getElementById('historyToggleBtn');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyDrawer = document.getElementById('historyDrawer');
const historyBackdrop = document.getElementById('historyBackdrop');
const historyList = document.getElementById('historyList');
const historyCount = document.getElementById('historyCount');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Sample Buttons
const sampleStrongBtn = document.getElementById('sampleStrongBtn');
const samplePartialBtn = document.getElementById('samplePartialBtn');
const sampleWeakBtn = document.getElementById('sampleWeakBtn');

// Current cached active report for clipboard export
let currentReportData = null;

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  setupCharacterCounters();
  setupSampleLoaders();
  setupPdfUpload();
  setupHistory();
  setupClipboardCopy();
  setupFormSubmission();
});

// Character Counters
function setupCharacterCounters() {
  const updateCounts = () => {
    resumeCharCount.textContent = `${resumeTextarea.value.length.toLocaleString()} characters`;
    jobCharCount.textContent = `${jobTextarea.value.length.toLocaleString()} characters`;
  };
  resumeTextarea.addEventListener('input', updateCounts);
  jobTextarea.addEventListener('input', updateCounts);
  updateCounts();
}

// Sample Loaders
function setupSampleLoaders() {
  const loadSample = (type) => {
    const sample = SAMPLE_DATA[type];
    if (!sample) return;
    resumeTextarea.value = sample.resume;
    jobTextarea.value = sample.job;
    resumeTextarea.dispatchEvent(new Event('input'));
    jobTextarea.dispatchEvent(new Event('input'));
    clearError();
  };

  sampleStrongBtn.addEventListener('click', () => loadSample('strong'));
  samplePartialBtn.addEventListener('click', () => loadSample('partial'));
  sampleWeakBtn.addEventListener('click', () => loadSample('weak'));

  clearBtn.addEventListener('click', () => {
    resumeTextarea.value = '';
    jobTextarea.value = '';
    resumeTextarea.dispatchEvent(new Event('input'));
    jobTextarea.dispatchEvent(new Event('input'));
    clearError();
    resetResultsView();
  });
}

// PDF Resume Upload & In-Browser Extraction via PDF.js
function setupPdfUpload() {
  const handlePdfFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showPdfStatus('Please select a valid PDF document (.pdf).', 'error');
      return;
    }

    if (!window.pdfjsLib) {
      showPdfStatus('PDF processing library is loading or blocked. Please paste resume text directly.', 'error');
      return;
    }

    showPdfStatus(`Extracting text from "${file.name}"...`, 'loading');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
      }

      const trimmed = fullText.trim();
      if (!trimmed || trimmed.length < 40) {
        showPdfStatus(
          'Warning: Very little text could be extracted. This PDF might be an image/scanned document. For best results, paste selectable text.',
          'error'
        );
        return;
      }

      resumeTextarea.value = trimmed;
      resumeTextarea.dispatchEvent(new Event('input'));
      showPdfStatus(`Extracted ${pdf.numPages} page(s) (${trimmed.length.toLocaleString()} chars) from "${file.name}".`, 'success');
    } catch (err) {
      console.error('PDF Extraction Error:', err);
      showPdfStatus(`Failed to extract text from PDF: ${err.message || 'Corrupted or protected file.'}`, 'error');
    }
  };

  pdfFileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    handlePdfFile(file);
  });

  // Drag and drop events
  ['dragenter', 'dragover'].forEach(eventName => {
    pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      pdfDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    pdfDropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      pdfDropzone.classList.remove('dragover');
    });
  });

  pdfDropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files && dt.files[0];
    if (file) handlePdfFile(file);
  });
}

function showPdfStatus(message, type) {
  pdfStatus.className = `pdf-status ${type}`;
  pdfStatus.textContent = message;
  pdfStatus.classList.remove('hidden');
}

// XSS-Safe Sanitizer
function escapeHTML(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Form Submission & API Request
function setupFormSubmission() {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const resumeText = resumeTextarea.value.trim();
    const jobDescription = jobTextarea.value.trim();

    if (!resumeText) {
      showError('Missing Resume', 'Please provide your resume text or upload a PDF before running the analysis.');
      resumeTextarea.focus();
      return;
    }

    if (!jobDescription) {
      showError('Missing Job Description', 'Please provide the target entry-level job description to evaluate against.');
      jobTextarea.focus();
      return;
    }

    if (resumeText.length < 50) {
      showError('Resume Too Short', 'Please enter a substantive resume (minimum 50 characters) including skills, education, or projects.');
      return;
    }

    if (jobDescription.length < 30) {
      showError('Job Description Too Short', 'Please enter a substantive job description (minimum 30 characters).');
      return;
    }

    // Set UI to loading state
    setLoadingState(true);

    try {
      // Dispatch to secure server-side endpoint.
      // Notice: The browser never receives or possesses the Gemini API Key.
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeText,
          jobDescription
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const errorMsg = data?.error || `Server responded with status ${response.status} (${response.statusText})`;
        const tipMsg = data?.tip || (response.status === 404 ? 'Verify that /api/analyze is deployed as a serverless function.' : '');
        showError('Analysis Failed', errorMsg, tipMsg);
        setLoadingState(false);
        return;
      }

      if (!data || typeof data !== 'object') {
        showError('Invalid Server Response', 'The server returned an empty or unparseable response.');
        setLoadingState(false);
        return;
      }

      // Validate required JSON keys from Gemini
      const validationError = validateAnalysisData(data);
      if (validationError) {
        showError('Incomplete Analysis Data', `The AI response was missing expected fields: ${validationError}`);
        setLoadingState(false);
        return;
      }

      // Render results safely
      currentReportData = data;
      renderAnalysisReport(data);

      // Save to localStorage history
      saveToHistory({
        id: 'analysis_' + Date.now(),
        timestamp: new Date().toISOString(),
        ats_score: data.ats_score,
        jobSnippet: jobDescription.substring(0, 120) + (jobDescription.length > 120 ? '...' : ''),
        report: data
      });

    } catch (err) {
      console.error('Fetch error:', err);
      showError(
        'Connection Error',
        `Could not reach the server endpoint (/api/analyze). If running locally, ensure you are serving via Vercel CLI (vercel dev) or your local Node backend.`,
        `Details: ${err.message}`
      );
    } finally {
      setLoadingState(false);
    }
  });
}

// Validate required response schema
function validateAnalysisData(d) {
  const missing = [];
  if (typeof d.ats_score !== 'number' || isNaN(d.ats_score)) missing.push('ats_score (number)');
  if (typeof d.match_summary !== 'string') missing.push('match_summary (string)');
  if (!Array.isArray(d.matching_skills)) missing.push('matching_skills (array)');
  if (!Array.isArray(d.missing_keywords)) missing.push('missing_keywords (array)');
  if (!Array.isArray(d.strengths)) missing.push('strengths (array)');
  if (!Array.isArray(d.improvements)) missing.push('improvements (array)');
  if (typeof d.rewritten_bullet !== 'string') missing.push('rewritten_bullet (string)');
  
  return missing.length > 0 ? missing.join(', ') : null;
}

// Render Results Safely with XSS Protection
function renderAnalysisReport(data) {
  // Score & Gauge
  const score = Math.max(0, Math.min(100, Math.round(data.ats_score)));
  atsScoreValue.textContent = score;

  scoreGauge.classList.remove('high', 'medium', 'low');
  scoreBadge.classList.remove('badge-success', 'badge-warning', 'badge-danger');

  if (score >= 75) {
    scoreGauge.classList.add('high');
    scoreBadge.classList.add('badge-success');
    scoreBadge.textContent = 'Strong Match';
  } else if (score >= 50) {
    scoreGauge.classList.add('medium');
    scoreBadge.classList.add('badge-warning');
    scoreBadge.textContent = 'Moderate Match';
  } else {
    scoreGauge.classList.add('low');
    scoreBadge.classList.add('badge-danger');
    scoreBadge.textContent = 'Needs Alignment';
  }

  // Match Summary
  matchSummary.textContent = data.match_summary;

  // Matching Skills
  matchingSkillsList.innerHTML = '';
  if (data.matching_skills.length === 0) {
    matchingSkillsList.innerHTML = '<span class="pill-none">No direct technical skill overlaps detected.</span>';
  } else {
    data.matching_skills.forEach(skill => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = skill;
      matchingSkillsList.appendChild(pill);
    });
  }

  // Missing Keywords
  missingKeywordsList.innerHTML = '';
  if (data.missing_keywords.length === 0) {
    missingKeywordsList.innerHTML = '<span class="pill-none">No critical keywords missing!</span>';
  } else {
    data.missing_keywords.forEach(kw => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.textContent = `+ ${kw}`;
      missingKeywordsList.appendChild(pill);
    });
  }

  // Strengths
  strengthsList.innerHTML = '';
  data.strengths.forEach(str => {
    const li = document.createElement('li');
    li.textContent = str;
    strengthsList.appendChild(li);
  });

  // Improvements
  improvementsList.innerHTML = '';
  data.improvements.forEach(imp => {
    const li = document.createElement('li');
    li.textContent = imp;
    improvementsList.appendChild(li);
  });

  // Rewritten Bullet
  rewrittenBullet.textContent = data.rewritten_bullet;

  // Show results view
  resultsPlaceholder.classList.add('hidden');
  resultsLoading.classList.add('hidden');
  resultsError.classList.add('hidden');
  resultsContent.classList.remove('hidden');
  resultActions.style.display = 'flex';

  // Smooth scroll into results on mobile
  if (window.innerWidth < 1024) {
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
  }
}

// UI State Management
function setLoadingState(isLoading) {
  if (isLoading) {
    analyzeBtn.disabled = true;
    analyzeBtn.querySelector('.btn-text').textContent = 'Analyzing...';
    resultsPlaceholder.classList.add('hidden');
    resultsError.classList.add('hidden');
    resultsContent.classList.add('hidden');
    resultsLoading.classList.remove('hidden');
  } else {
    analyzeBtn.disabled = false;
    analyzeBtn.querySelector('.btn-text').textContent = 'Analyze with Gemini';
    resultsLoading.classList.add('hidden');
  }
}

function showError(title, message, tip = '') {
  errorTitle.textContent = title;
  errorMessage.textContent = message;
  if (tip) {
    errorTip.textContent = tip;
    errorTip.classList.remove('hidden');
  } else {
    errorTip.classList.add('hidden');
  }
  resultsError.classList.remove('hidden');
  resultsPlaceholder.classList.add('hidden');
  resultsLoading.classList.add('hidden');
}

function clearError() {
  resultsError.classList.add('hidden');
}

function resetResultsView() {
  resultsContent.classList.add('hidden');
  resultActions.style.display = 'none';
  resultsError.classList.add('hidden');
  resultsLoading.classList.add('hidden');
  resultsPlaceholder.classList.remove('hidden');
  currentReportData = null;
}

// Copy to Clipboard
function setupClipboardCopy() {
  copyReportBtn.addEventListener('click', async () => {
    if (!currentReportData) return;
    const textReport = `AI CAREER COPILOT - ATS RESUME ANALYSIS REPORT
==================================================
ATS Score: ${currentReportData.ats_score}/100

Match Summary:
${currentReportData.match_summary}

Matching Skills:
${currentReportData.matching_skills.map(s => `- ${s}`).join('\n')}

Missing Keywords:
${currentReportData.missing_keywords.map(k => `- ${k}`).join('\n')}

Candidate Strengths:
${currentReportData.strengths.map(s => `- ${s}`).join('\n')}

Actionable Improvements:
${currentReportData.improvements.map(i => `- ${i}`).join('\n')}

Rewritten Bullet (Google XYZ Formula):
"${currentReportData.rewritten_bullet}"
==================================================`;

    try {
      await navigator.clipboard.writeText(textReport);
      const originalText = copyReportBtn.innerHTML;
      copyReportBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyReportBtn.innerHTML = originalText;
      }, 2000);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  });
}

// LocalStorage Analysis History (Extra Credit)
const STORAGE_KEY = 'career_copilot_analysis_history';

function setupHistory() {
  historyToggleBtn.addEventListener('click', () => toggleHistoryDrawer(true));
  closeHistoryBtn.addEventListener('click', () => toggleHistoryDrawer(false));
  historyBackdrop.addEventListener('click', () => toggleHistoryDrawer(false));

  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete all saved analysis history?')) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistoryList();
    }
  });

  renderHistoryList();
}

function toggleHistoryDrawer(open) {
  if (open) {
    historyDrawer.classList.add('open');
    historyBackdrop.classList.add('active');
    historyDrawer.setAttribute('aria-hidden', 'false');
  } else {
    historyDrawer.classList.remove('open');
    historyBackdrop.classList.remove('active');
    historyDrawer.setAttribute('aria-hidden', 'true');
  }
}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error parsing stored history, resetting:', err);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

function saveToHistory(item) {
  try {
    const list = getStoredHistory();
    // Keep most recent 15 reports
    list.unshift(item);
    if (list.length > 15) list.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    renderHistoryList();
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

function renderHistoryList() {
  const history = getStoredHistory();
  historyCount.textContent = history.length;

  historyList.innerHTML = '';
  if (history.length === 0) {
    historyList.innerHTML = '<div class="history-empty">No analyses saved yet. Analyze a resume to see history here.</div>';
    return;
  }

  history.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'history-item';

    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Recent';

    const score = item.ats_score ?? 0;
    const scoreColorClass = score >= 75 ? 'badge-success' : (score >= 50 ? 'badge-warning' : 'badge-danger');

    div.innerHTML = `
      <div class="history-item-top">
        <span class="badge ${scoreColorClass}">${score}/100 ATS</span>
        <span class="history-item-time">${escapeHTML(dateStr)}</span>
      </div>
      <div class="history-item-snippet">${escapeHTML(item.jobSnippet || 'Target Job Analysis')}</div>
      <div class="history-item-actions">
        <button class="btn btn-secondary btn-sm load-history-btn">View Report</button>
        <button class="btn btn-outline btn-sm delete-history-btn text-danger">Delete</button>
      </div>
    `;

    div.querySelector('.load-history-btn').addEventListener('click', () => {
      if (item.report) {
        currentReportData = item.report;
        renderAnalysisReport(item.report);
        toggleHistoryDrawer(false);
      }
    });

    div.querySelector('.delete-history-btn').addEventListener('click', () => {
      deleteHistoryItem(index);
    });

    historyList.appendChild(div);
  });
}

function deleteHistoryItem(index) {
  const history = getStoredHistory();
  if (index >= 0 && index < history.length) {
    history.splice(index, 1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error(e);
    }
    renderHistoryList();
  }
}
