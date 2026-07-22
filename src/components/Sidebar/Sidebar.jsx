import React from 'react';
import {
  Plus,
  History,
  MessageSquare,
  Trash2,
  Settings,
  LogOut,
  Moon,
  Sun,
  Bot,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import './Sidebar.css';

const Sidebar = ({
  isOpen,
  sessions,
  currentSession,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onToggleSettings,
  onClose,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const handleSelect = (id) => {
    onSelectSession(id);
    onClose?.();
  };

  const handleNewSession = () => {
    onNewSession();
    onClose?.();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => onClose?.()}
        aria-hidden={!isOpen}
      />

      <aside className={'sidebar ' + (isOpen ? 'open' : '')}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <Bot size={22} />
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-title">Cognix</span>
            </div>
          </div>

          <button className="new-chat-btn" onClick={handleNewSession}>
            <Plus size={18} />
            <span>{t('newChat')}</span>
          </button>
        </div>

        <div className="sidebar-content">
          <div className="sessions-section">
            <div className="sessions-header">
              <History size={16} /> {t('recentChats')}
            </div>
            <div className="sessions-list">
              {sessions && sessions.length > 0 ? (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={'session-item ' + (currentSession === session.id ? 'active' : '')}
                    onClick={() => handleSelect(session.id)}
                  >
                    <MessageSquare size={16} className="session-icon" />
                    <span className="session-title">{session.title || t('newChat')}</span>
                    <button
                      className="session-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      aria-label="Delete session"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-sessions">
                  <MessageSquare size={24} />
                  <p>{t('noChats')}</p>
                  <span>{t('startChat')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-item" onClick={toggleTheme}>
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? t('lightMode') : t('darkMode')}</span>
          </button>
          <button className="sidebar-footer-item" onClick={onToggleSettings}>
            <Settings size={18} />
            <span>{t('settings')}</span>
          </button>
          <button className="sidebar-footer-item">
            <LogOut size={18} />
            <span>{t('signOut')}</span>
          </button>
          <div className="sidebar-footer-item status">
            <span className="status-dot"></span>
            <span>{t('ready')}</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;