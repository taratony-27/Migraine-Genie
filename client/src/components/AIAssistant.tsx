import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
  TextField,
  Paper,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../services/api';

type ChatRole = 'user' | 'assistant';

type ChatMessage = {
  role: ChatRole;
  content: string;
};

interface AIAssistantProps {
  userId: string | number | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // inside useEffect initial messages
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi, I'm Migraine Genie, your AI assistant focused specifically on migraines and headaches. " +
          "I can help you explore patterns, triggers, lifestyle habits, and questions to ask a real doctor. " +
          "I can't talk about other medical conditions in detail, and I can't diagnose you, but I can help you make sense of your migraine symptoms. " +
          "Tell me about your migraines or what you're struggling with right now.",
      },
    ]);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: trimmed };

    // Optimistic UI update
    const nextMessages = [...messages, newUserMessage];
    setMessages(nextMessages);
    setInput('');
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string; modelUsed: string }>(
        '/api/assistant/doctor-chat',
        {
          userId: userId ?? undefined,
          messages: nextMessages,
        }
      );

      const reply = res.data.reply || 'Sorry, I was unable to respond.';
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('[AIAssistant] Error talking to doctor-chat:', err);
      setErrorMsg(
        'The assistant is currently unavailable. Please try again in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      sx={{
        height: isMobile ? 'auto' : '100%',
        maxHeight: 'none',
        px: isMobile ? 2 : 4,
        py: isMobile ? 2 : 6,
        boxSizing: 'border-box',
      }}
    >
      {!isMobile && (
        <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
          AI Migraine Assistant
        </Typography>
      )}

      <Typography
        variant="subtitle1"
        color="text.secondary"
        mb={2}
        textAlign="center"
      >
        Ask migraine and headache-related questions. I’ll help you explore patterns,
        triggers, and lifestyle strategies around your migraines.
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        textAlign="center"
        mb={2}
      >
        This assistant does not provide a medical diagnosis. Always consult a healthcare
        professional for medical decisions.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* Chat area */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 280,
          maxHeight: isMobile ? 400 : 480,
          p: 2,
          mb: 2,
          overflowY: 'auto',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: isUser ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  maxWidth: '80%',
                  px: 2,
                  py: 1.2,
                  borderRadius: 3,
                  bgcolor: isUser
                    ? theme.palette.primary.main
                    : theme.palette.grey[100],
                  color: isUser
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.primary,
                  boxShadow: isUser
                    ? '0 2px 6px rgba(0,0,0,0.25)'
                    : '0 1px 3px rgba(0,0,0,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2">{msg.content}</Typography>
              </Box>
            </Box>
          );
        })}

        <div ref={bottomRef} />
      </Paper>

      {errorMsg && (
        <Typography variant="body2" color="error" mb={1}>
          {errorMsg}
        </Typography>
      )}

      {/* Input area */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          placeholder="Describe your migraine, triggers, or questions..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <Button
          variant="contained"
          color="primary"
          endIcon={!loading && <SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{
            borderRadius: 8,
            px: 3,
            py: 1,
            minWidth: isMobile ? '100%' : 140,
            height: isMobile ? 'auto' : '100%',
            whiteSpace: 'nowrap',
          }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Send'
          )}
        </Button>
      </Box>

      {/* Optional CTA under chat */}
      <Box textAlign="center" mt={3}>
        <Button
          variant="outlined"
          size="small"
          href="/goal-tracker"
          sx={{ borderRadius: 8 }}
        >
          Open Goal Tracker
        </Button>
      </Box>
    </Box>
  );
};

export default AIAssistant;
