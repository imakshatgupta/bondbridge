import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SetupProfile from './pages/SetupProfile';
import './App.css'
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import avatarImage from './assets/avatar.png';

function App() {
  const mockData = {
    user: "John Doe",
    avatar: avatarImage,
    postDate: "2024-03-21",
    caption: "Hello world!",
    image: avatarImage,
    likes: 0,
    comments: 0,
    datePosted: "2 days ago"
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/signup" element={<Layout><Signup /></Layout>} />
        <Route path="/setup-profile" element={<Layout><SetupProfile /></Layout>} />
        <Route path="/" element={<Layout showSidebars={true}><HomePage {...mockData} /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
