import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, SwapRequest, Rating, AdminMessage } from '../types';
import { mockUsers, mockSwapRequests, mockRatings, mockAdminMessages } from '../data/mockData';
import { ADMIN_USER } from '../lib/admin_user';

interface AppState {
  currentUser: User | null;
  users: User[];
  swapRequests: SwapRequest[];
  ratings: Rating[];
  adminMessages: AdminMessage[];
  searchQuery: string;
  selectedSkillFilter: string;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

type AppAction = 
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CREATE_SWAP_REQUEST'; payload: SwapRequest }
  | { type: 'UPDATE_SWAP_REQUEST'; payload: SwapRequest }
  | { type: 'DELETE_SWAP_REQUEST'; payload: string }
  | { type: 'ADD_RATING'; payload: Rating }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SKILL_FILTER'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'BAN_USER'; payload: string }
  | { type: 'UNBAN_USER'; payload: string };

const initialState: AppState = {
  currentUser: ADMIN_USER, // Use admin user
  users: mockUsers,
  swapRequests: mockSwapRequests,
  ratings: mockRatings,
  adminMessages: mockAdminMessages,
  searchQuery: '',
  selectedSkillFilter: '',
  notifications: []
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser
      };
    
    case 'CREATE_SWAP_REQUEST':
      return {
        ...state,
        swapRequests: [...state.swapRequests, action.payload]
      };
    
    case 'UPDATE_SWAP_REQUEST':
      return {
        ...state,
        swapRequests: state.swapRequests.map(request =>
          request.id === action.payload.id ? action.payload : request
        )
      };
    
    case 'DELETE_SWAP_REQUEST':
      return {
        ...state,
        swapRequests: state.swapRequests.filter(request => request.id !== action.payload)
      };
    
    case 'ADD_RATING':
      return {
        ...state,
        ratings: [...state.ratings, action.payload]
      };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_SKILL_FILTER':
      return { ...state, selectedSkillFilter: action.payload };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
    
    case 'BAN_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload ? { ...user, isBanned: true } : user
        )
      };
    
    case 'UNBAN_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload ? { ...user, isBanned: false } : user
        )
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}