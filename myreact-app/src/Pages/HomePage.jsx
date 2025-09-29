import React from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
// 1. IMPORT `styled` TO CREATE OUR ANIMATED COMPONENT
import { createTheme, ThemeProvider, keyframes, styled } from '@mui/material/styles';
import { Link } from 'react-router-dom';
import { UploadFile, QuestionAnswer, Quiz, AutoStories } from '@mui/icons-material';

// --- BACKGROUND ANIMATION SETUP ---

// 2. KEYFRAMES FOR THE NEW STARFIELD ANIMATION
const animStar = keyframes`
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-2000px);
  }
`;

// 3. A HELPER FUNCTION TO GENERATE RANDOM STARS
const createStars = (count, size) => {
  let stars = '';
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 2000);
    stars += `${x}px ${y}px ${size}, `;
  }
  return stars.slice(0, -2); // Remove trailing comma and space
};

// 4. CREATE THE STYLED BOX WITH THE LAYERED, ANIMATED BACKGROUND
const AnimatedBackground = styled(Box)({
  minHeight: '100vh',
  width: '100vw',
  position: 'relative', // Needed for pseudo-elements
  overflow: 'hidden', // Hide stars that move outside the viewport
  // The original animated gradient background
  background: 'linear-gradient(45deg, #0d1b2a, #1b263b, #415a77, #778da9)',
  backgroundSize: '400% 400%',
  animation: `${keyframes`
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  `} 15s ease infinite`,

  // Small stars layer (far away)
  '&::before': {
    content: '""',
    position: 'absolute',
    width: '1px',
    height: '1px',
    color: '#FFF',
    boxShadow: createStars(600, '1px #FFF'),
    animation: `${animStar} 50s linear infinite`,
  },
  // Medium stars layer (closer)
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '2px',
    height: '2px',
    color: '#FFF',
    boxShadow: createStars(200, '2px #FFF'),
    animation: `${animStar} 100s linear infinite`,
  },
});
// --- END OF BACKGROUND ANIMATION SETUP ---

const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h2: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 400 },
  },
});

const features = [
  {
    icon: <UploadFile sx={{ fontSize: 40, color: '#90caf9' }} />,
    title: 'Upload Anything',
    description: 'PDFs, lecture notes, or even screenshots. If you can read it, AcademiaGPT can learn it.',
  },
  {
    icon: <QuestionAnswer sx={{ fontSize: 40, color: '#90caf9' }} />,
    title: 'Ask Questions',
    description: 'Engage in a natural conversation. Ask for summaries, clarifications, or detailed explanations.',
  },
  {
    icon: <Quiz sx={{ fontSize: 40, color: '#90caf9' }} />,
    title: 'Generate Quizzes',
    description: 'Test your knowledge by creating practice quizzes and flashcards directly from your material.',
  },
];

const HomePage = () => {
  return (
    <ThemeProvider theme={modernTheme}>
      <CssBaseline />
      {/* 5. USE THE NEW ANIMATEDBACKGROUND COMPONENT INSTEAD OF THE OLD BOX */}
      <AnimatedBackground>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ py: 1 }}>
            <AutoStories sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              AcademiaGPT
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Button
              component={Link}
              to="/signup"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
              }}
            >
              Sign Up
            </Button>
          </Toolbar>
        </AppBar>

        {/* Hero Section */}
        <Container maxWidth="md" disableGutters>
          <Box
            sx={{
              textAlign: 'center',
              py: { xs: 8, md: 12 },
              px: 2,
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Unlock Your Course Material.
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              Your personal AI assistant for lecture notes, textbooks, and exam prep.
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              sx={{ mt: 4 }}
            >
              <Button
                component={Link}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '8px',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Get Started Free
              </Button>
              <Button component={Link} to="/login" variant="outlined" size="large" sx={{ py: 1.5, px: 4, borderRadius: '8px' }}>
                Log In
              </Button>
            </Stack>
          </Box>
        </Container>

        {/* Features Section */}
        <Container maxWidth="lg" disableGutters sx={{ px: 2, pb: 4 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6, fontWeight: 'bold' }}>
            How It Works
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={8} md={4} key={index}>
                <Box
                  component={Link}
                  to="/signup"
                  sx={{ textDecoration: 'none', display: 'block', height: '100%' }}
                >
                  <Paper
                    elevation={4}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(12px)',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 20px 0 rgba(0, 0, 0, 0.3)',
                      },
                    }}
                  >
                    {feature.icon}
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                      {feature.title}
                    </Typography>
                    <Typography color="text.secondary">{feature.description}</Typography>
                  </Paper>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </AnimatedBackground>
    </ThemeProvider>
  );
};

export default HomePage;