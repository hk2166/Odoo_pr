import { User, SwapRequest, Rating, AdminMessage, SkillCategory } from '../types';

export const skillCategories: SkillCategory[] = [
  {
    id: '1',
    name: 'Technology',
    skills: ['JavaScript', 'Python', 'React', 'Node.js', 'Photoshop', 'Excel', 'Data Analysis', 'UI/UX Design', 'WordPress', 'SEO']
  },
  {
    id: '2',
    name: 'Languages',
    skills: ['Spanish', 'French', 'German', 'Mandarin', 'Japanese', 'Italian', 'Portuguese', 'Arabic', 'Korean', 'Russian']
  },
  {
    id: '3',
    name: 'Creative',
    skills: ['Photography', 'Video Editing', 'Graphic Design', 'Illustration', 'Writing', 'Music Production', 'Painting', '3D Modeling', 'Animation', 'Logo Design']
  },
  {
    id: '4',
    name: 'Business',
    skills: ['Marketing', 'Accounting', 'Project Management', 'Sales', 'Business Strategy', 'Finance', 'HR', 'Legal Advice', 'Networking', 'Leadership']
  },
  {
    id: '5',
    name: 'Lifestyle',
    skills: ['Cooking', 'Fitness Training', 'Yoga', 'Meditation', 'Gardening', 'Home Repair', 'Car Maintenance', 'Fashion Advice', 'Interior Design', 'Travel Planning']
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    location: 'San Francisco, CA',
    profilePhoto: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    skillsOffered: ['JavaScript', 'React', 'UI/UX Design'],
    skillsWanted: ['Spanish', 'Photography', 'Cooking'],
    availability: ['Weekends', 'Evenings'],
    isPublic: true,
    rating: 4.8,
    totalSwaps: 12,
    joinedDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    email: 'marcus@example.com',
    location: 'New York, NY',
    profilePhoto: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    skillsOffered: ['Photography', 'Video Editing', 'Marketing'],
    skillsWanted: ['Python', 'Data Analysis', 'Excel'],
    availability: ['Mornings', 'Weekends'],
    isPublic: true,
    rating: 4.9,
    totalSwaps: 18,
    joinedDate: '2023-11-22'
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    email: 'emma@example.com',
    location: 'Austin, TX',
    profilePhoto: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    skillsOffered: ['Spanish', 'French', 'Writing'],
    skillsWanted: ['Graphic Design', 'Yoga', 'Music Production'],
    availability: ['Evenings', 'Weekdays'],
    isPublic: true,
    rating: 4.7,
    totalSwaps: 8,
    joinedDate: '2024-02-10'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    location: 'Seattle, WA',
    profilePhoto: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    skillsOffered: ['Python', 'Data Analysis', 'Machine Learning'],
    skillsWanted: ['Japanese', 'Cooking', 'Fitness Training'],
    availability: ['Weekends', 'Afternoons'],
    isPublic: true,
    rating: 4.6,
    totalSwaps: 15,
    joinedDate: '2023-12-08'
  },
  {
    id: 'admin',
    name: 'Admin User',
    email: 'admin@skillswap.com',
    skillsOffered: [],
    skillsWanted: [],
    availability: [],
    isPublic: false,
    rating: 5.0,
    totalSwaps: 0,
    joinedDate: '2023-01-01',
    isAdmin: true
  }
];

export const mockSwapRequests: SwapRequest[] = [
  {
    id: '1',
    fromUserId: '1',
    toUserId: '2',
    skillOffered: 'React',
    skillWanted: 'Photography',
    message: 'Hi! I\'d love to learn photography in exchange for React lessons. I have 3+ years experience with React.',
    status: 'pending',
    createdAt: '2024-03-15T10:30:00Z',
    updatedAt: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    fromUserId: '3',
    toUserId: '1',
    skillOffered: 'Spanish',
    skillWanted: 'JavaScript',
    message: 'Hola! I\'m a native Spanish speaker and would love to learn JavaScript. Happy to help with conversational Spanish!',
    status: 'accepted',
    createdAt: '2024-03-10T14:20:00Z',
    updatedAt: '2024-03-12T09:15:00Z'
  },
  {
    id: '3',
    fromUserId: '4',
    toUserId: '2',
    skillOffered: 'Python',
    skillWanted: 'Video Editing',
    message: 'I can teach Python programming and data analysis. Looking to learn video editing for my YouTube channel.',
    status: 'completed',
    createdAt: '2024-02-28T16:45:00Z',
    updatedAt: '2024-03-08T11:30:00Z'
  }
];

export const mockRatings: Rating[] = [
  {
    id: '1',
    swapId: '3',
    fromUserId: '4',
    toUserId: '2',
    rating: 5,
    feedback: 'Marcus was an excellent teacher! Very patient and provided great resources for learning video editing.',
    createdAt: '2024-03-08T11:30:00Z'
  },
  {
    id: '2',
    swapId: '3',
    fromUserId: '2',
    toUserId: '4',
    rating: 5,
    feedback: 'David explained Python concepts very clearly. Highly recommend for anyone wanting to learn programming!',
    createdAt: '2024-03-08T11:35:00Z'
  }
];

export const mockAdminMessages: AdminMessage[] = [
  {
    id: '1',
    title: 'Welcome to SkillSwap!',
    content: 'Start connecting with others to share and learn new skills.',
    type: 'info',
    createdAt: '2024-03-01T00:00:00Z',
    isActive: true
  },
  {
    id: '2',
    title: 'Scheduled Maintenance',
    content: 'Platform will be under maintenance on March 20th from 2-4 AM EST.',
    type: 'maintenance',
    createdAt: '2024-03-15T12:00:00Z',
    isActive: true
  }
];