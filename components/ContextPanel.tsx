import React, { useState } from 'react';
import { Task, TaskStatus, ContextItem, TeamMember, RebalanceProposal } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  FileText, 
  Briefcase, 
  History, 
  MoreHorizontal,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Users
} from 'lucide-react';

interface ContextPanelProps {
  tasks: Task[];
  contextItems: ContextItem[];
  team: TeamMember[];
  proposals: RebalanceProposal[];
  onConfirmTask: (id: string) => void;
  onAcceptProposal: (id: string) => void;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ 
  tasks, contextItems, team, proposals, onConfirmTask, onAcceptProposal 
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'knowledge' | 'team'>('tasks');

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.DONE: return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.CONFIRMED: return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case TaskStatus.WAITING_APPROVAL: return 'bg-amber-100 text-amber-800 border-amber-200';
      case TaskStatus.IN_PROGRESS: return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: TaskStatus) => {
      switch (status) {
          case TaskStatus.BACKLOG: return 'Бэклог';
          case TaskStatus.IN_PROGRESS: return 'В работе';
          case TaskStatus.WAITING_APPROVAL: return 'Ожидает';
          case TaskStatus.DONE: return 'Готово';
          case TaskStatus.CONFIRMED: return 'Подтверждено';
          default: return status;
      }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l border-gray-200">
      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'tasks' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Briefcase className="w-4 h-4" />
          Задачи
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'team' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users className="w-4 h-4" />
          Команда
        </button>
        <button 
          onClick={() => setActiveTab('knowledge')}
          className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 ${activeTab === 'knowledge' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <History className="w-4 h-4" />
          Контекст
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
             {/* Backlog / In Progress / Waiting / Done */}
             <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Доска задач</span>
                <span>{tasks.filter(t => t.status === TaskStatus.CONFIRMED).length} / {tasks.length} Готово</span>
             </div>

             {/* Waiting Approval Section - Highlighted */}
             {tasks.filter(t => t.status === TaskStatus.WAITING_APPROVAL).length > 0 && (
                 <div className="mb-4 space-y-2">
                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ
                    </div>
                    {tasks.filter(t => t.status === TaskStatus.WAITING_APPROVAL).map(task => (
                        <div key={task.id} className="bg-white p-3 rounded-lg border border-amber-200 shadow-sm relative group">
                            <h4 className="text-sm font-semibold text-gray-800">{task.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
                            <div className="mt-3 flex justify-between items-center">
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-600">{task.assigneeRole}</span>
                                <button 
                                    onClick={() => onConfirmTask(task.id)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2 py-1 rounded transition-colors"
                                >
                                    Подтвердить
                                </button>
                            </div>
                        </div>
                    ))}
                 </div>
             )}

             {/* Other Tasks */}
             {tasks.filter(t => t.status !== TaskStatus.WAITING_APPROVAL).sort((a,b) => a.status === TaskStatus.CONFIRMED ? 1 : -1).map(task => (
               <div key={task.id} className={`p-3 rounded-lg border shadow-sm ${task.status === TaskStatus.CONFIRMED ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                 <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-semibold ${task.status === TaskStatus.CONFIRMED ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{task.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                    </span>
                 </div>
                 <div className="mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">{task.assigneeRole}</span>
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* TEAM TAB + REBALANCE */}
        {activeTab === 'team' && (
          <div className="space-y-4">
             {/* Auto-Rebalance Widget */}
             {proposals.length > 0 && (
                 <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-indigo-800 font-bold text-xs mb-2">
                        <TrendingUp className="w-4 h-4" />
                        ПРЕДЛОЖЕНИЕ ПО РЕБАЛАНСИРОВКЕ
                    </div>
                    {proposals.map(prop => (
                        <div key={prop.id} className="space-y-2">
                            <p className="text-xs text-indigo-700">{prop.reason}</p>
                            <div className="space-y-1">
                                {prop.changes.map((change, i) => (
                                    <div key={i} className="flex items-center gap-1 text-xs bg-white/50 px-2 py-1 rounded">
                                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                                        {change}
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => onAcceptProposal(prop.id)}
                                className="w-full mt-2 bg-indigo-600 text-white text-xs py-1.5 rounded font-medium hover:bg-indigo-700"
                            >
                                Принять изменения
                            </button>
                        </div>
                    ))}
                 </div>
             )}

             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Активный состав</div>
             {team.map(member => (
                <div key={member.id} className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-sm font-semibold text-gray-800">{member.role}</div>
                        <div className="text-xs text-gray-500">{member.name}</div>
                    </div>
                    <div className="text-right">
                        <div className={`text-xs font-mono font-bold ${member.effectiveness < 70 ? 'text-red-500' : 'text-green-600'}`}>
                            {member.effectiveness}% Эфф
                        </div>
                        <div className="text-[10px] text-gray-400">{member.workload}% Загр</div>
                    </div>
                </div>
             ))}
          </div>
        )}

        {/* KNOWLEDGE TAB */}
        {activeTab === 'knowledge' && (
            <div className="space-y-3">
                 <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-xs text-gray-500 hover:border-indigo-400 hover:text-indigo-500 transition-colors flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    Загрузить / Обновить контекст
                 </button>
                 
                 {contextItems.map(item => (
                     <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors cursor-pointer shadow-sm">
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 p-1.5 rounded ${item.type === 'doc' ? 'bg-blue-100 text-blue-600' : item.type === 'decision' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'}`}>
                                {item.type === 'doc' ? <FileText className="w-3 h-3" /> : item.type === 'decision' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            </div>
                            <div>
                                <h4 className="text-xs font-semibold text-gray-800">{item.title}</h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">{item.date}</p>
                                {item.content && <p className="text-[10px] text-gray-500 mt-1 italic border-l-2 border-gray-200 pl-2">{item.content}</p>}
                            </div>
                        </div>
                     </div>
                 ))}
            </div>
        )}

      </div>
    </div>
  );
};

export default ContextPanel;