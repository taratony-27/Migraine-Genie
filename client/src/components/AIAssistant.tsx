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
  userId?: string | number | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ userId: propUserId = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dailyLogs, setDailyLogs] = useState([]);
  
  // Track the actual ID in state so handleSend can access it reliably
  const [activeUserId, setActiveUserId] = useState<string | number | null>(propUserId);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 1. Initial assistant message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Hi, I'm Migraine Genie, your AI assistant focused specifically on migraines and headaches. " +
          "I can help you explore patterns, triggers, lifestyle habits, and questions to ask a real doctor. " +
          "I can't talk about other medical conditions in detail, and I can't diagnose you, " +
          "but I can help you make sense of your migraine symptoms. " +
          "Tell me about your migraines or what you're struggling with right now.",
      },
    ]);
  }, []);

  // 2. Fetch User ID from LocalStorage and Fetch Daily Logs
  useEffect(() => {
    const initializeAssistant = async () => {
      let currentId = activeUserId;

      // If no ID passed via props, check localStorage
      if (!currentId) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Check all common ID variants
            currentId = parsed?.user_id ?? parsed?.id ?? parsed?._id;
            if (currentId) setActiveUserId(currentId);
          } catch (err) {
            console.error('Failed to parse user from local storage:', err);
          }
        }
      }

      // Fetch logs if we have an ID
      if (currentId) {
        try {
          const response = await api.get('/api/daily-inputs', {
            params: { userId: currentId },
          });
          console.log('[AIAssistant] Context logs loaded:', response.data.length);
          setDailyLogs(response.data);
        } catch (error) {
          console.error('[AIAssistant] Failed to fetch daily logs:', error);
        }
      }
    };

    initializeAssistant();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- intentionally mount-only; reads activeUserId at that instant

  // 3. Auto-scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const newUserMessage: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, newUserMessage];

    setMessages(nextMessages);
    setInput('');
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await api.post<{ reply: string; modelUsed: string }>(
        '/api/assistant/doctor-chat',
        {
          userId: activeUserId ?? undefined,
          messages: nextMessages,
          dailyLogs: dailyLogs, // Pass the logs we fetched earlier
        }
      );

      const reply = res.data.reply || 'Sorry, I was unable to respond.';
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('[AIAssistant] Error talking to doctor-chat:', err);
      // 400/429 carry a message meant for the user (too long, too many messages).
      const status = err?.response?.status;
      setErrorMsg(
        (status === 400 || status === 429) && err?.response?.data?.message
          ? err.response.data.message
          : 'The assistant is currently unavailable. Please try again in a moment.'
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
        height: '100%',
        px: 0,
        py: 0,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant="h5" fontWeight={800} gutterBottom>
        AI Migraine Assistant
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" mb={1} textAlign="center">
        Ask migraine and headache-related questions.
      </Typography>

      {activeUserId && dailyLogs.length > 0 && (
        <Typography variant="caption" sx={{ color: 'success.main', textAlign: 'center', mb: 1, display: 'block' }}>
          ● Connected to your migraine history ({dailyLogs.length} logs found)
        </Typography>
      )}

      <Typography variant="caption" color="text.secondary" textAlign="center" mb={2}>
        This assistant does not provide a medical diagnosis. Always consult a professional.
      </Typography>

      <Divider sx={{ mb: 2 }} />

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
          bgcolor: '#fafafa'
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
                  maxWidth: '85%',
                  px: 2,
                  py: 1.2,
                  borderRadius: isUser ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  bgcolor: isUser ? theme.palette.primary.main : 'white',
                  color: isUser ? 'white' : 'text.primary',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  border: isUser ? 'none' : '1px solid #e0e0e0',
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
        <Typography variant="body2" color="error" mb={1} textAlign="center">
          {errorMsg}
        </Typography>
      )}

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
          placeholder="e.g., 'What patterns do you see in my triggers?'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{ maxLength: 2000 }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
        />

        <Button
          variant="contained"
          color="primary"
          endIcon={!loading && <SendIcon />}
          onClick={handleSend}
          disabled={loading || !input.trim()}
          sx={{
            borderRadius: 4,
            px: 3,
            py: 1.5,
            minWidth: isMobile ? '100%' : 120,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Send'}
        </Button>
      </Box>

    </Box>
  );
};

export default AIAssistant;