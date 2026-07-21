import React from 'react';
import { motion } from 'framer-motion';
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
  FaRocket
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
  onToggleSettings
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <motion.aside
      className={'sidebar ' + (isOpen ? 'open' : '')}
      initial={{ x: -320 }}
      animate={{ x: isOpen ? 0 : -320 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-header">
        <motion.div
          className="logo-container"
          whileHover={{ scale: 1.02 }}
        >
          <motion.div
            className="logo-icon-wrapper"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FaRocket />
          </motion.div>
          <div className="logo-text-wrapper">
            <span className="logo-title">{t('appName')}</span>
            <span className="logo-subtitle">
              <FaGem /> {t('premium')}
            </span>
          </div>
        </motion.div>

        <motion.button
          className="new-chat-btn"
          onClick={onNewSession}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPlus />
          <span>{t('newChat')}</span>
        </motion.button>
      </div>

      <div className="sidebar-content">
        <div className="sessions-section">
          <div className="sessions-header">
            <FaHistory /> {t('recentChats')}
          </div>
          <div className="sessions-list">
            {sessions && sessions.length > 0 ? (
              sessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  className={'session-item ' + (currentSession === session.id ? 'active' : '')}
                  onClick={() => onSelectSession(session.id)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 5 }}
                >
                  <FaComments className="session-icon" />
                  <span className="session-title">{session.title || t('newChat')}</span>
                  <button
                    className="session-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                  >
                    <FaTrash />
                  </button>
                </motion.div>
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
        <motion.button className="sidebar-footer-item" onClick={toggleTheme} whileHover={{ x: 5 }}>
          {isDark ? <FaSun /> : <FaMoon />}
          <span>{isDark ? t('lightMode') : t('darkMode')}</span>
        </motion.button>
        <motion.button className="sidebar-footer-item" onClick={onToggleSettings} whileHover={{ x: 5 }}>
          <FaCog />
          <span>{t('settings')}</span>
        </motion.button>
        <motion.button className="sidebar-footer-item" whileHover={{ x: 5 }}>
          <FaSignOutAlt />
          <span>{t('signOut')}</span>
        </motion.button>
        <div className="sidebar-footer-item status">
          <motion.span
            className="status-dot"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>{t('ready')}</span>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
