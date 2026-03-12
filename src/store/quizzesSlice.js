import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api.js';

export const fetchQuizzes = createAsyncThunk('quizzes/fetchAll', async (_, thunkApi) => {
  try {
    const res = await api.get('/quizzes');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Cannot load quizzes';
    return thunkApi.rejectWithValue(message);
  }
});

export const fetchQuizById = createAsyncThunk('quizzes/fetchById', async (quizId, thunkApi) => {
  try {
    const res = await api.get(`/quizzes/${quizId}`);
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Cannot load quiz';
    return thunkApi.rejectWithValue(message);
  }
});

export const createQuiz = createAsyncThunk('quizzes/create', async ({ title, description }, thunkApi) => {
  try {
    const res = await api.post('/quizzes', { title, description });
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot create quiz';
    return thunkApi.rejectWithValue(message);
  }
});

export const updateQuiz = createAsyncThunk('quizzes/update', async ({ id, title, description, questions }, thunkApi) => {
  try {
    const res = await api.put(`/quizzes/${id}`, { title, description, questions });
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot update quiz';
    return thunkApi.rejectWithValue(message);
  }
});

export const deleteQuiz = createAsyncThunk('quizzes/delete', async (id, thunkApi) => {
  try {
    await api.delete(`/quizzes/${id}`);
    return id;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot delete quiz';
    return thunkApi.rejectWithValue(message);
  }
});

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState: {
    items: [],
    selected: null,
    loading: false,
    error: null
  },
  reducers: {
    clearSelected(state) {
      state.selected = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load quizzes';
      })
      .addCase(fetchQuizById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load quiz';
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        const idx = state.items.findIndex((q) => q?._id === action.payload?._id);
        if (idx >= 0) state.items[idx] = action.payload;
        if (state.selected?._id === action.payload?._id) state.selected = action.payload;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q?._id !== action.payload);
        if (state.selected?._id === action.payload) state.selected = null;
      });
  }
});

export const { clearSelected } = quizzesSlice.actions;
export default quizzesSlice.reducer;
