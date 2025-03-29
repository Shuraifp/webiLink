import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    accessToken: string | null;
}

const initialState: AuthState = {
    accessToken: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        removeToken: (state) => {
            state.accessToken = null;
        },
    },
});

export const { setToken, removeToken } = authSlice.actions;
export default authSlice.reducer;
