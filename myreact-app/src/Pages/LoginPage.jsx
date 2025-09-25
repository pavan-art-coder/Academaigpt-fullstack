import React, { useState } from 'react';
import axios from 'axios';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import {app} from '../config/firebase-config';

import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  CssBaseline,
  Divider,
} from '@mui/material';
import { createTheme, ThemeProvider, keyframes, styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { MailOutline, LockOutline, AutoStories } from '@mui/icons-material';
import { motion } from 'framer-motion';


const animStar = keyframes`from { transform: translateY(0px); } to { transform: translateY(-2000px); }`;
const createStars = (c, s) => { let stars = ''; for (let i = 0; i < c; i++) { const x = Math.floor(Math.random() * 2000); const y = Math.floor(Math.random() * 2000); stars += `${x}px ${y}px ${s}, `; } return stars.slice(0, -2); };
const AnimatedBackground = styled(Box)({ minHeight: '100vh', width: '100vw', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '1rem', background: 'linear-gradient(45deg, #0d1b2a, #1b263b, #415a77, #778da9)', backgroundSize: '400% 400%', animation: `${keyframes`0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; }`} 15s ease infinite`, '&::before': { content: '""', position: 'absolute', width: '1px', height: '1px', color: '#FFF', boxShadow: createStars(600, '1px #FFF'), animation: `${animStar} 50s linear infinite` }, '&::after': { content: '""', position: 'absolute', width: '2px', height: '2px', color: '#FFF', boxShadow: createStars(200, '2px #FFF'), animation: `${animStar} 100s linear infinite` } });
const modernTheme = createTheme({ palette: { mode: 'dark', primary: { main: '#90caf9' }, background: { default: '#121212' } }, typography: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif', h4: { fontWeight: 700 } } });
const GoogleIcon = () => ( <svg viewBox="0 0 48 48" width="24px" height="24px"> <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" /> <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" /> <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" /> <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.1,4.218-3.964,5.571l6.19,5.238C42.018,35.138,44,30.024,44,24C44,22.659,43.862,21.35,43.611,20.083z" /> </svg> );


const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('Login successful:', response.data);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Invalid email or password.';
      setError(errorMessage);
    }
  };

  const signInWithGoogle = async () => {
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      
      const idToken = await user.getIdToken();
      
      const response = await axios.post('/api/auth/google-signin', { 
        token: idToken 
      });

      console.log('Google login successful:', response.data);
      localStorage.setItem('app_token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error("Firebase login error:", err);
      setError("Failed to log in with Google. Please try again.");
    }
  };
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      <AnimatedBackground>
        <Box sx={{ zIndex: 1, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <AutoStories sx={{ fontSize: 50 }} />
              <Typography variant="h3" fontWeight="bold">AcademiaGPT</Typography>
            </Box>
          </motion.div>
          <motion.div style={{ width: '100%' }} variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants}>
              <Typography component="h1" variant="h4" align="center" gutterBottom> Welcome Back </Typography>
            </motion.div>
            <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 1 }}>
              <motion.div variants={itemVariants}>
                <TextField variant="filled" margin="normal" required fullWidth label="Email Address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><MailOutline /></InputAdornment>), disableUnderline: true }} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 2 }} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <TextField variant="filled" margin="normal" required fullWidth name="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutline /></InputAdornment>), disableUnderline: true }} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 2 }} />
              </motion.div>
              {error && <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>{error}</Typography>}
              <motion.div variants={itemVariants}>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.5, borderRadius: '8px', background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-2px)' } }}>
                  Log In
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Divider sx={{ my: 2 }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>OR</Typography></Divider>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button onClick={signInWithGoogle}fullWidth variant="contained" startIcon={<GoogleIcon />} sx={{ py: 1.5, backgroundColor: '#fff', color: '#000', borderRadius: '8px', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                  Sign In with Google
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Box textAlign="center" sx={{ mt: 2 }}>
                  <Link to="/signup" style={{ color: '#90caf9', textDecoration: 'none' }}>
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Box>
              </motion.div>
            </Box>
          </motion.div>
        </Box>
      </AnimatedBackground>
    </ThemeProvider>
  );
};

export default LoginPage;