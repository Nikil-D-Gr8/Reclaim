import type { Mode } from '../types/api';
import { BookOpen, Code2, Calculator } from 'lucide-react';

interface ModeSelectionProps {
  onSelectMode: (mode: Mode) => void;
}

const modes: Array<{
  id: Mode;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: 'writing',
    label: 'Writing',
    description: 'Improve your writing skills through guided practice',
    icon: <BookOpen size={40} />,
  },
  {
    id: 'coding',
    label: 'Coding',
    description: 'Learn programming concepts and solve problems',
    icon: <Code2 size={40} />,
  },
  {
    id: 'math',
    label: 'Math',
    description: 'Master mathematical concepts and techniques',
    icon: <Calculator size={40} />,
  },
];

export function ModeSelection({ onSelectMode }: ModeSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Reclaim</h1>
          <p className="text-xl text-gray-600">
            Choose a learning mode to get started
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Learn by thinking, not by outsourcing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 hover:border-blue-500"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="text-blue-600 group-hover:scale-110 transition-transform">
                  {mode.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {mode.label}
                  </h2>
                  <p className="text-gray-600 text-sm">{mode.description}</p>
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
