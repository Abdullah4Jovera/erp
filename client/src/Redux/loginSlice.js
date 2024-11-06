import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialState = {
    user: null,
    loading: false,
    error: null,
    pipelines: [],
    branches: [],
    products: [],
    productNames: [],
    leadType: [],
};

// Thunk to handle user login
export const loginApi = createAsyncThunk(
    'user/login',
    async (values, { dispatch, rejectWithValue }) => {
        try {
            const response = await axios.post(`/api/users/login`, {
                email: values.email,
                password: values.password,
            });

            // Fetch related data after successful login
            await dispatch(fetchPipelines());
            await dispatch(fetchBranches());
            await dispatch(fetchAllProducts());
            await dispatch(fetchProductNames());
            await dispatch(fetchLeadType());
            return response.data;

        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch pipelines data
export const fetchPipelines = createAsyncThunk(
    'pipeline/fetchPipelines',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/pipelines/get-pipelines`,);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch branches data
export const fetchBranches = createAsyncThunk(
    'branches/fetchBranches',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/branch/get-branches`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch products data
export const fetchAllProducts = createAsyncThunk(
    'products/fetchAllProducts',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/products/get-all-products`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch product names data
export const fetchProductNames = createAsyncThunk(
    'productNames/fetchProductNames',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/products/get-all-products`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch lead type data
export const fetchLeadType = createAsyncThunk(
    'leadType/fetchLeadType',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`/api/leadtypes/get-all-leadtypes`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to fetch updated user permissions
export const fetchUpdatedPermission = createAsyncThunk(
    'user/fetchUpdatedPermission',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().loginSlice.user?.token;
        try {
            const response = await axios.get(`/api/users/permissions`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to refresh token
export const refreshToken = createAsyncThunk(
    'user/refreshToken',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().loginSlice.user?.token;
        try {
            const response = await axios.post(`/api/users/refresh-token`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
);

// Thunk to handle user logout
export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { dispatch, getState }) => {
        const token = getState().loginSlice.user?.token;
        const navigate = useNavigate();
 
        try {
            await axios.post(`/api/users/logout`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Navigate to login or home page
            navigate('/');
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }
);

const loginSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.loading = false;
            state.error = null;
            state.pipelines = [];
            state.branches = [];
            state.products = [];
            state.productNames = [];
            state.leadType = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginApi.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginApi.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginApi.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchPipelines.fulfilled, (state, action) => {
                state.pipelines = action.payload;
            })
            .addCase(fetchPipelines.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchBranches.fulfilled, (state, action) => {
                state.branches = action.payload;
            })
            .addCase(fetchBranches.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchProductNames.fulfilled, (state, action) => {
                state.productNames = action.payload;
            })
            .addCase(fetchProductNames.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchLeadType.fulfilled, (state, action) => {
                state.leadType = action.payload;
            })
            .addCase(fetchLeadType.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchUpdatedPermission.fulfilled, (state, action) => {
                state.user.permissions = action.payload;
            })
            .addCase(refreshToken.fulfilled, (state, action) => {
                state.user.token = action.payload.token;
            });
    },
});

export const { logout } = loginSlice.actions;

export default loginSlice.reducer;