import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { NotificationProvider } from './context/NotificationContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import AppRouter from './routes/AppRouter';
import ToastContainer from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/main.scss';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              <SubscriptionProvider>
                <NotificationProvider>
                  <AppRouter />
                  <ToastContainer />
                </NotificationProvider>
              </SubscriptionProvider>
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
