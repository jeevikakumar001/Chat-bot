// src/Chatbot.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // Load chat history from local storage on component mount
  useEffect(() => {
    const savedMessages = JSON.parse(localStorage.getItem('chatHistory'));
    if (savedMessages) {
      setMessages(savedMessages);
    }
  }, []);

  // Save chat history to local storage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent sending empty messages

    const userMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    
    setLoading(true); // Show loading indicator
    setTyping(true); // Show typing indicator for the bot

    // Send the input to the Giemey API
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDhDzKQliukUDAIwA27kNL6RshV8qs02j8', // Updated API key
        {
          contents: [
            {
              parts: [
                {
                  text: input, // Pass the user message as the text part
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

      const reply = response.data.candidates[0]?.content?.parts[0]?.text; // Adjust based on the actual response structure
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
      setLoading(false); // Hide loading indicator
      setTyping(false); // Hide typing indicator after response
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory'); // Clear saved history from local storage
  };

  const renderMessage = (msg) => {
    if (msg.sender === 'bot' && msg.text.startsWith('```')) {
      // Check if the message is a code block
      const codeContent = msg.text.replace(/```/g, '').trim();
      return (
        <pre className="bg-gray-100 border border-gray-300 rounded-lg p-2 mt-1 text-left overflow-x-auto">
          <code>{codeContent}</code>
        </pre>
      );
    } else {
      return <span className="ml-2">{msg.text}</span>;
    }
  };

  return (
    <div className="chat-container p-4 border border-gray-300 rounded-lg shadow-lg max-w-md mx-auto bg-white">
      <div className="messages overflow-y-auto max-h-60 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`message mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`font-bold ${msg.sender === 'user' ? 'text-blue-600' : 'text-gray-600'}`}>
              {msg.sender === 'user' ? 'You' : 'Bot'}:
            </span>
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
