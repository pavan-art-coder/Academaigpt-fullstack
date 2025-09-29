// src/components/SummaryView.jsx

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
} from '@mui/material';
import { Close } from '@mui/icons-material';

const SummaryView = ({ open, onClose, document }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch the summary from the backend when the modal opens
    if (open && document) {
      const fetchSummary = async () => {
        setLoading(true);
        setError('');
        setSummary('');
        try {
          // API call to your backend
          const response = await axios.post('/api/tools/summary', {
            documentId: document.id,
          });
          setSummary(response.data.summary);
        } catch (error) {
          setError('Failed to generate summary. Please try again.',error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchSummary();
    }
  }, [open, document]); // Re-run this effect when the modal opens or the document changes

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 'bold' }}>
        AI Summary of "{document?.name}"
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Generating summary...</Typography>
          </Box>
        )}
        {error && <Typography color="error">{error}</Typography>}
        {summary && (
          <Typography sx={{ whiteSpace: 'pre-wrap' }} color="text.secondary">
            {summary}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SummaryView;