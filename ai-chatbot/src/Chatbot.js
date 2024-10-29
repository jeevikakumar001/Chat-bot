// src/Chatbot.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import './Chatbot.css'; // Import the CSS file

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
          <Box key={index} mt={1}>
            {msg.sender === 'bot' && trimmedLine.startsWith('**') ? (
              <Typography variant="body1" component="strong">{trimmedLine.replace(/\*\*/g, '')}</Typography>
            ) : (
              <Typography variant="body1">
                {msg.sender === 'bot' ? (index === 0 ? '' : '• ') : ''}{trimmedLine}
              </Typography>
            )}
          </Box>
        );
      }
      return null; // Skip empty lines
    });

    return (
      <Box className={`message ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}>
        <Paper
          elevation={2}
          className={`message-paper ${msg.sender === 'user' ? 'message-user-paper' : 'message-bot-paper'}`}
        >
          <Typography variant="subtitle2" fontWeight="bold">{msg.sender === 'user' ? 'You' : 'Bot'}:</Typography>
          {lines}
          <Button onClick={() => copyToClipboard(msg.text)} size="small" variant="outlined" className="copy-button">
            Copy
          </Button>
        </Paper>
      </Box>
    );
  };

  return (
    <Box className="chat-container">
      <Box className="messages">
        {messages.map((msg, index) => (
          <div key={index}>
            {renderMessage(msg)}
          </div>
        ))}
        {loading && <Typography color="textSecondary">Loading...</Typography>}
        {typing && <Typography color="textSecondary">Bot is typing...</Typography>}
      </Box>
      <form onSubmit={handleSubmit} style={{ display: 'flex' }}>
        <TextField
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginLeft: '8px' }}>
          Send
        </Button>
      </form>
      <Button onClick={clearChat} variant="contained" color="secondary" style={{ marginTop: '8px' }}>
        Clear Chat
      </Button>
    </Box>
  );
};

export default Chatbot;
