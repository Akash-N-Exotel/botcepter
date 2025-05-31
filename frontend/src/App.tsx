import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BotTestForm from './components/BotTestForm';
import ResultsPage from './pages/ResultsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BotTestForm />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
};

export default App;