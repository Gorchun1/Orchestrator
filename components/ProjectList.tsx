import React from 'react';
import { Project } from '../types';
import { LayoutGrid, Plus, FolderOpen, Trash2 } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onAddProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject,
  onAddProject,
  onDeleteProject
}) => {

  const handleCreateClick = () => {
      const name = window.prompt("Введите название нового проекта:", "Новый Проект");
      if (name && name.trim()) {
          onAddProject(name.trim());
      }
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-sm font-bold flex items-center gap-2 tracking-wide text-indigo-400">
            <LayoutGrid className="w-4 h-4" />
            ОРКЕСТРАТОР
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <div className="px-3 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Проекты</div>
        {projects.map(p => (
            <div
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className={`w-full px-3 py-2 rounded-md text-sm flex items-center justify-between transition-colors group cursor-pointer ${
                    activeProjectId === p.id 
                    ? 'bg-indigo-600 text-white font-medium shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <FolderOpen className={`w-4 h-4 flex-shrink-0 ${activeProjectId === p.id ? 'text-indigo-200' : 'text-gray-600'}`} />
                    <span className="truncate">{p.name}</span>
                </div>
                
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        onDeleteProject(p.id); 
                    }}
                    className={`p-1.5 rounded hover:bg-white/10 transition-all ${
                        activeProjectId === p.id 
                        ? 'text-indigo-200 hover:text-white' 
                        : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400'
                    }`}
                    title="Удалить проект"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        ))}
        
        <button 
            onClick={handleCreateClick}
            className="w-full mt-4 flex items-center justify-center gap-2 border border-dashed border-gray-700 rounded-md p-2 text-xs text-gray-500 hover:text-white hover:border-gray-500 transition-colors"
        >
            <Plus className="w-3 h-3" />
            Новый проект
        </button>
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"></div>
            <div>
                <div className="text-xs font-bold text-white">Администратор</div>
                <div className="text-[10px] text-gray-500">Pro Лицензия</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;