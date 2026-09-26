import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import UserDataService from '../services/UserDataService';
import { TRANSLATIONS } from '../data/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user } = useAuth();
  
  const [language, setLanguage] = useState(() => {
    try {
      const sessionRaw = localStorage.getItem('ai-ustoz-session');
      if (sessionRaw) {
        const u = JSON.parse(sessionRaw);
        if (u && u.id) {
          const uSettings = UserDataService.getSettings(u.id);
          if (uSettings && uSettings.language) {
            return uSettings.language;
          }
        }
      }
    } catch (e) {
      console.error("Failed to load user session language:", e);
    }
    
    return localStorage.getItem('ai-ustoz-language') || 'uz';
  });

  useEffect(() => {
    if (user?.id) {
      const uSettings = UserDataService.getSettings(user.id);
      if (uSettings && uSettings.language && uSettings.language !== language) {
        setLanguage(uSettings.language);
      }
    }
  }, [user?.id]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('ai-ustoz-language', lang);
    
    if (user?.id) {
      const uSettings = UserDataService.getSettings(user.id);
      UserDataService.setSettings(user.id, {
        ...uSettings,
        language: lang
      });
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS['uz'];
    return langDict[key] !== undefined ? langDict[key] : key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
