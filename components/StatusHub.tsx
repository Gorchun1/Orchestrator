import React from 'react';
import { Project } from '../types';
import { Activity, ShieldCheck, Thermometer, BarChart3 } from 'lucide-react';

interface StatusHubProps {
  project: Project;
  progress: number; // 0-100
}

const StatusHub: React.FC<StatusHubProps> = ({ project, progress }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm z-20">
      {/* Left: Project Identity */}
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">
          {project.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 className="text-sm font-bold text-gray-900">{project.name}</h1>
          <span className="text-xs text-gray-500 font-mono tracking-wide">{project.class} | {project.status === 'Online' ? 'Онлайн' : 'Офлайн'}</span>
        </div>
      </div>

      {/* Center: Metrics Grid */}
      <div className="flex items-center space-x-8 text-xs font-medium text-gray-600">
        <div className="flex items-center space-x-2" title="Температура системы">
          <Thermometer className="w-4 h-4 text-orange-500" />
          <span>ТЕМП {project.temperature}</span>
        </div>
        <div className="flex items-center space-x-2" title="Оценка соответствия (Сложность)">
          <Activity className="w-4 h-4 text-blue-500" />
          <span>СЛОЖН {project.complexityScore}</span>
        </div>
        <div className="flex items-center space-x-2" title="Оценка доверия">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>ДОВЕРИЕ {project.trustScore}%</span>
        </div>
        <div className="flex items-center space-x-2" title="Полнота данных">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <span>ДАННЫЕ {project.dataScore}</span>
        </div>
      </div>

      {/* Right: Circular Progress Widget */}
      <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
        <div className="text-right">
          <div className="text-xs font-bold text-indigo-900">ПРОГРЕСС</div>
          <div className="text-[10px] text-gray-500">Подтверждено</div>
        </div>
        <div className="relative w-10 h-10">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth="3"
            />
            <circle
              cx="20"
              cy="20"
              r={radius}
              fill="transparent"
              stroke="#4f46e5"
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-700">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusHub;