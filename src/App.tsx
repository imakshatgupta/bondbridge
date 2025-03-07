import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css'
import Layout from './components/Layout';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
