import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FaRocket,
  FaVolumeUp,
  FaSave,
  FaGlobe,
  FaPlus,
  FaHistory,
  FaComments,
  FaSignOutAlt,
  FaStar
} from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { voiceApi } from '../../services/api';
import './ChatInterface.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeUsers] = useState(42);
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('voiceAISessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) {
        setCurrentSession(parsed[0].id);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('voiceAISessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now().toString(),
      title: t('newChat'),
      messages: [],
      createdAt: new Date().toISOString()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession.id);
    setMessages([]);
    setSessionId(null);
    setShowQuickActions(true);
  };

  const selectSession = (sessionId) => {
    setCurrentSession(sessionId);
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages || []);
      setSessionId(sessionId);
      setShowQuickActions(session.messages?.length === 0);
    }
  };

  const deleteSession = (sessionId) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      if (remaining.length > 0) {
        selectSession(remaining[0].id);
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
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

      const response = await voiceApi.sendMessage(messageText, sessionId, language);

      console.log('API Response:', response);

      if (response.sessionId && !sessionId) {
        setSessionId(response.sessionId);
      }

      const responseContent = response.response || response.message || "I'm not sure how to respond to that.";

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: responseContent,
        intent: response.intent,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      setSessions(prev => prev.map(s => {
        if (s.id === currentSession || s.id === sessionId) {
          const updatedMessages = [...(s.messages || []), userMessage, assistantMessage];
          return {
            ...s,
            messages: updatedMessages,
            title: updatedMessages.length > 0 ? updatedMessages[0].content.substring(0, 30) + '...' : t('newChat')
          };
        }
        return s;
      }));
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        isError: true,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [sessionId, currentSession, t, language]);

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
  };

  const quickActions = [
    { icon: <FaHandPeace />, label: t('sayHello'), text: 'Hello!', color: '#667eea' },
    { icon: <FaLaugh />, label: t('tellJoke'), text: 'Tell me a joke', color: '#f093fb' },
    { icon: <FaClock />, label: t('whatTime'), text: 'What time is it?', color: '#4facfe' },
    { icon: <FaCalculator />, label: t('calculate'), text: 'Calculate 25 * 4', color: '#43e97b' },
    { icon: <FaSearch />, label: t('search'), text: 'Search for AI', color: '#fa709a' },
    { icon: <FaMusic />, label: t('playMusic'), text: 'Play some music', color: '#f6d365' }
  ];

  const features = [
    { icon: <FaBullseye />, label: t('recognizedIntents'), color: '#667eea' },
    { icon: <FaBrain />, label: t('aiCore'), color: '#764ba2' },
    { icon: <FaMicrophoneAlt />, label: t('voiceReady'), color: '#f093fb' }
  ];

  const stats = [
    { icon: <FaUsers />, label: t('activeUsers'), value: activeUsers },
    { icon: <FaClock />, label: t('responseTime'), value: '< 100ms' },
    { icon: <FaDatabase />, label: t('messages'), value: messages.length }
  ];

  const handleVoiceClick = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        const commands = [
          'Hello, how are you?',
          'What time is it?',
          'Tell me a joke',
          'Calculate 25 * 4',
          'What is AI?',
          'Play some music'
        ];
        const randomCommand = commands[Math.floor(Math.random() * commands.length)];
        setInput(randomCommand);
        setTimeout(() => sendMessage(randomCommand), 300);
      }, 3000);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 5,
    color: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#f6d365'][Math.floor(Math.random() * 6)]
  }));

  const languageNames = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    hi: 'Hindi',
    de: 'German',
    ja: 'Japanese',
    zh: 'Chinese'
  };

  const languageFlags = {
    en: '🇬🇧',
    es: '🇪🇸',
    fr: '🇫🇷',
    hi: '🇮🇳',
    de: '🇩🇪',
    ja: '🇯🇵',
    zh: '🇨🇳'
  };

  return (
    <div className="app-container">
      <div className="particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.x + '%',
              top: p.y + '%',
              width: p.size,
              height: p.size,
              background: p.color,
            }}
          />
        ))}
      </div>

      <aside className={'sidebar ' + (isSidebarOpen ? 'open' : '')}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <FaRocket />
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-title">{t('appName')}</span>
              <span className="logo-subtitle">
                <FaGem /> {t('premium')}
              </span>
            </div>
          </div>
          <button className="new-chat-btn" onClick={createNewSession}>
            <FaPlus />
            <span>{t('newChat')}</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sessions-section">
            <div className="sessions-header">
              <FaHistory /> {t('recentChats')}
            </div>
            <div className="sessions-list">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={'session-item ' + (currentSession === session.id ? 'active' : '')}
                    onClick={() => selectSession(session.id)}
                  >
                    <FaComments className="session-icon" />
                    <span className="session-title">{session.title || t('newChat')}</span>
                    <button
                      className="session-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-sessions">
                  <FaComments />
                  <p>{t('noChats')}</p>
                  <span>{t('startChat')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-item" onClick={toggleTheme}>
            {isDark ? <FaSun /> : <FaMoon />}
            <span>{isDark ? t('lightMode') : t('darkMode')}</span>
          </button>
          <button className="sidebar-footer-item" onClick={toggleSettings}>
            <FaCog />
            <span>{t('settings')}</span>
          </button>
          <button className="sidebar-footer-item">
            <FaSignOutAlt />
            <span>{t('signOut')}</span>
          </button>
          <div className="sidebar-footer-item status">
            <span className="status-dot"></span>
            <span>{t('ready')}</span>
          </div>
        </div>
      </aside>

      <div className={'main-chat-area ' + (isSidebarOpen ? 'sidebar-open' : 'sidebar-closed')}>
        <header className="chat-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="logo">
              <span className="logo-icon">🎤</span>
              <span className="logo-text">{t('appName')}</span>
              <span className="logo-badge">
                <FaStar /> {t('premium')}
              </span>
            </div>
            <span className="status-badge">
              <span className="status-dot"></span>
              {isLoading ? t('thinking') : t('ready')}
            </span>
          </div>
          <div className="header-right">
            <button className="icon-btn" onClick={clearChat}>
              <FaTrash />
            </button>
          </div>
        </header>

        <div className="messages-area">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaRobot style={{ fontSize: '5rem' }} />
                </div>
                <h1>{t('talkAndListen')}</h1>
                <p>{t('description')}</p>
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
                    <div className="message-content">
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
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content-wrapper">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
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
            <div className="quick-actions-label">
              <FaRegLightbulb /> {t('tryThese')}
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => sendMessage(action.text)}
                  style={{ borderColor: action.color }}
                >
                  <span className="quick-action-icon" style={{ color: action.color }}>
                    {action.icon}
                  </span>
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
              className={'voice-btn ' + (isRecording ? 'recording' : '')}
              onClick={handleVoiceClick}
            >
              {isRecording ? <FaStop /> : <FaMicrophone />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? '🔴 ' + t('listening') : t('typeMessage')}
              className="chat-input"
              disabled={isLoading}
            />

            <button type="submit" className="send-btn" disabled={isLoading || !input.trim()}>
              {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </form>
          <div className="input-hint">
            <FaGem /> {t('pressEnter')} · {isDark ? '🌙 ' + t('darkMode') : '☀️ ' + t('lightMode')} · <FaHeart style={{ color: '#e74c3c' }} /> {t('madeWithLove')}
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <div className="settings-overlay" onClick={toggleSettings}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>
                <FaCog /> {t('settingsTitle')}
              </h2>
              <button className="settings-close" onClick={toggleSettings}>
                <FaTimes />
              </button>
            </div>
            <div className="settings-content">
              <div className="settings-item">
                <span>
                  {isDark ? <FaMoon /> : <FaSun />} {t('darkModeSetting')}
                </span>
                <label className="switch">
                  <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <span><FaMicrophoneAlt /> {t('voiceInput')}</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <span><FaSave /> {t('autoSave')}</span>
                <label className="switch">
                  <input type="checkbox" defaultChecked />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <span><FaVolumeUp /> {t('soundEffects')}</span>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-item">
                <span><FaGlobe /> {t('language')}</span>
                <select
                  className="settings-select"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  {Object.keys(languageNames).map((key) => (
                    <option key={key} value={key}>
                      {languageFlags[key]} {languageNames[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
