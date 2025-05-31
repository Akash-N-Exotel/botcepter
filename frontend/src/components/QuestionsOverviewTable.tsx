import React from 'react';
import { Question } from '../types';

interface QuestionsOverviewTableProps {
  questions: Question[];
}

const QuestionsOverviewTable: React.FC<QuestionsOverviewTableProps> = ({ questions }) => {
  const renderObjectives = (objectives: string[]) => {
    return (
      <div className="flex flex-wrap gap-1 p-2">
        {objectives.map((objective, index) => (
          <span
            key={`objective-${index}`}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
          >
            {objective}
          </span>
        ))}
      </div>
    );
  };

  const renderTools = (tools: string[]) => {
    return (
      <div className="flex flex-wrap gap-1 p-2">
        {tools.map((tool, index) => (
          <span
            key={`tool-${index}`}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm"
          >
            {tool}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-gray-50 to-white">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
              Question
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
              Expected Answer
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
              Expected Objectives
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
              Expected Tools
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {questions.map((question, index) => (
            <tr key={index} className="transition-colors hover:bg-gray-50">
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis font-medium">
                  {question.question}
                </div>
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis">
                  {question.expectedAnswer}
                </div>
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {renderObjectives(question.objectives)}
              </td>
              <td className="px-6 py-4 border-b border-gray-200">
                {renderTools(question.tools)}
              </td>
            </tr>
          ))}
          {questions.length === 0 && (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 bg-gray-50">
                No questions available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionsOverviewTable; 