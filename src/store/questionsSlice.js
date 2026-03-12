import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../utils/api.js';

export const fetchQuestions = createAsyncThunk('questions/fetchAll', async (_, thunkApi) => {
  try {
    const res = await api.get('/questions');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    const message = err?.response?.data?.message || err?.message || 'Cannot load questions';
    return thunkApi.rejectWithValue(message);
  }
});

export const createQuestion = createAsyncThunk('questions/create', async ({ text, options, correctAnswerIndex }, thunkApi) => {
  try {
    const res = await api.post('/questions', { text, options, correctAnswerIndex });
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot create question';
    return thunkApi.rejectWithValue(message);
  }
});

export const updateQuestion = createAsyncThunk('questions/update', async ({ id, text, options, correctAnswerIndex }, thunkApi) => {
  try {
    const res = await api.put(`/questions/${id}`, { text, options, correctAnswerIndex });
    return res.data;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot update question';
    return thunkApi.rejectWithValue(message);
  }
});

export const deleteQuestion = createAsyncThunk('questions/delete', async (id, thunkApi) => {
  try {
    await api.delete(`/questions/${id}`);
    return id;
  } catch (err) {
    const message = err?.response?.data?.error || err?.message || 'Cannot delete question';
    return thunkApi.rejectWithValue(message);
  }
});

const questionsSlice = createSlice({
  name: 'questions',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuestions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Cannot load questions';
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateQuestion.fulfilled, (state, action) => {
        const idx = state.items.findIndex((q) => q?._id === action.payload?._id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(deleteQuestion.fulfilled, (state, action) => {
        state.items = state.items.filter((q) => q?._id !== action.payload);
      });
  }
});

export default questionsSlice.reducer;
