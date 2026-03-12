import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api.js';

const STORAGE_KEY = 'qb_token';

function loadToken() {
  const t = localStorage.getItem(STORAGE_KEY);
  return typeof t === 'string' && t.trim() ? t : null;
}

export const login = createAsyncThunk('auth/login', async ({ username, password }, thunkApi) => {
  try {
    const normalizedUsername = typeof username === 'string' ? username.trim() : username;
    const res = await api.post('/users/login', { username: normalizedUsername, password });
    const token = res?.data?.token;
    if (!token) throw new Error('No token returned from API');

    localStorage.setItem(STORAGE_KEY, token);
    return { token };
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Login failed';
    return thunkApi.rejectWithValue(message);
  }
});

export const register = createAsyncThunk('auth/register', async ({ username, password }, thunkApi) => {
  try {
    const normalizedUsername = typeof username === 'string' ? username.trim() : username;
    await api.post('/users/signup', { username: normalizedUsername, password, admin: false });
    // Auto login after register
    const res = await api.post('/users/login', { username: normalizedUsername, password });
    const token = res?.data?.token;
    if (!token) throw new Error('No token returned from API');

    localStorage.setItem(STORAGE_KEY, token);
    return { token };
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Register failed';
    return thunkApi.rejectWithValue(message);
  }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, thunkApi) => {
  try {
    const res = await api.get('/users/me');
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY);
    }
    const message = err?.response?.data?.message || err?.message || 'Cannot load profile';
    return thunkApi.rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: loadToken(),
    user: null,
    loading: false,
    loadingMe: false,
    error: null
  },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      state.error = null;
      localStorage.removeItem(STORAGE_KEY);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Register failed';
      })
      .addCase(fetchMe.pending, (state) => {
        state.loadingMe = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loadingMe = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loadingMe = false;
        state.error = action.payload || 'Cannot load profile';
        state.user = null;
        state.token = loadToken();
      });
  }
});

export const { logout } = authSlice.actions;

export const selectAuth = (state) => ({
  token: state.auth.token,
  user: state.auth.user,
  loading: state.auth.loading,
  loadingMe: state.auth.loadingMe,
  error: state.auth.error
});

export default authSlice.reducer;
