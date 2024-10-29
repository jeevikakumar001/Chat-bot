// src/App.js

import React from 'react';
import Chatbot from './Chatbot';
import './App.css'; // Optional: import any custom styles

function App() {
  return (
    <div className="App">
      <h1 className="text-center text-2xl font-bold mb-4">AI Chatbot</h1>
      <Chatbot />
    </div>
  );
}

export default App;
