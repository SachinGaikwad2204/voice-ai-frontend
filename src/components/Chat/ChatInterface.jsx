import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  FaPaperPlane,
  FaMicrophone,
  FaStop,
  FaTrash,
  FaRobot,
  FaUser,
  FaRegLightbulb,
  FaSpinner,
  FaBars,
  FaClock,
  FaHandPeace,
  FaLaugh,
  FaCalculator,
  FaSearch,
  FaMusic,
  FaBullseye,
  FaBrain,
  FaMicrophoneAlt,
  FaGem,
  FaLongArrowAltRight,
  FaCog,
  FaTimes,
  FaMoon,
  FaSun,
  FaHeart,
  FaUsers,
  FaDatabase,
  FaVolumeUp,
  FaVolumeMute,
  FaSave,
  FaGlobe,
  FaStar,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage, SPEECH_LOCALES } from '../../context/LanguageContext';
import { useVoiceAssistant } from '../../hooks/useVoiceAssistant';
import { voiceApi } from '../../services/api';
import Sidebar from '../Sidebar/Sidebar';
import './ChatInterface.css';

const LANGUAGE_META = {
  en: { name: 'English', flag: '🇬🇧' },
  es: { name: 'Spanish', flag: '🇪🇸' },
  fr: { name: 'French', flag: '🇫🇷' },
  hi: { name: 'Hindi', flag: '🇮🇳' },
  de: { name: 'German', flag: '🇩🇪' },
  ja: { name: 'Japanese', flag: '🇯🇵' },
  zh: { name: 'Chinese', flag: '🇨🇳' },
};

const MOBILE_BREAKPOINT = 768;

// The reactive voice orb — the signature "Jarvis" element
const VoiceOrb = ({ state, volume = 0, onClick, size = 'lg' }) => {
  return (
    <button
      className={`voice-orb voice-orb-${size} orb-${state}`}
      style={{ '--volume': volume }}
      onClick={onClick}
      aria-label="Activate voice assistant"
      type="button"
    >
      <span className="orb-ring orb-ring-3" />
      <span className="orb-ring orb-ring-2" />
      <span className="orb-ring orb-ring-1" />
      <span className="orb-core">
        <span className="orb-bars">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className="orb-bar" style={{ '--i': i }} />
          ))}
        </span>
      </span>
    </button>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  // FIX: default the sidebar CLOSED on mobile screens so it doesn't cover
  // the whole viewport on first load. Desktop still defaults open.
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' ? window.innerWidth > MOBILE_BREAKPOINT : true
  );
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeUsers] = useState(42);

  // Working settings state (persisted)
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(
    () => localStorage.getItem('voiceInputEnabled') !== 'false'
  );
  const [soundEnabled, setSoundEnabled] = useState(
    () => localStorage.getItem('soundEnabled') === 'true'
  );
  const [autoSave, setAutoSave] = useState(
    () => localStorage.getItem('autoSave') !== 'false'
  );

  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const speechLocale = SPEECH_LOCALES[language] || 'en-US';

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // FIX: lock body scroll while the mobile sidebar overlay is open, so the
  // page behind it doesn't scroll along with it (common mobile UX bug).
  useEffect(() => {
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  // ===== SESSION HISTORY LOADING =====
  useEffect(() => {
    const savedSessions = localStorage.getItem('voiceAISessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (parsed && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSession(parsed[0].id);
          setMessages(parsed[0].messages || []);
          setSessionId(parsed[0].id);
          setShowQuickActions((parsed[0].messages?.length || 0) === 0);
        } else {
          createNewSession();
        }
      } catch (e) {
        createNewSession();
      }
    } else {
      createNewSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ===== AUTO-SAVE SESSIONS =====
  useEffect(() => {
    if (autoSave && sessions.length > 0) {
      localStorage.setItem('voiceAISessions', JSON.stringify(sessions));
    }
  }, [sessions, autoSave]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessions.length > 0 && autoSave) {
        localStorage.setItem('voiceAISessions', JSON.stringify(sessions));
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [sessions, autoSave]);

  useEffect(() => { localStorage.setItem('voiceInputEnabled', String(voiceInputEnabled)); }, [voiceInputEnabled]);
  useEffect(() => { localStorage.setItem('soundEnabled', String(soundEnabled)); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('autoSave', String(autoSave)); }, [autoSave]);

  const sendMessageRef = useRef();

  const voice = useVoiceAssistant({
    lang: speechLocale,
    onResult: (transcript) => {
      setInput(transcript);
      sendMessageRef.current?.(transcript);
    },
  });

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: t('newChat'),
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      if (autoSave) localStorage.setItem('voiceAISessions', JSON.stringify(updated));
      return updated;
    });
    setCurrentSession(newSession.id);
    setMessages([]);
    setSessionId(null);
    setShowQuickActions(true);
  };

  const selectSession = (id) => {
    setCurrentSession(id);
    const session = sessions.find((s) => s.id === id);
    if (session) {
      setMessages(session.messages || []);
      setSessionId(id);
      setShowQuickActions((session.messages?.length || 0) === 0);
    }
  };

  const deleteSession = (id) => {
    const updatedSessions = sessions.filter((s) => s.id !== id);
    setSessions(updatedSessions);
    if (autoSave) {
      localStorage.setItem('voiceAISessions', JSON.stringify(updatedSessions));
    }
    if (currentSession === id) {
      if (updatedSessions.length > 0) {
        selectSession(updatedSessions[0].id);
      } else {
        setMessages([]);
        setCurrentSession(null);
        setSessionId(null);
        setShowQuickActions(true);
        createNewSession();
      }
    }
  };

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText || !messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      setIsTyping(true);
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));

      const response = await voiceApi.sendMessage(messageText, sessionId, language);

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const responseContent = response.response || response.message || "I'm not sure how to respond to that.";

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseContent,
        intent: response.intent,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      setSessions((prev) => {
        const sessionExists = prev.some((s) => s.id === currentSession || s.id === sessionId);

        if (sessionExists) {
          const updatedSessions = prev.map((s) => {
            if (s.id === currentSession || s.id === sessionId) {
              const updatedMessages = [...(s.messages || []), userMessage, assistantMessage];
              return {
                ...s,
                messages: updatedMessages,
                title: updatedMessages.length > 0
                  ? (updatedMessages[0].content.length > 30
                    ? updatedMessages[0].content.substring(0, 30) + '...'
                    : updatedMessages[0].content)
                  : t('newChat'),
              };
            }
            return s;
          });

          if (autoSave) localStorage.setItem('voiceAISessions', JSON.stringify(updatedSessions));
          return updatedSessions;
        }

        const newSession = {
          id: Date.now().toString(),
          title: messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText,
          messages: [userMessage, assistantMessage],
          createdAt: new Date().toISOString(),
        };
        const updatedSessions = [newSession, ...prev];
        if (autoSave) localStorage.setItem('voiceAISessions', JSON.stringify(updatedSessions));
        setCurrentSession(newSession.id);
        setSessionId(newSession.id);
        return updatedSessions;
      });

      if (soundEnabled) {
        voice.speak(responseContent);
      }
    } catch (error) {
      const errText = 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: errText,
        isError: true,
        timestamp: new Date().toLocaleTimeString(),
      }]);
      if (soundEnabled) voice.speak(errText);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, currentSession, t, language, soundEnabled, autoSave]);

  sendMessageRef.current = sendMessage;

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(null);
    setShowQuickActions(true);
    voice.cancelSpeaking();
  };

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false); // FIX: real close handler, passed to Sidebar
  const toggleSettings = () => setIsSettingsOpen((v) => !v);

  const quickActions = [
    { icon: <FaHandPeace />, label: t('sayHello'), text: 'Hello!', color: '#00e5ff' },
    { icon: <FaLaugh />, label: t('tellJoke'), text: 'Tell me a joke', color: '#ff2bd6' },
    { icon: <FaClock />, label: t('whatTime'), text: 'What time is it?', color: '#7c6cf6' },
    { icon: <FaCalculator />, label: t('calculate'), text: 'Calculate 25 * 4', color: '#4cd9c0' },
    { icon: <FaSearch />, label: t('search'), text: 'Search for AI', color: '#ffb347' },
    { icon: <FaMusic />, label: t('playMusic'), text: 'Play some music', color: '#ff6b6b' },
  ];

  const features = [
    { icon: <FaBullseye />, label: t('recognizedIntents'), color: '#00e5ff' },
    { icon: <FaBrain />, label: t('aiCore'), color: '#7c6cf6' },
    { icon: <FaMicrophoneAlt />, label: t('voiceReady'), color: '#ff2bd6' },
  ];

  const stats = [
    { icon: <FaUsers />, label: t('activeUsers'), value: activeUsers },
    { icon: <FaClock />, label: t('responseTime'), value: '< 100ms' },
    { icon: <FaDatabase />, label: t('messages'), value: messages.length },
  ];

  const handleVoiceClick = () => {
    if (!voiceInputEnabled) {
      alert('Voice input is disabled. Enable it in Settings.');
      return;
    }
    if (voice.isListening) {
      voice.stopListening();
      return;
    }
    voice.startListening();
  };

  const orbState = useMemo(() => {
    if (voice.isListening) return 'listening';
    if (voice.isSpeaking) return 'speaking';
    if (isLoading) return 'thinking';
    return 'idle';
  }, [voice.isListening, voice.isSpeaking, isLoading]);

  const particles = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2.4 + 0.6,
    duration: Math.random() * 16 + 10,
    delay: Math.random() * 6,
  })), []);

  return (
    <div className="app-container">
      <div className="scan-grid" aria-hidden="true" />
      <div className="particles-container" aria-hidden="true">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.x + '%',
              top: p.y + '%',
              width: p.size + 'px',
              height: p.size + 'px',
              animationDuration: p.duration + 's',
              animationDelay: p.delay + 's',
            }}
          />
        ))}
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        sessions={sessions}
        currentSession={currentSession}
        onNewSession={createNewSession}
        onSelectSession={selectSession}
        onDeleteSession={deleteSession}
        onToggleSettings={toggleSettings}
        onClose={closeSidebar}
      />

      <div className={`main-chat-area ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="chat-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
              <FaBars />
            </button>
            <div className="logo">
              <span className="logo-icon">🎙️</span>
              <span className="logo-text">{t('appName')}</span>
              <span className="logo-badge"><FaStar /> {t('premium')}</span>
            </div>
            <span className={`status-badge ${isLoading ? 'status-busy' : ''}`}>
              <span className="status-dot" />
              {isLoading ? t('thinking') : t('ready')}
            </span>
          </div>
          <div className="header-right">
            <button
              className={`icon-btn ${soundEnabled ? 'icon-btn-active' : ''}`}
              onClick={() => setSoundEnabled((v) => !v)}
              aria-label="Toggle spoken replies"
              title={t('soundEffects')}
            >
              {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
            </button>
            <button className="icon-btn" onClick={clearChat} aria-label="Clear chat" title="Clear conversation">
              <FaTrash />
            </button>
          </div>
        </header>

        <div className="messages-area">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <VoiceOrb state={orbState} volume={voice.volumeLevel} onClick={handleVoiceClick} size="xl" />
                <h1>{t('talkAndListen')}</h1>
                <p>{t('description')}</p>

                {!voice.supported && (
                  <div className="hud-warning">
                    <FaExclamationTriangle /> {t('micUnsupported')}
                  </div>
                )}

                <div className="feature-grid">
                  {features.map((f, i) => (
                    <div key={i} className="feature-card">
                      <span className="feature-icon" style={{ color: f.color }}>{f.icon}</span>
                      <span>{f.label}</span>
                    </div>
                  ))}
                </div>
                <div className="stats-grid">
                  {stats.map((s, i) => (
                    <div key={i} className="stat-card">
                      <span className="stat-icon">{s.icon}</span>
                      <span className="stat-value">{s.value}</span>
                      <span className="stat-label">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={'message ' + (msg.role === 'user' ? 'user-message' : 'assistant-message')}
                >
                  <div className="message-avatar">
                    {msg.role === 'user' ? <FaUser /> : <FaRobot />}
                  </div>
                  <div className="message-content-wrapper">
                    <div className={`message-content ${msg.isError ? 'message-error' : ''}`}>
                      <div className="message-text">{msg.content}</div>
                      {msg.intent && (
                        <div className="message-intent">
                          <span className="intent-label">🎯 Intent</span>
                          <span className="intent-tag">{msg.intent}</span>
                        </div>
                      )}
                    </div>
                    <div className="message-timestamp">
                      <FaClock /> {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}

            {isTyping && (
              <div className="message assistant-message">
                <div className="message-avatar"><FaRobot /></div>
                <div className="message-content-wrapper">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {showQuickActions && messages.length === 0 && (
          <div className="quick-actions">
            <div className="quick-actions-label"><FaRegLightbulb /> {t('tryThese')}</div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action.text)}
                  style={{ '--accent-color': action.color }}
                >
                  <span className="quick-action-icon" style={{ color: action.color }}>{action.icon}</span>
                  {action.label}
                  <FaLongArrowAltRight className="quick-arrow" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-area">
          <form className="input-form" onSubmit={handleSubmit}>
            <button
              type="button"
              className={`voice-btn ${voice.isListening ? 'recording' : ''} ${!voiceInputEnabled ? ' disabled' : ''}`}
              onClick={handleVoiceClick}
              disabled={!voiceInputEnabled}
              title={voiceInputEnabled ? (voice.isListening ? 'Stop listening' : 'Start voice input') : 'Voice input disabled in settings'}
            >
              {voice.isListening ? <FaStop /> : <FaMicrophone />}
              {voice.isListening && <span className="voice-pulse" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={voice.isListening ? '🔴 ' + t('listening') + '…' : t('typeMessage')}
              className="chat-input"
              disabled={isLoading}
            />

            <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
              {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </form>
          <div className="input-hint">
            <FaGem /> {t('pressEnter')} ·
            {isDark ? ' 🌙 ' + t('darkMode') : ' ☀️ ' + t('lightMode')} ·
            <FaHeart style={{ color: '#ff2bd6' }} /> {t('madeWithLove')}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="settings-overlay" onClick={toggleSettings}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2><FaCog /> {t('settingsTitle')}</h2>
              <button className="settings-close" onClick={toggleSettings} aria-label="Close settings">
                <FaTimes />
              </button>
            </div>
            <div className="settings-content">
              <div className="settings-item">
                <span>{isDark ? <FaMoon /> : <FaSun />} {t('darkModeSetting')}</span>
                <label className="switch">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <span><FaMicrophoneAlt /> {t('voiceInput')}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={voiceInputEnabled}
                    onChange={(e) => {
                      setVoiceInputEnabled(e.target.checked);
                      if (!e.target.checked) voice.stopListening();
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <span><FaSave /> {t('autoSave')}</span>
                <label className="switch">
                  <input type="checkbox" checked={autoSave} onChange={(e) => setAutoSave(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <span><FaVolumeUp /> {t('soundEffects')}</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => {
                      setSoundEnabled(e.target.checked);
                      if (!e.target.checked) voice.cancelSpeaking();
                    }}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="settings-item">
                <span><FaGlobe /> {t('language')}</span>
                <select className="settings-select" value={language} onChange={handleLanguageChange}>
                  {Object.keys(LANGUAGE_META).map((key) => (
                    <option key={key} value={key}>
                      {LANGUAGE_META[key].flag} {LANGUAGE_META[key].name}
                    </option>
                  ))}
                </select>
              </div>

              {!voice.supported && (
                <div className="hud-warning settings-warning">
                  <FaExclamationTriangle /> {t('micUnsupported')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
