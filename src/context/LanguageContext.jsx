import React, { createContext, useState, useContext, useCallback } from 'react';

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
    appName: 'Voice AI', premium: 'JARVIS Core', newChat: 'New Session',
    recentChats: 'Session Log', noChats: 'No sessions yet', startChat: 'Start a new conversation',
    lightMode: 'Light', darkMode: 'Dark', settings: 'Settings', signOut: 'Sign Out', ready: 'Online',
    thinking: 'Processing…', talkAndListen: "I'm listening", description: 'Your intelligent voice companion — ask, calculate, search, or just say hi.',
    tryThese: 'Try saying', listening: 'Listening', typeMessage: 'Type or speak a command…',
    pressEnter: 'Enter to send', madeWithLove: 'Built for you', settingsTitle: 'System Settings',
    darkModeSetting: 'Dark Interface', voiceInput: 'Voice Input', autoSave: 'Auto-Save Sessions',
    soundEffects: 'Spoken Replies', language: 'Language', sayHello: 'Say Hello', tellJoke: 'Tell a Joke',
    whatTime: 'What Time?', calculate: 'Calculate', search: 'Search', playMusic: 'Play Music',
    recognizedIntents: '14+ Recognized Intents', aiCore: 'AI/ML Powered Core', voiceReady: 'Voice Ready',
    activeUsers: 'Active Users', responseTime: 'Response Time', messages: 'Messages',
    micUnsupported: 'Voice recognition is not supported in this browser. Try Chrome or Edge.',
  },
  es: {
    appName: 'Voice AI', premium: 'Núcleo JARVIS', newChat: 'Nueva Sesión',
    recentChats: 'Registro', noChats: 'Sin sesiones', startChat: 'Inicia una conversación',
    lightMode: 'Claro', darkMode: 'Oscuro', settings: 'Ajustes', signOut: 'Salir', ready: 'En línea',
    thinking: 'Procesando…', talkAndListen: 'Te escucho', description: 'Tu compañero de voz inteligente — pregunta, calcula, busca o saluda.',
    tryThese: 'Prueba decir', listening: 'Escuchando', typeMessage: 'Escribe o habla un comando…',
    pressEnter: 'Enter para enviar', madeWithLove: 'Hecho para ti', settingsTitle: 'Configuración',
    darkModeSetting: 'Interfaz Oscura', voiceInput: 'Entrada de Voz', autoSave: 'Guardado Automático',
    soundEffects: 'Respuestas Habladas', language: 'Idioma', sayHello: 'Saluda', tellJoke: 'Cuenta un Chiste',
    whatTime: '¿Qué Hora Es?', calculate: 'Calcular', search: 'Buscar', playMusic: 'Reproducir Música',
    recognizedIntents: '14+ Intenciones', aiCore: 'Núcleo IA/ML', voiceReady: 'Voz Lista',
    activeUsers: 'Usuarios Activos', responseTime: 'Tiempo de Respuesta', messages: 'Mensajes',
    micUnsupported: 'El reconocimiento de voz no es compatible con este navegador.',
  },
  fr: {
    appName: 'Voice AI', premium: 'Noyau JARVIS', newChat: 'Nouvelle Session',
    recentChats: 'Historique', noChats: 'Aucune session', startChat: 'Démarrer une conversation',
    lightMode: 'Clair', darkMode: 'Sombre', settings: 'Paramètres', signOut: 'Déconnexion', ready: 'En ligne',
    thinking: 'Traitement…', talkAndListen: "Je t'écoute", description: 'Votre compagnon vocal intelligent — demandez, calculez, cherchez ou dites bonjour.',
    tryThese: 'Essayez de dire', listening: 'Écoute', typeMessage: 'Tapez ou dites une commande…',
    pressEnter: 'Entrée pour envoyer', madeWithLove: 'Fait pour vous', settingsTitle: 'Paramètres Système',
    darkModeSetting: 'Interface Sombre', voiceInput: 'Entrée Vocale', autoSave: 'Sauvegarde Auto',
    soundEffects: 'Réponses Vocales', language: 'Langue', sayHello: 'Dire Bonjour', tellJoke: 'Raconter une Blague',
    whatTime: 'Quelle Heure?', calculate: 'Calculer', search: 'Rechercher', playMusic: 'Jouer Musique',
    recognizedIntents: '14+ Intentions', aiCore: 'Noyau IA/ML', voiceReady: 'Voix Prête',
    activeUsers: 'Utilisateurs Actifs', responseTime: 'Temps de Réponse', messages: 'Messages',
    micUnsupported: "La reconnaissance vocale n'est pas prise en charge par ce navigateur.",
  },
  hi: {
    appName: 'Voice AI', premium: 'JARVIS कोर', newChat: 'नया सत्र',
    recentChats: 'हाल की बातचीत', noChats: 'कोई सत्र नहीं', startChat: 'नई बातचीत शुरू करें',
    lightMode: 'हल्का', darkMode: 'गहरा', settings: 'सेटिंग्स', signOut: 'साइन आउट', ready: 'ऑनलाइन',
    thinking: 'सोच रहा हूँ…', talkAndListen: 'मैं सुन रहा हूँ', description: 'आपका बुद्धिमान वॉइस साथी — पूछें, गणना करें, खोजें, या नमस्ते कहें।',
    tryThese: 'यह कहकर देखें', listening: 'सुन रहा है', typeMessage: 'टाइप करें या बोलें…',
    pressEnter: 'भेजने के लिए Enter दबाएं', madeWithLove: 'आपके लिए बनाया गया', settingsTitle: 'सिस्टम सेटिंग्स',
    darkModeSetting: 'डार्क इंटरफ़ेस', voiceInput: 'वॉइस इनपुट', autoSave: 'ऑटो-सेव',
    soundEffects: 'बोली गई प्रतिक्रियाएं', language: 'भाषा', sayHello: 'नमस्ते कहें', tellJoke: 'चुटकुला सुनाएं',
    whatTime: 'कितने बजे हैं?', calculate: 'गणना करें', search: 'खोजें', playMusic: 'संगीत बजाएं',
    recognizedIntents: '14+ पहचाने गए इरादे', aiCore: 'AI/ML संचालित कोर', voiceReady: 'वॉइस तैयार',
    activeUsers: 'सक्रिय उपयोगकर्ता', responseTime: 'प्रतिक्रिया समय', messages: 'संदेश',
    micUnsupported: 'इस ब्राउज़र में वॉइस पहचान समर्थित नहीं है।',
  },
  de: {
    appName: 'Voice AI', premium: 'JARVIS Kern', newChat: 'Neue Sitzung',
    recentChats: 'Verlauf', noChats: 'Keine Sitzungen', startChat: 'Starte ein Gespräch',
    lightMode: 'Hell', darkMode: 'Dunkel', settings: 'Einstellungen', signOut: 'Abmelden', ready: 'Online',
    thinking: 'Verarbeite…', talkAndListen: 'Ich höre zu', description: 'Dein intelligenter Sprachassistent — frage, rechne, suche oder sag hallo.',
    tryThese: 'Versuche zu sagen', listening: 'Hört zu', typeMessage: 'Tippe oder sprich einen Befehl…',
    pressEnter: 'Enter zum Senden', madeWithLove: 'Für dich gebaut', settingsTitle: 'Systemeinstellungen',
    darkModeSetting: 'Dunkles Interface', voiceInput: 'Spracheingabe', autoSave: 'Auto-Speichern',
    soundEffects: 'Gesprochene Antworten', language: 'Sprache', sayHello: 'Hallo Sagen', tellJoke: 'Witz Erzählen',
    whatTime: 'Wie Spät?', calculate: 'Berechnen', search: 'Suchen', playMusic: 'Musik Abspielen',
    recognizedIntents: '14+ Erkannte Absichten', aiCore: 'KI/ML Kern', voiceReady: 'Stimme Bereit',
    activeUsers: 'Aktive Nutzer', responseTime: 'Antwortzeit', messages: 'Nachrichten',
    micUnsupported: 'Spracherkennung wird in diesem Browser nicht unterstützt.',
  },
  ja: {
    appName: 'Voice AI', premium: 'JARVIS コア', newChat: '新しいセッション',
    recentChats: '履歴', noChats: 'セッションなし', startChat: '会話を始める',
    lightMode: 'ライト', darkMode: 'ダーク', settings: '設定', signOut: 'サインアウト', ready: 'オンライン',
    thinking: '処理中…', talkAndListen: '聞いています', description: 'あなたの知的な音声アシスタント — 質問、計算、検索、挨拶ができます。',
    tryThese: '試してみて', listening: '聞いています', typeMessage: 'コマンドを入力または話す…',
    pressEnter: 'Enterで送信', madeWithLove: 'あなたのために作られました', settingsTitle: 'システム設定',
    darkModeSetting: 'ダークインターフェース', voiceInput: '音声入力', autoSave: '自動保存',
    soundEffects: '音声応答', language: '言語', sayHello: '挨拶する', tellJoke: 'ジョークを言う',
    whatTime: '今何時?', calculate: '計算する', search: '検索', playMusic: '音楽を再生',
    recognizedIntents: '14以上の認識意図', aiCore: 'AI/MLコア', voiceReady: '音声準備完了',
    activeUsers: 'アクティブユーザー', responseTime: '応答時間', messages: 'メッセージ',
    micUnsupported: 'このブラウザでは音声認識がサポートされていません。',
  },
  zh: {
    appName: 'Voice AI', premium: 'JARVIS 核心', newChat: '新会话',
    recentChats: '历史记录', noChats: '暂无会话', startChat: '开始新对话',
    lightMode: '浅色', darkMode: '深色', settings: '设置', signOut: '退出', ready: '在线',
    thinking: '处理中…', talkAndListen: '我在听', description: '你的智能语音助手 — 提问、计算、搜索，或只是打个招呼。',
    tryThese: '试着说', listening: '正在听', typeMessage: '输入或说出指令…',
    pressEnter: '按 Enter 发送', madeWithLove: '为你打造', settingsTitle: '系统设置',
    darkModeSetting: '深色界面', voiceInput: '语音输入', autoSave: '自动保存',
    soundEffects: '语音回复', language: '语言', sayHello: '打招呼', tellJoke: '讲笑话',
    whatTime: '现在几点', calculate: '计算', search: '搜索', playMusic: '播放音乐',
    recognizedIntents: '14+ 识别意图', aiCore: 'AI/ML 核心', voiceReady: '语音就绪',
    activeUsers: '活跃用户', responseTime: '响应时间', messages: '消息',
    micUnsupported: '此浏览器不支持语音识别。',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
  }, []);

  const t = useCallback((key) => {
    return (dict[language] && dict[language][key]) || dict.en[key] || key;
  }, [language]);

  const speechLocale = SPEECH_LOCALES[language] || 'en-US';

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t, speechLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
