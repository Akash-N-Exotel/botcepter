import React from 'react';
import { Bot } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <div className="flex items-center">
          <Bot className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">BotTester</h1>
        </div>
        <p className="ml-4 text-indigo-100 hidden md:block">
          Test your chat or voice bot with structured requests
        </p>
      </div>
    </header>
  );
};

export default Header;