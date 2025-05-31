import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BotTestForm from './components/BotTestForm';
import ResultsPage from './pages/ResultsPage';
import Chat from './components/Chat';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="container mx-auto">
          <Routes>
            <Route path="/" element={
              <div className="flex gap-8">
                <div className="flex-1">
                  <BotTestForm />
                </div>
                <div className="w-[400px]">
                  <div className="sticky top-4">
                    <Chat />
                  </div>
                </div>
              </div>
            } />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;