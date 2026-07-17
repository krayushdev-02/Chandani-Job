import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Job Seeker' | 'Recruiter' | 'Employer' | 'HR Manager' | 'Company Admin' | 'Super Admin';
  isVerified: boolean;
  profileCompleted: boolean;
  wallet: {
    balance: number;
    rewardPoints: number;
  };
  seekerProfile?: {
    title?: string;
    skills: string[];
    experienceYears?: number;
    education?: string;
    resumeUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    about?: string;
    savedJobs: string[];
  };
  recruiterProfile?: {
    companyId?: string;
    designation?: string;
    verificationStatus: 'Pending' | 'Approved' | 'Rejected';
  };
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  theme: 'dark' | 'light';
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: null,
  isAuthenticated: false,
  loading: true,
  theme: (localStorage.getItem('theme') as 'dark' | 'light') || 'dark',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      localStorage.setItem('token', action.payload.token);
    },
    updateUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme', state.theme);
    },
  },
});

export const { setCredentials, updateUserProfile, logout, setLoading, toggleTheme } = authSlice.actions;
export default authSlice.reducer;
