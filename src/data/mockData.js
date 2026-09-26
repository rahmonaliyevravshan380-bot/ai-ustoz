// =====================================================
// AI Ustoz - Mock Data & Constants
// =====================================================

// Navigation Items for Sidebar
export const NAV_ITEMS = [
  {
    group: "Asosiy",
    items: [
      { id: 'dashboard', label: 'Bosh sahifa', icon: 'RiDashboardLine', path: '/dashboard' },
      { id: 'ai-chat', label: 'AI Chat', icon: 'RiRobot2Line', path: '/dashboard/ai-chat', badge: 'Yangi' },
    ]
  },
  {
    group: "AI Vositalar",
    items: [
      { id: 'lesson-planner', label: 'Dars Rejasi', icon: 'RiFileList3Line', path: '/dashboard/lesson-planner' },
      { id: 'quiz-generator', label: 'Test Generator', icon: 'RiQuestionLine', path: '/dashboard/quiz-generator' },
      { id: 'presentation', label: 'Prezentatsiya', icon: 'RiSlideshowLine', path: '/dashboard/presentation' },
      { id: 'homework', label: 'Uy Vazifasi', icon: 'RiHomeHeartLine', path: '/dashboard/homework' },
      { id: 'worksheet', label: 'Varaqalar', icon: 'RiFileTextLine', path: '/dashboard/worksheet' },

      { id: 'exam-generator', label: 'Imtihon Generator', icon: 'RiEditBoxLine', path: '/dashboard/exam-generator' },
      { id: 'code-generator', label: 'Kod Generator', icon: 'RiCodeSSlashLine', path: '/dashboard/code-generator' },
    ]
  },
  {
    group: "AI Medialab",
    items: [

      { id: 'ai-voice', label: 'AI Ovoz', icon: 'RiVoiceLine', path: '/dashboard/ai-voice' },
      { id: 'ocr', label: 'OCR', icon: 'RiScanLine', path: '/dashboard/ocr' },


      { id: 'translator', label: "Tarjimon", icon: 'RiTranslate2', path: '/dashboard/translator' },
    ]
  },
  {
    group: "Sinf Boshqaruvi",
    items: [
      { id: 'students', label: 'O\'quvchilar', icon: 'RiGroupLine', path: '/dashboard/students' },
      { id: 'classes', label: 'Sinflar', icon: 'RiSchoolLine', path: '/dashboard/classes' },
      { id: 'attendance', label: 'Davomat', icon: 'RiCalendarCheckLine', path: '/dashboard/attendance' },
      { id: 'gradebook', label: 'Jurnali', icon: 'RiBookOpenLine', path: '/dashboard/gradebook' },
      { id: 'reports', label: 'Hisobotlar', icon: 'RiBarChartLine', path: '/dashboard/reports' },
      { id: 'analytics', label: 'Tahlil', icon: 'RiLineChartLine', path: '/dashboard/analytics' },
    ]
  },
  {
    group: "Unumdorlik",
    items: [
      { id: 'calendar', label: 'Taqvim', icon: 'RiCalendarLine', path: '/dashboard/calendar' },
      { id: 'planner', label: 'Rejalashtirish', icon: 'RiListCheck2', path: '/dashboard/planner' },
      { id: 'prompt-library', label: 'Prompt Kutubxona', icon: 'RiBookMarkLine', path: '/dashboard/prompt-library' },
    ]
  },
  {
    group: "Hisob",
    items: [
      { id: 'subscription', label: 'Obuna', icon: 'RiVipCrownLine', path: '/dashboard/subscription' },
      { id: 'billing', label: 'To\'lovlar', icon: 'RiMoneyDollarCircleLine', path: '/dashboard/billing' },
      { id: 'settings', label: 'Sozlamalar', icon: 'RiSettingsLine', path: '/dashboard/settings' },
      { id: 'profile', label: 'Profil', icon: 'RiUserLine', path: '/dashboard/profile' },
    ]
  },
];

// Mock Students
export const MOCK_STUDENTS = Array.from({ length: 28 }, (_, i) => ({
  id: i + 1,
  name: [
    "Ahmadov Ali", "Karimova Dildora", "Yusupov Jasur", "Nazarova Malika",
    "Toshmatov Bekzod", "Hasanova Nilufar", "Ergashev Sherzod", "Mirzayeva Gulnora",
    "Abdullayev Firdavs", "Rakhimova Zulfiya", "Umarov Bobur", "Saidova Feruza",
    "Xolmatov Ulugbek", "Qodirov Mansur", "Ismoilova Shahnoza", "Normatov Timur",
    "Baxtiyorova Mohira", "Yunusov Eldor", "Hamidova Dilorom", "Sotvoldiyev Jahongir",
    "Xasanov Murod", "Tillayeva Sabohat", "Mamatov Sarvar", "Jalilova Iroda",
    "Qosimov Ibrohim", "Azimova Barno", "Nishonov Hayot", "Tursunova Kamola"
  ][i],
  grade: ['9-A', '9-B', '10-A', '10-B', '11-A'][i % 5],
  gpa: (3.0 + Math.random() * 2).toFixed(1),
  attendance: Math.floor(80 + Math.random() * 20),
  status: Math.random() > 0.1 ? 'active' : 'inactive',
  avatar: null,
  phone: `+998 9${Math.floor(Math.random() * 9)}${Math.floor(Math.random() * 9)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 90 + 10)} ${Math.floor(Math.random() * 90 + 10)}`,
  parent: "Ota-ona: " + ["Ahmadov Bahodir", "Karimov Sardor", "Yusupov Hamid"][i % 3],
}));

// Mock Classes
export const MOCK_CLASSES = [
  { id: 1, name: '9-A', subject: 'Matematika', students: 28, room: '201', time: 'Du, Ch, Ju 08:00', color: '#2563EB' },
  { id: 2, name: '10-B', subject: 'Fizika', students: 25, room: '305', time: 'Se, Pa, Sh 10:00', color: '#7C3AED' },
  { id: 3, name: '11-A', subject: 'Matematika', students: 22, room: '201', time: 'Du, Ch 14:00', color: '#22C55E' },
  { id: 4, name: '8-C', subject: 'Algebra', students: 30, room: '104', time: 'Se, Ju 09:00', color: '#F59E0B' },
];

// Analytics Data
export const MONTHLY_PERFORMANCE = [
  { month: 'Sen', avg: 72, attendance: 88 },
  { month: 'Okt', avg: 75, attendance: 91 },
  { month: 'Noy', avg: 71, attendance: 85 },
  { month: 'Dek', avg: 68, attendance: 82 },
  { month: 'Yan', avg: 74, attendance: 89 },
  { month: 'Fev', avg: 78, attendance: 93 },
  { month: 'Mar', avg: 80, attendance: 94 },
  { month: 'Apr', avg: 82, attendance: 90 },
  { month: 'May', avg: 85, attendance: 95 },
];

// Prompt Library
export const PROMPT_CATEGORIES = [
  {
    id: 'math', label: 'Matematika', icon: '📐',
    prompts: [
      { id: 1, title: "Algebra dars rejasi", text: "10-sinf uchun kvadrat tenglamalar mavzusida 45 daqiqalik dars rejasi tuzing." },
      { id: 2, title: "Matematik masala", text: "9-sinf darajasida qiziqarli matematik masala va uni yechimini yozing." },
      { id: 3, title: "Geometriya testi", text: "8-sinf geometriya bo'yicha 10 ta test savoli tuzib, javob kalitini bering." },
    ]
  },
  {
    id: 'physics', label: 'Fizika', icon: '⚡',
    prompts: [
      { id: 4, title: "Mexanika dars rejasi", text: "10-sinf mexanika bo'yicha 45 daqiqalik dars rejasi tuzing." },
      { id: 5, title: "Fizika test", text: "9-sinf optika bo'yicha 10 ta test savoli tuzing." },
    ]
  },
  {
    id: 'it', label: 'IT / Dasturlash', icon: '💻',
    prompts: [
      { id: 6, title: "Python dars", text: "Boshlang'ich darajada Python dasturlash tili bo'yicha dars rejasi tuzing." },
      { id: 7, title: "HTML dars", text: "HTML va CSS asoslari bo'yicha amaliy mashg'ulot rejasi tuzing." },
      { id: 8, title: "JavaScript vazifa", text: "O'rta darajadagi JavaScript bo'yicha 5 ta amaliy vazifa yozing." },
    ]
  },
  {
    id: 'english', label: "Ingliz tili", icon: '🇬🇧',
    prompts: [
      { id: 9, title: "Grammar dars", text: "Present Perfect tense bo'yicha 45 daqiqalik ingliz tili darsi rejasini tuzing." },
      { id: 10, title: "Essay topshirig'i", text: "Ingliz tilida 200 so'zlik insho topshirig'i va baholash mezonini yozing." },
    ]
  },
  {
    id: 'uzbek', label: "O'zbek tili", icon: '🇺🇿',
    prompts: [
      { id: 11, title: "Imlo dars", text: "9-sinf uchun imlo qoidalari bo'yicha dars rejasi tuzing." },
      { id: 12, title: "Adabiyot tahlil", text: "Cho'lpon she'ri bo'yicha tahlil savollari tuzing." },
    ]
  },
  {
    id: 'chemistry', label: 'Kimyo', icon: '🧪',
    prompts: [
      { id: 13, title: "Kimyo laboratoriya", text: "8-sinf uchun oksidlanish-qaytarilish reaksiyalari bo'yicha laboratoriya ishi rejasini tuzing." },
    ]
  },
];

// Template Library
export const TEMPLATES = [
  { id: 1, title: "Dars rejasi", category: "lesson", icon: "📋", desc: "Standart dars rejasi shabloni", downloads: 1204 },
  { id: 2, title: "Olimpiada savollar", category: "exam", icon: "🏆", desc: "Olimpiada topshiriqlari shabloni", downloads: 876 },
  { id: 3, title: "Sertifikat", category: "certificate", icon: "🎓", desc: "O'quvchi sertifikati shabloni", downloads: 2341 },
  { id: 4, title: "Prezentatsiya", category: "presentation", icon: "📊", desc: "Dars prezentatsiyasi shabloni", downloads: 1567 },
  { id: 5, title: "Uy vazifasi varaqasi", category: "homework", icon: "📝", desc: "Uy vazifasi topshiriq varaqasi", downloads: 934 },
  { id: 6, title: "Baholash rubrikasi", category: "rubric", icon: "📏", desc: "Loyiha baholash rubrikasi", downloads: 678 },
  { id: 7, title: "Davomat jurnali", category: "attendance", icon: "✅", desc: "Oylik davomat jurnali", downloads: 1123 },
  { id: 8, title: "Ota-onalarga xat", category: "letter", icon: "✉️", desc: "Ota-onaga bildirishnoma xati", downloads: 445 },
];

// AI Chat mock responses
export const AI_RESPONSES = {
  default: [
    "Bu juda yaxshi savol! Keling, batafsil ko'rib chiqaylik.",
    "Men sizga bu mavzuda yordam bera olaman. Mana, batafsil ma'lumot:",
    "Albatta! Bu mavzu bo'yicha quyidagilarni bilish kerak:",
    "Zo'r savol! O'qituvchilar uchun bu juda muhim ma'lumot:",
    "Keling, bu masalani birgalikda hal qilaylik. Boshlaylik:",
  ]
};

// Subjects list
export const SUBJECTS = [
  "Matematika", "Algebra", "Geometriya", "Fizika", "Kimyo", "Biologiya",
  "Tarix", "Geografiya", "O'zbek tili", "O'zbek adabiyoti", "Ingliz tili",
  "Rus tili", "Informatika", "Chizmachilik", "Tarbiya", "Musiqa",
  "Tasviriy san'at", "Jismoniy tarbiya", "Texnologiya"
];

// Grades
export const GRADES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

// Code languages
export const CODE_LANGUAGES = [
  { id: 'html', label: 'HTML', icon: '🌐' },
  { id: 'css', label: 'CSS', icon: '🎨' },
  { id: 'javascript', label: 'JavaScript', icon: '🟨' },
  { id: 'typescript', label: 'TypeScript', icon: '🔷' },
  { id: 'react', label: 'React', icon: '⚛️' },
  { id: 'nodejs', label: 'Node.js', icon: '🟩' },
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'django', label: 'Django', icon: '🟢' },
  { id: 'sql', label: 'SQL', icon: '🗄️' },
  { id: 'bootstrap', label: 'Bootstrap', icon: '💜' },
  { id: 'tailwind', label: 'Tailwind', icon: '💨' },
  { id: 'scss', label: 'SCSS', icon: '🎀' },
];
