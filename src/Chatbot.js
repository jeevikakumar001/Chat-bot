// src/Chatbot.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, TextField, Typography, Paper, CircularProgress, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import './Chatbot.css'; // Import the CSS file

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

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

    // Simulate bot typing delay
    setTimeout(async () => {
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
        const errorMessage = { text: 'Error fetching response. Please try again.', sender: 'bot' };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
        setSnackbarMessage('Error fetching response. Please try again.');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
        setTyping(false);
      }
    }, 1000); // Simulated delay for typing
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setSnackbarMessage('Copied to clipboard!');
        setSnackbarOpen(true);
      })
      .catch((err) => {
        console.error('Could not copy text: ', err);
      });
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
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
        {loading && <CircularProgress color="primary" />}
        {typing && <Typography color="textSecondary">Bot is typing...</Typography>}
      </Box>
      <form onSubmit={handleSubmit} className="input-container">
        <TextField
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          fullWidth
          onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
        />
        <Button type="submit" variant="contained" color="primary" style={{ marginLeft: '8px' }}>
          Send
        </Button>
      </form>
      <Button onClick={clearChat} variant="contained" color="secondary" className="clear-chat-button">
        Clear Chat
      </Button>
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chatbot;
