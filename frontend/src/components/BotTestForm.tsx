import React, { useState, useMemo, useEffect } from 'react';
import { Send, Plus, Minus, HelpCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuestionInput from './QuestionInput';
import QuestionsOverviewTable from './QuestionsOverviewTable';
import ResultsOverviewTable from './ResultsOverviewTable';
import {
  Question,
  FormData,
  BotType,
  ApiQuestion,
  ApiResponse,
  TestRunResult,
  ConversationResult,
  TestResult,
  QuestionResult
} from '../types';
import { bots } from '../data/bots';

const FORM_DATA_STORAGE_KEY = 'botTestFormData';

const API_ENDPOINT = 'https://e802-2401-4900-8813-ac84-60fb-81a8-3cae-164f.ngrok-free.app';

// Pre-populated test data
const DEFAULT_TEST_DATA: FormData = {
  selectedBotType: 'chat',
  selectedBotId: 'test_bot_1',
  testCount: 1,
  numQuestions: 5,
  questions: [
    {
      question: "i need to know what all item was picked up",
      expectedAnswer: "your order involve ",
      objectives: ["Handle_Order_Related_Queries"],
      tools: ["answer_order_related_queries"]
    },
    {
      question: "i need to know the order status again",
      expectedAnswer: "The weather is sunny with a high of 25 degrees.",
      objectives: ["Handle_Order_Related_Queries"],
      tools: ["get_order_status"]
    },
    {
      question: "i want to cancel the order",
      expectedAnswer: "The weather is sunny with a high of 25 degrees.",
      objectives: ["Handle_Order_Cancellation_Queries"],
      tools: ["get_order_cancellation_details"]
    },
    {
      question: "what is the status of my refund",
      expectedAnswer: "Let me check your refund status.",
      objectives: ["Handle_Refund_Queries"],
      tools: ["check_refund_status"]
    },
    {
      question: "i want to modify my delivery address",
      expectedAnswer: "I can help you update your delivery address.",
      objectives: ["Handle_Delivery_Modification"],
      tools: ["update_delivery_address"]
    }
  ]
};

const BotTestForm: React.FC = () => {
  const navigate = useNavigate();

  // Initialize form data from localStorage if available
  const [formData, setFormData] = useState<FormData>(() => {
    console.log("Initializing form data");
    // Start with default test data
    const initialData = {...DEFAULT_TEST_DATA};
    
    try {
      const savedData = localStorage.getItem(FORM_DATA_STORAGE_KEY);
      if (!savedData) {
        console.log("No saved data found, using default test data");
        return initialData;
      }

      const parsedData = JSON.parse(savedData);
      console.log("Found saved data:", parsedData);
      
      // Validate the saved data structure
      if (!parsedData.questions || !Array.isArray(parsedData.questions) || 
          parsedData.questions.length === 0 || parsedData.questions.length !== parsedData.numQuestions) {
        console.log("Invalid saved data structure, using default test data");
        return initialData;
      }

      // Validate each question has required fields
      const isValidQuestion = (q: any): q is Question => {
        return q.question !== undefined && 
               q.expectedAnswer !== undefined && 
               Array.isArray(q.objectives) && 
               Array.isArray(q.tools);
      };

      if (!parsedData.questions.every(isValidQuestion)) {
        console.log("Invalid question data found, using default test data");
        return initialData;
      }

      return parsedData;
    } catch (e) {
      console.error('Error handling saved form data:', e);
      return initialData;
    }
  });

  // Save form data to localStorage whenever it changes, but debounce it
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      console.log("Saving form data to localStorage:", formData);
      localStorage.setItem(FORM_DATA_STORAGE_KEY, JSON.stringify(formData));
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  const filteredBots = useMemo(() => {
    return bots.filter(bot => bot.type === formData.selectedBotType);
  }, [formData.selectedBotType]);

  // Create dummy results based on form data and test count
  const dummyResults = useMemo(() => {
    const allResults: QuestionResult[] = [];

    // For each test run
    for (let testRun = 1; testRun <= formData.testCount; testRun++) {
      // For each question in the test
      formData.questions.forEach((q, qIndex) => {
        // Randomly decide whether to match or differ for each field
        const matchObjectives = Math.random() > 0.3;
        const matchTools = Math.random() > 0.3;
        const matchAnswer = Math.random() > 0.3;

        // Generate actual values based on matching decision
        const usedObjectives = matchObjectives
          ? q.objectives
          : [...q.objectives, 'Additional Objective'];

        const usedTools = matchTools
          ? q.tools
          : [...q.tools, 'Additional Tool'];

        const actualAnswer = matchAnswer
          ? q.expectedAnswer
          : q.expectedAnswer + ' (with some differences)';

        allResults.push({
          question: q.question || `Test Question ${qIndex + 1}`,
          expectedAnswer: q.expectedAnswer || `Expected Answer ${qIndex + 1}`,
          actualAnswer,
          expectedObjectives: q.objectives,
          expectedTools: q.tools,
          usedObjectives,
          usedTools,
          event: 'response',
          passed: matchObjectives && matchTools && matchAnswer,
          testRunId: testRun,
          sessionId: `dummy-session-${testRun}`
        });
      });
    }

    return allResults;
  }, [formData.questions, formData.testCount]);

  const handleBotTypeChange = (type: BotType) => {
    setFormData(prev => ({
      ...prev,
      selectedBotType: type,
      selectedBotId: ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleNumQuestionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const numQuestions = Math.max(1, Math.min(10, value));
    console.log("Changing number of questions to:", numQuestions);

    let updatedQuestions = [...formData.questions];

    if (numQuestions > updatedQuestions.length) {
      // When adding new questions, use the test data questions if available
      const additionalQuestions = Array(numQuestions - updatedQuestions.length)
        .fill(null)
        .map((_, index) => {
          const testQuestion = DEFAULT_TEST_DATA.questions[updatedQuestions.length + index];
          if (testQuestion) {
            return {...testQuestion}; // Create a new object to avoid reference issues
          }
          return {
            question: '',
            expectedAnswer: '',
            objectives: [],
            tools: []
          };
        });
      updatedQuestions = [...updatedQuestions, ...additionalQuestions];
    } else {
      updatedQuestions = updatedQuestions.slice(0, numQuestions);
    }

    console.log("Updated questions:", updatedQuestions);
    setFormData(prevData => ({
      ...prevData,
      numQuestions,
      questions: updatedQuestions
    }));
  };

  const adjustQuestionCount = (amount: number) => {
    const newValue = Math.max(1, Math.min(10, formData.numQuestions + amount));

    const event = {
      target: {
        value: newValue.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;

    handleNumQuestionsChange(event);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: string | string[]) => {
    console.log(`Updating question ${index}, field ${field}:`, value);
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };

    setFormData(prevData => ({
      ...prevData,
      questions: updatedQuestions
    }));
  };

  const transformToApiQuestions = (questions: Question[]): ApiQuestion[] => {
    return questions.map(q => ({
      question: q.question,
      expected_answer: q.expectedAnswer,
      expected_objectives: q.objectives,
      expected_tools: q.tools
    }));
  };

  const transformResponseToResults = (response: ApiResponse): QuestionResult[] => {
    console.log('Starting response transformation');
    const allResults: QuestionResult[] = [];

    response.data.forEach((testRun: TestRunResult, testRunIndex: number) => {
      console.log(`Processing test run ${testRunIndex + 1}:`, testRun);

      testRun.conversation.forEach((conv: ConversationResult, convIndex: number) => {
        console.log(`Processing conversation ${convIndex + 1}:`, conv);

        const result: QuestionResult = {
          question: conv.question,
          expectedAnswer: '', // We don't get this from the API
          actualAnswer: conv.event === 'transfer_call' ? 'Call Transferred' : conv.response,
          expectedObjectives: conv.expected_objectives,
          expectedTools: conv.expected_tools,
          usedObjectives: conv.used_objectives || [],
          usedTools: conv.used_tool_calls || [],
          event: conv.event,
          passed: conv.is_passed || false,
          testRunId: testRunIndex + 1,
          sessionId: testRun.session_id
        };

        console.log('Created result:', result);
        allResults.push(result);
      });
    });

    console.log('Final transformed results:', allResults);
    return allResults;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Use form values for the payload
      const payload = {
        hostname: "192.168.1.24:8003",  // Keep this hardcoded for now
        bot_name: "MandateTestingBot3", // Keep this hardcoded for now
        call_count: formData.testCount,
        questions: formData.questions.map(q => ({
          question: q.question,
          expected_answer: q.expectedAnswer,
          expected_objectives: q.objectives,
          expected_tools: q.tools
        }))
      };

      console.log('Sending API request with payload:', payload);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data: ApiResponse = await response.json();
      console.log('Received API response:', data);

      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'An error occurred while testing the bot';
        console.error('API Error:', errorMessage);
        throw new Error(errorMessage);
      }

      // Transform the API response into our QuestionResult format
      const transformedResults = transformResponseToResults(data);
      console.log('Transformed results:', transformedResults);

      // Navigate to results page with the transformed results
      const navigationState = {
        results: transformedResults,
        questions: payload.questions.map(q => ({
          question: q.question,
          expectedAnswer: q.expected_answer,
          objectives: q.expected_objectives,
          tools: q.expected_tools
        }))
      };

      console.log('Navigating to results with state:', navigationState);

      // Use navigate with state
      navigate('/results', {
        state: navigationState
      });

    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setIsLoading(false);
    }
  };

  // Add a function to clear form data
  const clearFormData = () => {
    console.log("Clearing form data, setting to default test data");
    const freshData = {...DEFAULT_TEST_DATA};
    setFormData(freshData);
  };

  // Log form data on every render
  console.log("Current form data:", formData);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Send className="h-6 w-6 text-indigo-500 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-800">Bot Testing Platform</h1>
          </div>
          <button
            type="button"
            onClick={clearFormData}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bot Type Selection */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  type="button"
                  onClick={() => handleBotTypeChange('chat')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${formData.selectedBotType === 'chat'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Chat Bots
                </button>
                <button
                  type="button"
                  onClick={() => handleBotTypeChange('voice')}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${formData.selectedBotType === 'voice'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  `}
                >
                  Voice Bots
                </button>
              </nav>
            </div>

            {/* Bot Selection Dropdown */}
            <div>
              <label htmlFor="selectedBotId" className="block text-sm font-medium text-gray-700 mb-1">
                Select Bot
              </label>
              <select
                id="selectedBotId"
                name="selectedBotId"
                value={formData.selectedBotId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              >
                <option value="">Select a bot...</option>
                {filteredBots.map(bot => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Test Count */}
            <div>
              <label htmlFor="testCount" className="block text-sm font-medium text-gray-700 mb-1">
                Test Count
              </label>
              <input
                type="number"
                id="testCount"
                name="testCount"
                min="1"
                value={formData.testCount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                required
              />
              <p className="mt-1 text-sm text-gray-500">
                Number of times to run the test suite
              </p>
            </div>

            {/* Number of Questions */}
            <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Questions
              </label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => adjustQuestionCount(-1)}
                  disabled={formData.numQuestions <= 1}
                  className="p-2 bg-gray-100 rounded-l-md border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={30} />
                </button>
                <input
                  type="number"
                  id="numQuestions"
                  name="numQuestions"
                  min="1"
                  max="10"
                  value={formData.numQuestions}
                  onChange={handleNumQuestionsChange}
                  className="w-20 text-center px-2 py-2 border-t border-b border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => adjustQuestionCount(1)}
                  disabled={formData.numQuestions >= 10}
                  className="p-2 bg-gray-100 rounded-r-md border border-gray-300 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={30} />
                </button>
                <span className="ml-2 text-sm text-gray-500">(Max: 10)</span>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Questions</h3>

              {formData.questions.map((question, index) => (
                <QuestionInput
                  key={index}
                  index={index}
                  question={question}
                  onChange={handleQuestionChange}
                  total={formData.questions.length}
                />
              ))}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin mr-2" />
                    Testing Bot...
                  </>
                ) : (
                  <>
                    <Send size={20} className="mr-2" />
                    Test Bot
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BotTestForm;