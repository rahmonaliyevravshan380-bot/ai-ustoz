import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy-loaded pages
const LandingPage = lazy(() => import('../pages/Landing/LandingPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPasswordPage'));

// Dashboard pages
const HomePage = lazy(() => import('../pages/Dashboard/HomePage'));
const AIChatPage = lazy(() => import('../pages/AI/AIChatPage'));
const LessonPlannerPage = lazy(() => import('../pages/AI/LessonPlannerPage'));
const QuizGeneratorPage = lazy(() => import('../pages/AI/QuizGeneratorPage'));
const PresentationPage = lazy(() => import('../pages/AI/PresentationPage'));
const HomeworkPage = lazy(() => import('../pages/AI/HomeworkPage'));
const WorksheetPage = lazy(() => import('../pages/AI/WorksheetPage'));

const ExamGeneratorPage = lazy(() => import('../pages/AI/ExamGeneratorPage'));
const CodeGeneratorPage = lazy(() => import('../pages/AI/CodeGeneratorPage'));

const AIVoicePage = lazy(() => import('../pages/AI/AIVoicePage'));
const OCRPage = lazy(() => import('../pages/AI/OCRPage'));


const TranslatorPage = lazy(() => import('../pages/AI/TranslatorPage'));
const PromptLibraryPage = lazy(() => import('../pages/AI/PromptLibraryPage'));

const StudentsPage = lazy(() => import('../pages/Classroom/StudentsPage'));
const ClassesPage = lazy(() => import('../pages/Classroom/ClassesPage'));
const AttendancePage = lazy(() => import('../pages/Classroom/AttendancePage'));
const GradebookPage = lazy(() => import('../pages/Classroom/GradebookPage'));
const ReportsPage = lazy(() => import('../pages/Classroom/ReportsPage'));
const AnalyticsPage = lazy(() => import('../pages/Classroom/AnalyticsPage'));

const CalendarPage = lazy(() => import('../pages/Productivity/CalendarPage'));
const PlannerPage = lazy(() => import('../pages/Productivity/PlannerPage'));




const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const ProfilePage = lazy(() => import('../pages/Settings/ProfilePage'));
const SubscriptionPage = lazy(() => import('../pages/Subscription/SubscriptionPage'));
const BillingPage = lazy(() => import('../pages/Subscription/BillingPage'));

function PageLoader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, border: '3px solid rgba(37,99,235,0.2)',
          borderTopColor: '#2563EB', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 12px'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>Yuklanmoqda...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HomePage />} />
          <Route path="ai-chat" element={<AIChatPage />} />
          <Route path="lesson-planner" element={<LessonPlannerPage />} />
          <Route path="quiz-generator" element={<QuizGeneratorPage />} />
          <Route path="presentation" element={<PresentationPage />} />
          <Route path="homework" element={<HomeworkPage />} />
          <Route path="worksheet" element={<WorksheetPage />} />

          <Route path="exam-generator" element={<ExamGeneratorPage />} />
          <Route path="code-generator" element={<CodeGeneratorPage />} />

          <Route path="ai-voice" element={<AIVoicePage />} />
          <Route path="ocr" element={<OCRPage />} />


          <Route path="translator" element={<TranslatorPage />} />
          <Route path="prompt-library" element={<PromptLibraryPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="gradebook" element={<GradebookPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="planner" element={<PlannerPage />} />




          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="billing" element={<BillingPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
