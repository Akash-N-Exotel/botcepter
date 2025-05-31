import { Bot } from '../types';

export const bots: Bot[] = [
  {
    id: 'gpt-chat',
    name: 'GPT Chat Assistant',
    type: 'chat',
    endpoint: 'https://api.example.com/gpt-chat'
  },
  {
    id: 'claude-chat',
    name: 'Claude Chat Assistant',
    type: 'chat',
    endpoint: 'https://api.example.com/claude-chat'
  },
  {
    id: 'alexa-voice',
    name: 'Alexa Voice Assistant',
    type: 'voice',
    endpoint: 'https://api.example.com/alexa-voice'
  },
  {
    id: 'siri-voice',
    name: 'Siri Voice Assistant',
    type: 'voice',
    endpoint: 'https://api.example.com/siri-voice'
  }
];