import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Typography, TextField, IconButton, CssBaseline, List, ListItemButton, ListItemIcon, 
  ListItemText, Paper, Tooltip, Select, MenuItem, FormControl, Drawer, AppBar, Toolbar, 
  Menu, Switch, Button, CircularProgress, Stack, FormControlLabel, RadioGroup, Radio
} from '@mui/material';
import { createTheme, ThemeProvider, keyframes, styled } from '@mui/material/styles';
import { 
  AttachFile, Send, Summarize, Quiz, AddComment, Logout, Brightness4, Brightness7,
  AccountCircle
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATION & THEME SETUP (No Changes Here) ---
const animStar = keyframes`from { transform: translateY(0px); } to { transform: translateY(-2000px); }`;
const createStars = (c, s) => { let stars = ''; for (let i = 0; i < c; i++) { const x = Math.floor(Math.random() * 2000); const y = Math.floor(Math.random() * 2000); stars += `${x}px ${y}px ${s}, `; } return stars.slice(0, -2); };
const AnimatedBackground = styled(Box)({ minHeight: '100vh', width: '100vw', position: 'fixed', top: 0, left: 0, zIndex: -1, overflow: 'hidden', background: 'linear-gradient(45deg, #0d1b2a, #1b263b, #415a77, #778da9)', backgroundSize: '400% 400%', animation: `${keyframes`0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`} 15s ease infinite`, '&::before': { content: '""', position: 'absolute', width: '1px', height: '1px', color: '#FFF', boxShadow: createStars(600, '1px #FFF'), animation: `${animStar} 50s linear infinite` }, '&::after': { content: '""', position: 'absolute', width: '2px', height: '2px', color: '#FFF', boxShadow: createStars(200, '2px #FFF'), animation: `${animStar} 100s linear infinite` } });
const getDesignTokens = (mode) => ({ palette: { mode, ...(mode === 'dark' ? { primary: { main: '#90caf9' }, background: { default: 'transparent', paper: 'rgba(30, 30, 42, 0.4)' } } : { primary: { main: '#1976d2' }, background: { default: 'transparent', paper: 'rgba(255, 255, 255, 0.5)' } }) }, typography: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' }, components: { MuiPaper: { styleOverrides: { root: { transition: 'background-color 0.3s ease-in-out' } } } } });
const drawerWidth = 280;

// --- UTILITY COMPONENTS ---
// --- UTILITY COMPONENTS ---
const QuizDisplay = ({ quizContent }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const questions = useMemo(() => {
    if (!quizContent || typeof quizContent !== "string") return []; // ✅ prevent crash

    const lines = quizContent.split("\n");
    const parsedQuestions = [];
    let currentQuestion = null;

    lines.forEach((line) => {
      // Detect question like "1." or "2)"
      if (line.match(/^\s*\d+[\.\)]/)) {
        if (currentQuestion) parsedQuestions.push(currentQuestion);
        currentQuestion = {
          question: line.trim(),
          options: [],
          correctAnswer: "",
        };
      } else if (currentQuestion) {
        // Detect options like "a)" / "B." / "C)"
        if (line.match(/^\s*[a-dA-D][\.\)]/)) {
          currentQuestion.options.push(line.trim());
        }
        // Detect correct answer line
        if (line.toLowerCase().includes("correct answer:")) {
          currentQuestion.correctAnswer = line.split(": ")[1]?.trim() || "";
        }
      }
    });

    if (currentQuestion) parsedQuestions.push(currentQuestion);

    return parsedQuestions.map((q) => ({
      ...q,
      options: q.options.filter(
        (o) => !o.toLowerCase().includes("correct answer:")
      ),
    }));
  }, [quizContent]);

  const handleAnswerChange = (questionIndex, value) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  if (!questions.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        No quiz available.
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Quiz
      </Typography>
      {questions.map((q, qIndex) => (
        <Paper
          key={qIndex}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: "rgba(0,0,0,0.05)",
            borderRadius: 2,
          }}
        >
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            {qIndex + 1}. {q.question.replace(/^\s*\d+[\.\)]/, "").trim()}
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              aria-label={`question-${qIndex}`}
              name={`question-${qIndex}`}
              value={selectedAnswers[qIndex] || ""}
              onChange={(e) => handleAnswerChange(qIndex, e.target.value)}
            >
              {q.options.map((option, oIndex) => (
                <FormControlLabel
                  key={oIndex}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {selectedAnswers[qIndex] && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                fontWeight: 500,
                color:
                  selectedAnswers[qIndex] === q.correctAnswer
                    ? "success.main"
                    : "error.main",
              }}
            >
              Your answer: {selectedAnswers[qIndex]}.
              {q.correctAnswer &&
                ` Correct answer: ${q.correctAnswer}`}
            </Typography>
          )}
        </Paper>
      ))}
    </Box>
  );
};


// --- MAIN DASHBOARD COMPONENT ---
const DashboardPage = () => {
    const [themeMode, setThemeMode] = useState('dark');
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    
    const theme = useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);
    const selectedDocument = Array.isArray(documents) ? documents.find(doc => doc._id === selectedDocumentId) : null;
  
    // This function runs once when the page loads
    useEffect(() => {
      const fetchInitialData = async () => {
        setLoading(true);
        const token = localStorage.getItem('app_token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const config = { headers: { Authorization: `Bearer ${token}` } };
  
        try {
          // Fetch the user's uploaded documents
          const docsResponse = await axios.get('/api/documents', config);
          const initialDocs = Array.isArray(docsResponse.data.documents) ? docsResponse.data.documents : [];
          setDocuments(initialDocs);
  
          // If documents exist, load the first one and its chat history
          if (initialDocs.length > 0) {
            const firstDocId = initialDocs[0]._id;
            setSelectedDocumentId(firstDocId);
            const chatResponse = await axios.get(`/api/chat/${firstDocId}`, config);
            setChatHistory(chatResponse.data.messages);
            setChatHistory([{sender: 'ai', text: `Hello! I'm ready to discuss "${initialDocs[0].name}".`}]);
          }
        } catch (error) {
          console.error("Failed to fetch initial data", error);
          if (error.response && error.response.status === 401) {
              navigate('/login'); // If token is invalid, redirect to login
          }
        } finally {
          setLoading(false);
        }
      };
      fetchInitialData();
    }, [navigate]);
  
    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => { 
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [chatHistory]);

    
  const handleDocumentSelect = async (event) => {
  const docId = event.target.value;
  setSelectedDocumentId(docId);

  // Temporary loading message
  setChatHistory([{ sender: 'ai', text: `Loading chat for document...` }]);

  try {
    const token = localStorage.getItem('app_token');
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(`/api/chat/${docId}`, config);

    // Get chat messages from server
    const chatMessages = response.data.messages || [];

    // Get document name
    const selectedDoc = documents.find(d => d._id === docId);

    // Append initial AI message at the top
    setChatHistory([
      { sender: 'ai', text: `I'm ready to discuss "${selectedDoc.name}".` },
      ...chatMessages
    ]);
    
  } catch (error) {
    console.error(`Failed to fetch chat for document ${docId}`, error);
    setChatHistory([{ sender: 'ai', text: 'Could not load chat history for this document.' }]);
  }
};

  const handleNewChat = async () => {
        if (documents.length === 0) {
            alert("Please upload a document before starting a new chat.");
            return;
        }
        // By default, start a new chat with the first document
        const defaultDocId = documents[0]._id;
        const token = localStorage.getItem('app_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        try {
            // Call the new backend endpoint
            const response = await axios.post('/api/chat/new', { documentId: defaultDocId }, config);
            const newChat = response.data;
            setChatSessions(prev => [newChat, ...prev]); // Add new chat to the top of the list
            setActiveChat(newChat); // Make the new chat active
        } catch (error) {
            console.error("Failed to create new chat", error);
            alert("Could not start a new chat session.");
        }
    };

    
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (message.trim() === '' || !selectedDocument) return;
  
      const newUserMessage = { sender: 'user', text: message };
      setChatHistory(prev => [...prev, newUserMessage]);
      const currentMessage = message;
      setMessage('');
  
      try {
        const token = localStorage.getItem('app_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('/api/chat/message', { documentId: selectedDocument._id, message: currentMessage }, config);
        const aiResponse = { sender: 'ai', text: response.data.text };
        setChatHistory(prev => [...prev, aiResponse]);
      } catch (error) {
        setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, an error occurred while processing your request." }]);
      }
    };

    const handleToolClick = async (toolType) => {
      if (!selectedDocument) {
        alert("Please select a document first.");
        return;
      }
  
      const userRequestMessage = { 
        sender: 'user', 
        text: `Generate a ${toolType.toLowerCase()} for the document "${selectedDocument.name}"` 
      };
      const thinkingMessage = { 
        sender: 'ai', 
        text: `Working on the ${toolType.toLowerCase()}...` 
      };
  
      setChatHistory(prev => [...prev, userRequestMessage, thinkingMessage]);
  
      try {
        const token = localStorage.getItem('app_token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const response = await axios.post(`/api/tools/${toolType.toLowerCase()}`, { 
          documentId: selectedDocument._id 
        }, config);
        
        const toolResult = { 
          sender: 'ai', 
          type: toolType, // 'Summary' or 'Quiz'
          title: `Generated ${toolType}`, 
          content: response.data.content 
        };
  
        setChatHistory(prev => [...prev.slice(0, -1), toolResult]);
  
      } catch (error) {
        console.error(`Failed to generate ${toolType.toLowerCase()}:`, error);
        setChatHistory(prev => [...prev.slice(0, -1), { 
          sender: 'ai', 
          text: `Sorry, I failed to generate the ${toolType.toLowerCase()}. Please try again.` 
        }]);
      }
    };
    
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;
  
      const token = localStorage.getItem('app_token');
      if (!token) {
          console.error("No auth token found.");
          navigate('/login');
          return;
      }
  
      const config = {
          headers: {
              'Content-Type': 'multipart/form-data', 
              'Authorization': `Bearer ${token}` 
          }
      };
  
      const formData = new FormData();
      formData.append('document', file);
  
      try {
          const response = await axios.post('/api/documents/upload', formData, config);
          const newDocument = response.data.document;
          setDocuments(prev => [...prev, newDocument]);
          setSelectedDocumentId(newDocument._id);
          setChatHistory([{sender: 'ai', text: `I'm ready to discuss "${newDocument.name}".`}]);
      } catch (error) {
          console.error("File upload failed", error);
          alert("Failed to upload document. Please try again.");
      }
    };
  
    const handleLogout = () => {
      localStorage.removeItem('app_token');
      localStorage.removeItem('user_info');
      navigate('/login');
    };
    
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleThemeToggle = () => setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    
    if (loading) {
      return (
          <ThemeProvider theme={theme}>
              <CssBaseline />
              <AnimatedBackground sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <CircularProgress />
              </AnimatedBackground>
          </ThemeProvider>
      );
    }
  
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnimatedBackground />
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
          <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: 'background.paper', backdropFilter: 'blur(12px)', borderRight: '1px solid rgba(128, 128, 128, 0.2)' } }}>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Button fullWidth variant="outlined" startIcon={<AddComment />} sx={{ mb: 2, py: 1 }}>New Chat</Button>
                  <Typography variant="overline" color="text.secondary" sx={{ px: 2 }}>Your Documents</Typography>
                  <List sx={{ overflowY: 'auto' }}>
                      {(documents).map((doc) => (
                          <ListItemButton key={doc._id} selected={selectedDocumentId === doc._id} onClick={() => setSelectedDocumentId(doc._id)} sx={{ borderRadius: 1 }}>
                              <ListItemText primary={doc.name} primaryTypographyProps={{ noWrap: true }}/>
                          </ListItemButton>
                      ))}
                  </List>
              </Box>
          </Drawer>
          <Box component="main" sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
              <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', backdropFilter: 'blur(12px)' }}>
                  <Toolbar>
                      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                          <FormControl variant="standard" sx={{ minWidth: 240, '& .MuiInput-underline:before, & .MuiInput-underline:after': { borderBottom: 'none' } }}>
                              <Select value={selectedDocumentId || ''} onChange={handleDocumentSelect} sx={{ '.MuiSelect-icon': { color: 'text.primary' }, fontSize: '1.2rem', fontWeight: '500' }}>
                                  {(documents).map(doc => (<MenuItem key={doc._id} value={doc._id}>{doc.name}</MenuItem>))}
                              </Select>
                          </FormControl>
                      </Box>
                      <Tooltip title="Settings"><IconButton onClick={handleMenuOpen}><AccountCircle /></IconButton></Tooltip>
                      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} PaperProps={{ sx: { backdropFilter: 'blur(10px)', backgroundColor: 'background.paper' } }}>
                          <ListItemText sx={{ px: 2, display: 'flex', alignItems: 'center' }}><Typography>Theme</Typography><Brightness4 sx={{ mx: 1 }}/><Switch checked={themeMode === 'dark'} onChange={handleThemeToggle} /><Brightness7 /></ListItemText>
                          <MenuItem onClick={handleLogout}><ListItemIcon><Logout /></ListItemIcon>Logout</MenuItem>
                      </Menu>
                  </Toolbar>
              </AppBar>
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column-reverse' }}>
                  <Box>
                      <AnimatePresence>
                          {chatHistory.map((chat, index) => (
                              <motion.div key={index} layout initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                                  <Box sx={{ mb: 2, display: 'flex', justifyContent: chat.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                                    {/* --- UPDATED RENDERING LOGIC HERE --- */}
                                    {chat.type === 'Quiz' ? (
                                      <Paper sx={{ p: 1.5, maxWidth: '80%', backgroundColor: 'background.paper', color: 'text.primary', borderRadius: '20px 20px 20px 4px', border: '1px solid rgba(128,128,128,0.2)' }}>
                                        <QuizDisplay quizContent={chat.content} />
                                      </Paper>
                                    ) : chat.type === 'Summary' ? (
                                      <Paper sx={{ p: 1.5, maxWidth: '80%', backgroundColor: 'background.paper', color: 'text.primary', borderRadius: '20px 20px 20px 4px', border: '1px solid rgba(128,128,128,0.2)' }}>
                                        <Typography variant="h6" sx={{mb: 1}}>Summary</Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{chat.content}</Typography>
                                      </Paper>
                                    ) : (
                                      <Paper sx={{ p: 1.5, maxWidth: '80%', backgroundColor: chat.sender === 'user' ? 'primary.main' : 'background.paper', color: chat.sender === 'user' ? 'primary.contrastText' : 'text.primary', borderRadius: chat.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px', border: '1px solid rgba(128,128,128,0.2)' }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{chat.text}</Typography>
                                      </Paper>
                                    )}
                                  </Box>
                              </motion.div>
                          ))}
                      </AnimatePresence>
                      <div ref={chatEndRef} />
                  </Box>
              </Box>
              <Box sx={{ p: 2 }}>
                  <Paper component="form" onSubmit={handleSendMessage} sx={{ p: 1, backgroundColor: 'background.paper', backdropFilter: 'blur(12px)', borderRadius: '16px', border: '1px solid rgba(128, 128, 128, 0.2)', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                      <Tooltip title="Upload Document"><IconButton onClick={() => fileInputRef.current.click()}><AttachFile /></IconButton></Tooltip>
                      <Tooltip title="Generate Summary"><IconButton onClick={() => handleToolClick('Summary')}><Summarize /></IconButton></Tooltip>
                      <Tooltip title="Create a Quiz"><IconButton onClick={() => handleToolClick('Quiz')}><Quiz /></IconButton></Tooltip>
                      <TextField fullWidth multiline maxRows={5} variant="standard" placeholder="Ask a question..." value={message} onChange={(e) => setMessage(e.target.value)} InputProps={{ disableUnderline: true }} />
                      <IconButton type="submit" color="primary" sx={{ p: '10px' }}><Send /></IconButton>
                  </Paper>
              </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
};

export default DashboardPage;
