// frontend/src/lib/pdfParser.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CandidateFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  currentRole: string;
  experience: string;
  totalExperienceYears: number;
  qualification: string;
  qualificationDetail: string;
  skills: string[];
  expectedSalaryMonthly: number;
  noticePeriod: 'IMMEDIATE' | '15_DAYS' | '30_DAYS' | 'SERVING_NOTICE';
  consentToShareProfile: boolean;
  resumeSummary?: string;
  resumeParsedText?: string;
  resumeFile?: string;
}

export const DEFAULT_CANDIDATE: CandidateFormData = {
  name: '',
  phone: '',
  email: '',
  city: 'Surat',
  locality: '',
  currentRole: '',
  experience: 'Fresher',
  totalExperienceYears: 0,
  qualification: '12th Pass',
  qualificationDetail: '',
  skills: [],
  expectedSalaryMonthly: 15000,
  noticePeriod: 'IMMEDIATE',
  consentToShareProfile: true,
};

/**
 * Extract full plain text from PDF File using pdfjs-dist dynamically (SSR safe)
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  
  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str || '')
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

export const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'React.js', 'Node.js', 'Express', 'MongoDB',
  'SQL', 'MySQL', 'Python', 'Java', 'HTML', 'CSS', 'Tailwind', 'PHP', 'Laravel',
  'Flutter', 'Android', 'iOS', 'UI/UX', 'Figma', 'Graphic Design', 'Photoshop',
  'Telecalling', 'Customer Support', 'BPO', 'Inside Sales', 'Field Sales', 'Business Development',
  'Lead Generation', 'Digital Marketing', 'SEO', 'Content Writing', 'Social Media',
  'Tally', 'Tally Prime', 'Accounting', 'GST', 'MS Excel', 'Advanced Excel', 'Data Entry',
  'Office Administration', 'Operations', 'Recruitment', 'HR', 'Hindi', 'Gujarati', 'English',
];

export const COMMON_CITIES = [
  'Surat', 'Ahmedabad', 'Vadodara', 'Rajkot', 'Navsari', 'Vapi', 'Valsad',
  'Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Delhi', 'Noida', 'Gurugram',
  'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Jaipur', 'Indore'
];

/**
 * Fast Rule-Based Scraper (Client-Side, zero API cost)
 */
export function scrapeCandidateDataFromText(rawText: string): CandidateFormData {
  const text = rawText.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // 1. Phone extraction (10-digit Indian mobile)
  let phone = '';
  const phoneRegex = /(?:(?:\+91|91|0)?[ -]?)?([6-9]\d{9})/g;
  const phoneMatch = phoneRegex.exec(text);
  if (phoneMatch && phoneMatch[1]) {
    phone = phoneMatch[1];
  }

  // 2. Email extraction
  let email = '';
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  const emailMatch = text.match(emailRegex);
  if (emailMatch && emailMatch[1]) {
    email = emailMatch[1].toLowerCase();
  }

  // 3. Name heuristic (look at top 5 lines, skip lines with phone or email)
  let name = '';
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    if (
      line.length >= 3 &&
      line.length <= 40 &&
      !line.includes('@') &&
      !/\d{5,}/.test(line) &&
      !/curriculum|resume|biodata|profile|page \d/i.test(line)
    ) {
      name = line.replace(/[^a-zA-Z\s.]/g, '').trim();
      if (name.split(' ').length >= 1 && name.length >= 3) break;
    }
  }
  if (!name && email) {
    name = email.split('@')[0].replace(/[._0-9]/g, ' ').trim();
  }

  // 4. City matching
  let city = 'Surat';
  for (const c of COMMON_CITIES) {
    const cityRegex = new RegExp(`\\b${c}\\b`, 'i');
    if (cityRegex.test(text)) {
      city = c;
      break;
    }
  }

  // 5. Skills extraction
  const detectedSkills: string[] = [];
  for (const s of COMMON_SKILLS) {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillRegex = new RegExp(`(?:^|[\\s,;|/(])${escaped}(?:$|[\\s,;|/)\\]])`, 'i');
    if (skillRegex.test(text)) {
      if (!detectedSkills.includes(s)) {
        detectedSkills.push(s);
      }
    }
  }

  // 6. Experience
  let experience = 'Fresher';
  let totalExperienceYears = 0;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)\s*(?:of\s*)?exp/i) ||
                   text.match(/experience\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*(?:\+)?\s*(?:years?|yrs?)/i);
  if (expMatch && expMatch[1]) {
    const yrs = parseFloat(expMatch[1]);
    totalExperienceYears = Math.round(yrs);
    if (yrs >= 5) experience = '5+ Years';
    else if (yrs >= 3) experience = '3-5 Years';
    else if (yrs >= 1) experience = '1-3 Years';
    else experience = 'Less than 1 Year';
  } else if (/fresher|entry level|graduate trainee/i.test(text)) {
    experience = 'Fresher';
    totalExperienceYears = 0;
  }

  // 7. Qualification
  let qualification = '12th Pass';
  if (/m\.tech|mba|mca|m\.sc|m\.com|post graduate|master/i.test(text)) {
    qualification = 'Post Graduate';
  } else if (/b\.tech|b\.e\.|bca|b\.sc|b\.com|bba|graduate|bachelor/i.test(text)) {
    qualification = 'Graduate';
  } else if (/diploma/i.test(text)) {
    qualification = 'Diploma';
  } else if (/12th|hsc|higher secondary/i.test(text)) {
    qualification = '12th Pass';
  } else if (/10th|ssc/i.test(text)) {
    qualification = '10th Pass';
  }

  // 8. Current role / Title
  let currentRole = '';
  const roleKeywords = [
    'Software Engineer', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
    'MERN Stack Developer', 'PHP Developer', 'Python Developer', 'React Developer',
    'Telecaller', 'Telecaller Executive', 'Customer Care Executive', 'Customer Support',
    'Sales Executive', 'Business Development Executive', 'BDE', 'Field Sales Executive',
    'Accountant', 'Senior Accountant', 'Accounts Executive', 'Tally Operator',
    'Graphic Designer', 'UI/UX Designer', 'Digital Marketing Executive', 'SEO Executive',
    'Office Assistant', 'Receptionist', 'HR Executive', 'Recruiter'
  ];

  for (const r of roleKeywords) {
    const rRegex = new RegExp(`\\b${r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (rRegex.test(text)) {
      currentRole = r;
      break;
    }
  }

  return {
    name: name || 'Candidate',
    phone: phone || '',
    email: email || '',
    city: city || 'Surat',
    locality: '',
    currentRole: currentRole || (detectedSkills.length > 0 ? `${detectedSkills[0]} Executive` : 'Job Seeker'),
    experience,
    totalExperienceYears,
    qualification,
    qualificationDetail: '',
    skills: detectedSkills.slice(0, 15),
    expectedSalaryMonthly: totalExperienceYears > 3 ? 30000 : totalExperienceYears > 1 ? 20000 : 15000,
    noticePeriod: 'IMMEDIATE',
    consentToShareProfile: true,
    resumeSummary: text.slice(0, 250).replace(/\s+/g, ' ').trim(),
    resumeParsedText: text.slice(0, 4000),
  };
}

/**
 * AI-Powered Parsing with Gemini (if API Key provided)
 */
export async function parseWithGemini(rawText: string, apiKey: string): Promise<CandidateFormData> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are a recruitment ATS resume parser. Extract candidate details from the following resume text into a strict JSON object.
  Fields to return in JSON:
  {
    "name": string (full name),
    "phone": string (10 digits Indian mobile number without +91 or spaces),
    "email": string (lowercase email),
    "city": string (e.g. Surat, Ahmedabad, Mumbai, etc.),
    "locality": string (optional area/neighborhood),
    "currentRole": string (e.g. Telecaller Executive, MERN Developer, Sales Executive),
    "experience": string (One of: "Fresher", "Less than 1 Year", "1-3 Years", "3-5 Years", "5+ Years"),
    "totalExperienceYears": number (years of experience as integer),
    "qualification": string (One of: "10th Pass", "12th Pass", "Diploma", "Graduate", "Post Graduate"),
    "qualificationDetail": string (degree name like B.Com, BCA, B.Tech),
    "skills": array of strings (top 5 to 15 relevant technical or soft skills),
    "expectedSalaryMonthly": number (reasonable expected monthly salary in INR),
    "noticePeriod": string ("IMMEDIATE", "15_DAYS", "30_DAYS", or "SERVING_NOTICE"),
    "resumeSummary": string (concise 1-2 sentence professional overview)
  }

  Resume Text:
  """
  ${rawText.slice(0, 8000)}
  """
  Output ONLY valid raw JSON without markdown code fences or backticks.`;

  const response = await model.generateContent(prompt);
  const textResponse = response.response.text();
  const cleaned = textResponse.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(cleaned);

  const fallback = scrapeCandidateDataFromText(rawText);

  return {
    ...fallback,
    ...parsed,
    phone: String(parsed.phone || fallback.phone).replace(/\D/g, '').slice(-10),
    consentToShareProfile: true,
    resumeParsedText: rawText.slice(0, 4000),
  };
}
