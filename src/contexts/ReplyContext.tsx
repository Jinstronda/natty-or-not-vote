import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { useReviewReplies } from '@/hooks/useReviewReplies';
import { ReviewReply } from '@/types/reply';

interface ReplyState {
  replies: ReviewReply[];
  loading: boolean;
  error: string | null;
}

const initialState: ReplyState = {
  replies: [],
  loading: true,
  error: null,
};

type Action =
  | { type: 'SET_REPLIES'; payload: ReviewReply[] }
  | { type: 'ADD_REPLY'; payload: ReviewReply }
  | { type: 'UPDATE_REPLY'; payload: ReviewReply }
  | { type: 'DELETE_REPLY'; payload: string };

function reducer(state: ReplyState, action: Action): ReplyState {
  switch (action.type) {
    case 'SET_REPLIES':
      return { ...state, replies: action.payload, loading: false };
    case 'ADD_REPLY':
      if (state.replies.find(r => r.id === action.payload.id)) return state;
      return { ...state, replies: [...state.replies, action.payload] };
    case 'UPDATE_REPLY':
      return {
        ...state,
        replies: state.replies.map(r => (r.id === action.payload.id ? action.payload : r)),
      };
    case 'DELETE_REPLY':
      return { ...state, replies: state.replies.filter(r => r.id !== action.payload) };
    default:
      return state;
  }
}

interface ReplyContextValue extends ReplyState {
  createReply: ReturnType<typeof useReviewReplies>['createReply'];
  updateReply: ReturnType<typeof useReviewReplies>['updateReply'];
  deleteReply: ReturnType<typeof useReviewReplies>['deleteReply'];
  getReviewReplies: (reviewId: string) => ReviewReply[];
}

const ReplyContext = createContext<ReplyContextValue | undefined>(undefined);

export const ReplyProvider = ({ children }: { children: ReactNode }) => {
  const {
    replies: hookReplies,
    loading,
    error,
    createReply,
    updateReply,
    deleteReply,
  } = useReviewReplies();

  const [state, dispatch] = useReducer(reducer, { ...initialState, loading });

  // sync hook replies into context state
  useEffect(() => {
    dispatch({ type: 'SET_REPLIES', payload: hookReplies });
  }, [hookReplies]);

  const getReviewReplies = useCallback(
    (reviewId: string) => state.replies.filter(r => r.review_id === reviewId),
    [state.replies]
  );

  const value: ReplyContextValue = {
    ...state,
    createReply,
    updateReply,
    deleteReply,
    getReviewReplies,
  };

  return <ReplyContext.Provider value={value}>{children}</ReplyContext.Provider>;
};

export const useReplies = () => {
  const ctx = useContext(ReplyContext);
  if (!ctx) throw new Error('useReplies must be used within ReplyProvider');
  return ctx;
}; 