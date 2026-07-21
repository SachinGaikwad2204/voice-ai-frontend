import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

// Speech recognition / synthesis locale codes per app language
export const SPEECH_LOCALES = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  de: 'de-DE',
  ja: 'ja-JP',
  zh: 'zh-CN',
};

const dict = {
  en: {
    appName: 'Voice AI', premium: 'Premium', newChat: 'New Chat',
    recentChats: 'Recent Chats', noChats: 'No chats yet', startChat: 'Start a new chat',
    lightMode: 'Light Mode', darkMode: 'Dark Mode', settings: 'Settings', signOut: 'Sign Out', ready: 'Ready',
    thinking: 'Thinking…', talkAndListen: 'Talk and Listen', description: 'Your AI voice assistant is ready to chat!',
    tryThese: 'Try these', listening: 'Listening', typeMessage: 'Type your message…',
    pressEnter: 'Press Enter', madeWithLove: 'Made with Love', settingsTitle: 'Settings',
    darkModeSetting: 'Dark Mode', voiceInput: 'Voice Input', autoSave: 'Auto Save',
    soundEffects: 'Sound Effects', language: 'Language', sayHello: 'Say Hello', tellJoke: 'Tell a Joke',
    whatTime: 'What time is it?', calculate: 'Calculate', search: 'Search', playMusic: 'Play Music',
    recognizedIntents: 'Recognized Intents', aiCore: 'AI Core', voiceReady: 'Voice Ready',
    activeUsers: 'Active Users', responseTime: 'Response Time', messages: 'Messages',
    micUnsupported: 'Voice recognition is not supported in this browser.',
  },
  hi: {
    appName: 'वॉयस एआई', premium: 'प्रीमियम', newChat: 'नई चेट',
    recentChats: 'हाल की चेट', noChats: 'अभी कोई चैट नहीं', startChat: 'नई चैट शुरू करें',
    lightMode: 'लाइट मोड', darkMode: 'डार्क मोड', settings: 'सेटिंग्स', signOut: 'साइन आउट', ready: 'तैयार',
    thinking: 'सोच रहा हूँ…', talkAndListen: 'बात करें और सुनें', description: 'आपका AI वॉयस असिस्टेंट चैट करने के लिए तैयार है!',
    tryThese: 'इन्हें आज़माएं', listening: 'सुन रहा हूँ', typeMessage: 'अपना संदेश लिखें…',
    pressEnter: 'एंटर दबाएं', madeWithLove: 'प्यार से बनाया', settingsTitle: 'सेटिंग्स',
    darkModeSetting: 'डार्क मोड', voiceInput: 'वॉयस इनपुट', autoSave: 'ऑटो सेव',
    soundEffects: 'ध्वनि प्रभाव', language: 'भाषा', sayHello: 'नमस्ते कहें', tellJoke: 'मजाक सुनाएं',
    whatTime: 'क्या समय है?', calculate: 'गणना करें', search: 'खोजें', playMusic: 'संगीत बजाएं',
    recognizedIntents: 'पहचाने गए इरादे', aiCore: 'AI कोर', voiceReady: 'वॉयस तैयार',
    activeUsers: 'सक्रिय उपयोगकर्ता', responseTime: 'प्रतिक्रिया समय', messages: 'संदेश',
    micUnsupported: 'इस ब्राउज़र में वॉइस पहचान समर्थित नहीं है।',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  };

  const t = (key) => {
    return (dict[language] && dict[language][key]) || dict.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);