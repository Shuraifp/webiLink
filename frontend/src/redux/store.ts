import { configureStore, combineReducers } from "@reduxjs/toolkit";
// import { persistStore, persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
// import userReducer from "./slices/userSlice"

// const persistConfig = {
//     key: "root",
//     storage,
//     whitelist: ["user"], 
//   };

const rootReducer = combineReducers({
    auth: authReducer,
    // user: persistReducer(persistConfig, userReducer),   
});

export const store = configureStore({
    reducer: rootReducer
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
