export interface User {
  id: string;
  name: string;
  email: string;
  location?: string;
  profilePhoto?: string;
  skillsOffered: string[];
  skillsWanted: string[];
  availability: string[];
  isPublic: boolean;
  rating: number;
  totalSwaps: number;
  joinedDate: string;
  isAdmin?: boolean;
  isBanned?: boolean;
}

export interface SwapRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  skillOffered: string;
  skillWanted: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Rating {
  id: string;
  swapId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface AdminMessage {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'maintenance';
  createdAt: string;
  isActive: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}