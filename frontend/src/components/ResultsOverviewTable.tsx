import React, { useMemo } from 'react';
import { CheckCircle, XCircle, Target, Wrench, MessageSquare, PhoneForwarded, PieChart } from 'lucide-react';
import { QuestionResult } from '../types';

interface ResultsOverviewTableProps {
  results: QuestionResult[];
}

const ResultsOverviewTable: React.FC<ResultsOverviewTableProps> = ({ results }) => {
  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    
    return {
      total,
      passed,
      failed,
      passRate: passRate.toFixed(1)
    };
  }, [results]);

  // Group results by test run ID
  const groupedResults = useMemo(() => {
    const groups = new Map<number, QuestionResult[]>();
    results.forEach(result => {
      const existing = groups.get(result.testRunId) || [];
      groups.set(result.testRunId, [...existing, result]);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [results]);

  const renderObjectives = (objectives: string[], expectedObjectives: string[]) => {
    const allMatch = expectedObjectives.every(obj => objectives.includes(obj)) && 
                    objectives.length === expectedObjectives.length;
    
    return {
      content: (
        <div className={`flex flex-col gap-2 p-2 rounded-md ${allMatch ? 'bg-green-50' : 'bg-red-50'}`}>
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Expected:</div>
            <div className="flex flex-wrap gap-1">
              {expectedObjectives.map((objective, index) => (
                <span
                  key={`expected-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                >
                  {objective}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Used:</div>
            <div className="flex flex-wrap gap-1">
              {objectives.map((objective, index) => (
                <span
                  key={`used-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 shadow-sm"
                >
                  {objective}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
      isMatch: allMatch
    };
  };

  const renderTools = (tools: string[], expectedTools: string[]) => {
    const allMatch = expectedTools.every(tool => tools.includes(tool)) && 
                    tools.length === expectedTools.length;
    
    return {
      content: (
        <div className={`flex flex-col gap-2 p-2 rounded-md ${allMatch ? 'bg-green-50' : 'bg-red-50'}`}>
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Expected:</div>
            <div className="flex flex-wrap gap-1">
              {expectedTools.map((tool, index) => (
                <span
                  key={`expected-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Used:</div>
            <div className="flex flex-wrap gap-1">
              {tools.map((tool, index) => (
                <span
                  key={`used-${index}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200 shadow-sm"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
      isMatch: allMatch
    };
  };

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <PieChart className="h-5 w-5 text-indigo-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">Results Summary</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{summary.total}</div>
            <div className="text-sm text-gray-500">Total Tests</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{summary.passed}</div>
            <div className="text-sm text-green-600">Passed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
            <div className="text-sm text-red-600">Failed</div>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-indigo-700">{summary.passRate}%</div>
            <div className="text-sm text-indigo-600">Pass Rate</div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-white">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                #
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                  Question
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1 text-gray-400" />
                  Objectives
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 mr-1 text-gray-400" />
                  Tools
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                  Response
                </div>
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b-2 border-gray-200">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {groupedResults.map(([testRunId, testResults], groupIndex) => (
              <React.Fragment key={testRunId}>
                {testResults.map((result, index) => {
                  const objectivesResult = renderObjectives(result.usedObjectives, result.expectedObjectives);
                  const toolsResult = renderTools(result.usedTools, result.expectedTools);
                  
                  return (
                    <tr 
                      key={`${testRunId}-${index}`} 
                      className={`
                        transition-colors hover:bg-gray-50 group
                        ${groupIndex > 0 && index === 0 ? 'border-t-4 border-gray-300' : ''}
                      `}
                    >
                      {index === 0 && (
                        <td 
                          className="px-4 py-3 whitespace-nowrap text-lg font-semibold text-indigo-600 bg-indigo-50 border-r border-indigo-100"
                          rowSpan={testResults.length}
                        >
                          {testRunId}
                        </td>
                      )}
                      <td className="px-4 py-3 border-b border-gray-200">
                        <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis font-medium">
                          {result.question}
                        </div>
                      </td>
                      <td className="px-6 py-4 border">
                        {objectivesResult.content}
                      </td>
                      <td className="px-6 py-4 border">
                        {toolsResult.content}
                      </td>
                      <td className="px-6 py-4 border">
                        <div className="text-sm text-gray-900 max-w-xs overflow-hidden overflow-ellipsis">
                          {result.event === 'transfer_call' ? (
                            <div className="flex items-center text-orange-600">
                              <PhoneForwarded className="h-4 w-4 mr-1" />
                              Call Transferred
                            </div>
                          ) : result.actualAnswer}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {result.passed ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm group-hover:shadow">
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Passed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 shadow-sm group-hover:shadow">
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Failed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 bg-gray-50">
                  <div className="flex flex-col items-center">
                    <Target className="h-8 w-8 text-gray-400 mb-2" />
                    No results available
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsOverviewTable; 