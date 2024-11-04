import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    user: [],
    loading: false,
    error: null,
};

export const userSlice = createAsyncThunk(
    'users/getAllUsers',
)