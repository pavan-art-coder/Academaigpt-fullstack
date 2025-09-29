import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SigupPage'; 
import DashboardPage from './Pages/DashBoardPage';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;