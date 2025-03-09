import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SetupProfile from './pages/SetupProfile';
import './App.css'
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Notifications from './pages/Notifications';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/setup-profile" element={<Layout><SetupProfile /></Layout>} />
        <Route path="/" element={<Layout showSidebars={true}><HomePage /></Layout>} />
        <Route path="/notifications" element={<Layout showSidebars={true}><Notifications /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
