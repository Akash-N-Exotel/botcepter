import React, { useState, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import QuestionsOverviewTable from '../components/QuestionsOverviewTable';
import ResultsOverviewTable from '../components/ResultsOverviewTable';
import { Question, QuestionResult } from '../types';

interface LocationState {
  questions: Question[];
  results: QuestionResult[];
}

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setState] = useState<LocationState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('ResultsPage: useEffect triggered');
    console.log('Location state:', location.state);
    
    if (!location.state) {
      console.error('No location state found');
      setError('No test results found. Please run the test first.');
      setIsInitialized(true);
      return;
    }

    try {
      const navigationState = location.state as LocationState;
      
      // Log the exact structure of the state
      console.log('Navigation state structure:', {
        hasQuestions: Array.isArray(navigationState.questions),
        questionsLength: navigationState.questions?.length,
        hasResults: Array.isArray(navigationState.results),
        resultsLength: navigationState.results?.length,
        fullState: navigationState
      });

      // Validate the state structure
      if (!Array.isArray(navigationState.questions)) {
        throw new Error('Invalid questions data structure');
      }
      if (!Array.isArray(navigationState.results)) {
        throw new Error('Invalid results data structure');
      }
      
      // Validate that we have both questions and results
      if (navigationState.questions.length === 0) {
        throw new Error('No questions found in the state');
      }
      if (navigationState.results.length === 0) {
        throw new Error('No results found in the state');
      }

      console.log('Questions:', navigationState.questions);
      console.log('Results:', navigationState.results);
      
      setState(navigationState);
    } catch (error) {
      console.error('Error parsing location state:', error);
      setError(error instanceof Error ? error.message : 'Invalid test results data');
    } finally {
      setIsInitialized(true);
    }
  }, [location.state]);

  // Add debug log before the checks
  console.log('Current state:', {
    error,
    hasState: !!state,
    questionsLength: state?.questions?.length,
    resultsLength: state?.results?.length,
    isInitialized
  });

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading results...</span>
        </div>
      </div>
    );
  }

  // If there's an error, show error state
  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Results</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <a
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Test Form
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Only redirect if we're initialized and have no state
  if (isInitialized && (!state?.questions || !state?.results)) {
    console.log('No valid state after initialization, redirecting to form');
    return <Navigate to="/" replace />;
  }

  // We know state is valid at this point
  const validState = state!;

  console.log('Rendering results page with state:', {
    questionsLength: validState.questions.length,
    resultsLength: validState.results.length
  });

  const getPanelWidth = () => {
    if (!isPanelOpen) return '0px';
    return isExpanded ? '60%' : '400px';
  };

  const getMainContentWidth = () => {
    if (!isPanelOpen) return '100%';
    return isExpanded ? 'calc(40%)' : 'calc(100% - 400px)';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[99%] mx-auto py-6">
        <div 
          style={{ width: getMainContentWidth() }}
          className="transition-all duration-300 ease-in-out overflow-x-auto"
        >
          <div className="bg-white rounded-lg shadow-md min-w-[800px] relative p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Results</h1>
            <ResultsOverviewTable results={validState.results} />
          </div>
        </div>

        {/* Right side - Questions Table (Slide Panel) */}
        <div 
          style={{ width: getPanelWidth() }}
          className={`
            fixed top-0 right-0 h-full bg-white shadow-lg
            transform transition-all duration-300 ease-in-out
            ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}
            z-20 flex flex-col border-l border-gray-200
          `}
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className={`
              absolute -left-7 top-6
              z-30 bg-indigo-600 text-white 
              p-2 rounded-l-md shadow-lg
              hover:bg-indigo-700 transition-all duration-300
              flex items-center justify-center
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
              border-r border-indigo-700
            `}
          >
            {isPanelOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="p-6 flex-grow overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Test Questions</h2>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title={isExpanded ? "Collapse panel" : "Expand panel"}
              >
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
            </div>
            <div className="min-w-[380px]">
              <QuestionsOverviewTable questions={validState.questions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 