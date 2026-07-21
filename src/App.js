import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ChatInterface from './components/Chat/ChatInterface';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ChatInterface />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
