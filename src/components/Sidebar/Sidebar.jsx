import React from 'react';
import {
  FaPlus,
  FaHistory,
  FaComments,
  FaTrash,
  FaCog,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaGem,
  FaRocket,
} from 'react-icons/fa';
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
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={() => {
          // Close sidebar on overlay click - handled by parent via prop
          if (window.innerWidth <= 768) {
            document.dispatchEvent(new CustomEvent('closeSidebar'));
          }
        }}
      />
      
      <aside className={'sidebar ' + (isOpen ? 'open' : '')}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon-wrapper">
              <FaRocket />
            </div>
            <div className="logo-text-wrapper">
              <span className="logo-title">{t('appName')}</span>
              <span className="logo-subtitle"><FaGem /> {t('premium')}</span>
            </div>
          </div>

          <button className="new-chat-btn" onClick={onNewSession}>
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
                    onClick={() => onSelectSession(session.id)}
                  >
                    <FaComments className="session-icon" />
                    <span className="session-title">{session.title || t('newChat')}</span>
                    <button
                      className="session-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      aria-label="Delete session"
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
          <button className="sidebar-footer-item" onClick={onToggleSettings}>
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
    </>
  );
};

export default Sidebar;
