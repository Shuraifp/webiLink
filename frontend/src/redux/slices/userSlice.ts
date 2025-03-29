import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReduxUser } from "@/src/types/type";


const initialState: ReduxUser = {
    id: null,
    username: null,
    email: null,
    avatar: null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        addUser: (state, action: PayloadAction<ReduxUser>) => {
            state.id = action.payload.id
            state.username = action.payload.username;
            state.email = action.payload.email;
            state.avatar = action.payload.avatar;
        },
  
        removeUser: (state) => {
            state.id = null;
            state.username = null;
            state.email = null;
            state.avatar = null;
        },
    },
});

export const { addUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
