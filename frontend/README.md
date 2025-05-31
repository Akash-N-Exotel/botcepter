# Botcepter Frontend

A React-based frontend application for testing and interacting with bots through a chat interface.

## Prerequisites

- Node.js (v16 or higher)
- npm (Node Package Manager)

## Setup and Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/botcepter.git
cd botcepter/frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Configure the API endpoint in `src/constants.ts`:
```typescript
export const API_URL = 'your-api-url';
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Features

- Bot testing interface
- Live chat functionality
- Real-time bot responses
- Display of bot objectives and tool calls
- Modern, responsive UI

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── BotTestForm.tsx
│   │   ├── Chat.tsx
│   │   └── ...
│   ├── pages/
│   │   └── ResultsPage.tsx
│   ├── constants.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM 