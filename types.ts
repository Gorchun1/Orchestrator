export enum ProjectClass {
  A_IT = 'A_IT',
  A_MKT = 'A_MKT',
  A_DATA = 'A_DATA',
  A_OPS = 'A_OPS',
  A_SALES = 'A_SALES',
  A_HYBRID = 'A_HYBRID'
}

export enum TaskStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  WAITING_APPROVAL = 'waiting_approval', // AI sets this
  DONE = 'done',
  CONFIRMED = 'confirmed_by_user' // User sets this
}

export interface TeamMember {
  id: string;
  role: string;
  name: string;
  effectiveness: number; // 0-100
  workload: number; // 0-100
  isAnomaly?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeRole: string;
  source: 'AI' | 'User';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  class: ProjectClass;
  kpis: string[];
  goals: string[];
  subgoals: string[];
  status: 'Online' | 'Offline';
  trustScore: number;
  dataScore: number;
  complexityScore: number;
  temperature: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string; // Can contain [BACKSTAGE] blocks
  timestamp: number;
}

export interface RebalanceProposal {
  id: string;
  reason: string;
  changes: string[]; // e.g., "Add Data Scientist", "Replace Junior Dev"
  impact: string;
  status: 'suggested' | 'applied' | 'rejected';
}

export interface ContextItem {
  id: string;
  title: string;
  type: 'doc' | 'decision' | 'history';
  date: string;
  content?: string;
}
