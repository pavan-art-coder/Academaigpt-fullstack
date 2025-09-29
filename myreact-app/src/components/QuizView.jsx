// src/components/QuizView.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Paper,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const QuizView = ({ open, onClose, document }) => {
  const [quiz, setQuiz] = useState([]); // Quiz will be an array of questions
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && document) {
      const fetchQuiz = async () => {
        setLoading(true);
        setError('');
        setQuiz([]);
        try {
          // API call to your backend
          const response = await axios.post('/api/tools/quiz', {
            documentId: document.id,
          });
          // Assuming the backend returns { quiz: [ { q: 'Question 1?' }, { q: 'Question 2?' } ] }
          setQuiz(response.data.quiz);
        } catch (error) {
          setError('Failed to generate quiz. Please try again.',error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchQuiz();
    }
  }, [open, document]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }}>
        AI Quiz for "{document?.name}"
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Generating quiz...</Typography>
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}
        {quiz.length > 0 &&
          quiz.map((item, index) => (
            <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Typography fontWeight="bold">Question {index + 1}:</Typography>
              <Typography color="text.secondary">{item.q}</Typography>
            </Paper>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuizView;