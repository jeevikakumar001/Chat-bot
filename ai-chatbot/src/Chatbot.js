// src/Chatbot.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatHistory'));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');

    setLoading(true);
    setTyping(true);

    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDhDzKQliukUDAIwA27kNL6RshV8qs02j8',
        {
          contents: [
            {
              parts: [
                {
                  text: input,
                },
              ],
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const reply = response.data.candidates[0]?.content?.parts[0]?.text;
      const botMessage = {
        text: reply || "I'm not sure how to respond.",
        sender: 'bot',
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error fetching data:', error);
      const errorMessage = { text: 'Error fetching response', sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
      setTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const renderMessage = (msg) => {
    const lines = msg.text.split(/\n|\* /).map((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        return (
          <div key={index} className="mt-1">
            {msg.sender === 'bot' && trimmedLine.startsWith('**') ? (
              <span className="font-bold">{trimmedLine.replace(/\*\*/g, '')}</span>
            ) : (
              <span>{msg.sender === 'bot' ? (index === 0 ? '' : '• ') : ''}{trimmedLine}</span>
            )}
          </div>
        );
      }
      return null; // Skip empty lines
    });

    return (
      <div className={`message mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
        <span className="font-bold">{msg.sender === 'user' ? 'You' : 'Bot'}:</span>
        {lines}
        <button onClick={() => copyToClipboard(msg.text)} className="ml-2 text-blue-500 underline">
          Copy
        </button>
      </div>
    );
  };

  return (
    <div className="chat-container flex flex-col h-screen p-4 border border-gray-300 bg-white">
      <div className="messages overflow-y-auto flex-grow mb-4">
        {messages.map((msg, index) => (
          <div key={index}>
            {renderMessage(msg)}
          </div>
        ))}
        {loading && <div className="text-gray-500">Loading...</div>}
        {typing && <div className="text-gray-500">Bot is typing...</div>}
      </div>
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="border border-gray-300 rounded-lg flex-grow p-2"
        />
        <button type="submit" className="ml-2 bg-blue-500 text-white rounded-lg p-2">
          Send
        </button>
      </form>
      <button onClick={clearChat} className="mt-2 bg-red-500 text-white rounded-lg p-2">
        Clear Chat
      </button>
    </div>
  );
};

export default Chatbot;
