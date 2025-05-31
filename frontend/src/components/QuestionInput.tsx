import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Question } from '../types';
import TagInput from './TagInput';

interface QuestionInputProps {
  index: number;
  question: Question;
  onChange: (index: number, field: keyof Question, value: string | string[]) => void;
  total: number;
}

const QuestionInput: React.FC<QuestionInputProps> = ({ index, question, onChange, total }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-all duration-200 hover:border-indigo-300">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Question {index + 1}</h4>
        {total > 1 && (
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {index + 1} of {total}
          </span>
        )}
      </div>
      
      {/* Question Text */}
      <div className="mb-4">
        <label 
          htmlFor={`question-${index}`} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Question Text
        </label>
        <input
          type="text"
          id={`question-${index}`}
          value={question.question}
          onChange={(e) => onChange(index, 'question', e.target.value)}
          placeholder="Enter your question here..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          required
        />
      </div>

      {/* Objectives Tags */}
      <div className="mb-4">
        <TagInput
          tags={question.objectives}
          onTagsChange={(newTags) => onChange(index, 'objectives', newTags)}
          placeholder="Add objectives for this question (press enter or ',' to add another objective)"
          label="Question Objectives"
          helpText="Specific objectives for this question"
        />
      </div>

      {/* Tools Tags */}
      <div className="mb-4">
        <TagInput
          tags={question.tools}
          onTagsChange={(newTags) => onChange(index, 'tools', newTags)}
          placeholder="Add tools for this question (press enter or ',' to add another tool)"
          label="Question Tools"
          helpText="Tools required for this question"
        />
      </div>
      
      {/* Expected Answer */}
      <div>
        <div className="flex items-center mb-1">
          <label 
            htmlFor={`expected-answer-${index}`} 
            className="block text-sm font-medium text-gray-700"
          >
            Expected Answer
          </label>
          <div className="relative ml-2 group">
            <HelpCircle size={14} className="text-gray-400 cursor-help" />
            <div className="absolute z-10 hidden group-hover:block w-64 bg-black text-white text-xs rounded p-2 right-0 transform translate-x-3 -translate-y-1/2">
              This can be exact text, JSON, or keywords that should be present in the bot's response.
            </div>
          </div>
        </div>
        <textarea
          id={`expected-answer-${index}`}
          value={question.expectedAnswer}
          onChange={(e) => onChange(index, 'expectedAnswer', e.target.value)}
          placeholder="Enter expected answer or evaluation criteria..."
          rows={2}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  );
};

export default QuestionInput;