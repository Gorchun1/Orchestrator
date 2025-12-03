import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, TaskStatus, ChatMessage, TeamMember, ContextItem, RebalanceProposal, ProjectClass } from './types';
import { MOCK_PROJECTS, INITIAL_TASKS, INITIAL_TEAM, INITIAL_CONTEXT } from './constants';
import StatusHub from './components/StatusHub';
import ProjectList from './components/ProjectList';
import ChatInterface from './components/ChatInterface';
import ContextPanel from './components/ContextPanel';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE ---
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(MOCK_PROJECTS[0].id);
  
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [contextItems] = useState<ContextItem[]>(INITIAL_CONTEXT);
  const [rebalanceProposals, setRebalanceProposals] = useState<RebalanceProposal[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'm1', sender: 'ai', content: 'Оркестратор онлайн. Контекст загружен. Ожидаю команд.', timestamp: Date.now() }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // --- DERIVED STATE ---
  // Safe fallback if activeProjectId is deleted/invalid
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || MOCK_PROJECTS[0];
  
  const progressPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    const confirmed = tasks.filter(t => t.status === TaskStatus.CONFIRMED).length;
    return (confirmed / tasks.length) * 100;
  }, [tasks]);

  // --- ORCHESTRATOR ENGINE ---
  // Parses the raw text response from Gemini to extract and execute commands
  const executeOrchestratorLogic = (aiResponseText: string) => {
      // Look for [BACKSTAGE] ... [/BACKSTAGE]
      const backstageRegex = /\[BACKSTAGE\]([\s\S]*?)\[\/BACKSTAGE\]/g;
      const match = backstageRegex.exec(aiResponseText);

      if (match && match[1]) {
          const content = match[1];
          // Look for PAYLOAD: { ... }
          const payloadRegex = /PAYLOAD:\s*({[\s\S]*?})(?=\n|$|\[)/;
          const payloadMatch = payloadRegex.exec(content);

          if (payloadMatch && payloadMatch[1]) {
              try {
                  const payload = JSON.parse(payloadMatch[1]);
                  console.log("Orchestrator Executing:", payload);

                  switch(payload.type) {
                      case 'create_task':
                          const newTask: Task = {
                              id: `t${Date.now()}`,
                              title: payload.title || "Новая задача",
                              description: payload.description || "Без описания",
                              status: TaskStatus.WAITING_APPROVAL,
                              assigneeRole: payload.assigneeRole || "Аналитик",
                              source: 'AI'
                          };
                          setTasks(prev => [...prev, newTask]);
                          break;
                      
                      case 'confirm_task':
                           if (payload.taskId) handleConfirmTask(payload.taskId);
                           break;

                      case 'rebalance':
                           const newProposal: RebalanceProposal = {
                               id: `rp${Date.now()}`,
                               reason: payload.reason || "Оптимизация",
                               changes: payload.changes || [],
                               impact: "Высокий",
                               status: 'suggested'
                           };
                           setRebalanceProposals(prev => [...prev, newProposal]);
                           break;
                  }
              } catch (e) {
                  console.error("Failed to parse Orchestrator Payload:", e);
              }
          }
      }
  };

  // --- ACTIONS ---

  const handleSendMessage = async (content: string) => {
    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', content, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newUserMsg]);
    setIsThinking(true);

    // Initialize/Ensures Chat Session
    // We pass history only if starting fresh, but getChatSession handles singleton check
    const history = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    })) as any;

    // Inject Context State into the prompt invisibly
    const contextPrompt = geminiService.buildContextContext(activeProject.kpis, team, tasks);
    const fullPrompt = `${contextPrompt}\n\n[USER INPUT]: ${content}`;

    const aiResponseText = await geminiService.sendMessage(fullPrompt);
    
    setIsThinking(false);
    const newAiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        content: aiResponseText, 
        timestamp: Date.now() 
    };
    setChatMessages(prev => [...prev, newAiMsg]);

    // EXECUTE ENGINE
    executeOrchestratorLogic(aiResponseText);
  };

  const handleConfirmTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: TaskStatus.CONFIRMED } : t
    ));
  };

  const handleAcceptProposal = (propId: string) => {
      setRebalanceProposals([]);
      setTeam(prev => [...prev, {
          id: `tm${Date.now()}`,
          role: 'AI Specialist',
          name: 'Auto_Agent_X',
          effectiveness: 100,
          workload: 0
      }]);
  };

  const handleAddProject = (name: string) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: name,
      description: 'Новый проект в стадии инициализации',
      class: ProjectClass.A_HYBRID,
      kpis: [],
      goals: [],
      subgoals: [],
      status: 'Offline',
      trustScore: 0,
      dataScore: 0,
      complexityScore: 0,
      temperature: 0
    };
    // Force a new array reference to ensure re-render
    setProjects(prev => [...prev, newProject]);
    // Automatically switch to the new project
    setActiveProjectId(newProject.id);
  };

  const handleDeleteProject = (projectId: string) => {
    // Prevent deleting the last project
    if (projects.length <= 1) {
        alert("Нельзя удалить последний активный проект.");
        return;
    }
    
    if (!window.confirm("Вы уверены, что хотите удалить этот проект?")) return;

    const newProjects = projects.filter(p => p.id !== projectId);
    setProjects(newProjects);

    // If we deleted the active project, switch to the first available one to prevent UI crash
    if (activeProjectId === projectId) {
        setActiveProjectId(newProjects[0].id);
    }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      {/* COLUMN 1: NAV (20%) */}
      <div className="w-[260px] flex-shrink-0 z-30 shadow-xl">
        <ProjectList 
            projects={projects} 
            activeProjectId={activeProjectId} 
            onSelectProject={setActiveProjectId}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <StatusHub project={activeProject} progress={progressPercent} />

        <div className="flex-1 flex overflow-hidden">
            {/* COLUMN 2: ACTION/CHAT (55% approx of remaining) */}
            <div className="flex-1 flex flex-col min-w-[500px] border-r border-gray-200">
                <ChatInterface 
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onConfirmTask={handleConfirmTask}
                    isThinking={isThinking}
                />
            </div>

            {/* COLUMN 3: CONTEXT (25% approx of remaining) */}
            <div className="w-[350px] flex-shrink-0 bg-gray-50">
                <ContextPanel 
                    tasks={tasks}
                    contextItems={contextItems}
                    team={team}
                    proposals={rebalanceProposals}
                    onConfirmTask={handleConfirmTask}
                    onAcceptProposal={handleAcceptProposal}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;