import { useRef } from "react";
import { configureStore } from "@reduxjs/toolkit";
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  Provider,
} from "react-redux";
import globalReducer from "@/store/state";
import { api } from "@/store/api";
import { setupListeners } from "@reduxjs/toolkit/query";
// import {
//   persistStore,
//   persistReducer,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from "redux-persist";
// import { PersistGate } from "redux-persist/integration/react";
// import ElectronStore from "electron-store";

// Initialize Electron Store
// const electronStore = new ElectronStore();

// const storage = {
//   getItem: (key: string) => {
//     return Promise.resolve(electronStore.get(key));
//   },
//   setItem: (key: string, value: any) => {
//     electronStore.set(key, value);
//     return Promise.resolve();
//   },
//   removeItem: (key: string) => {
//     electronStore.delete(key);
//     return Promise.resolve();
//   },
// };

// const persistConfig = {
//   key: "root",
//   storage,
//   whitelist: ["global"],
// };

// const rootReducer = combineReducers({
//   global: globalReducer,
//   [api.reducerPath]: api.reducer,
// });

// const persistedReducer = persistReducer(persistConfig, rootReducer);

/* REDUX PERSISTENCE */
// const createNoopStorage = () => {
//   return {
//     getItem(_key: any) {
//       return Promise.resolve(null);
//     },
//     setItem(_key: any, value: any) {
//       return Promise.resolve(value);
//     },
//     removeItem(_key: any) {
//       return Promise.resolve();
//     },
//   };
// };

// const storage =
//   typeof window === "undefined"
//     ? createNoopStorage()
//     : createWebStorage("local");

/* REDUX STORE */
export const makeStore = () => {
  return configureStore({
    // reducer: persistedReducer,
    reducer: {
      global: globalReducer,
      [api.reducerPath]: api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    //   {
    //   serializableCheck: {
    //     ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
    //   },
    // }
  });
};

/* REDUX TYPES */
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* PROVIDER */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
    setupListeners(storeRef.current.dispatch);
  }
  // const persistor = persistStore(storeRef.current);

  return (
    <Provider store={storeRef.current}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      {children}
      {/* </PersistGate> */}
    </Provider>
  );
}
