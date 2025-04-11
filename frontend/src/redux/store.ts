import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import meetingReducer from "./slices/meetingSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["meeting"],
};

const persistedReducer = persistReducer(persistConfig, meetingReducer);

const rootReducer = combineReducers({
  meeting: persistedReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
        ignoredPaths: ["videoStreams.stream"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
