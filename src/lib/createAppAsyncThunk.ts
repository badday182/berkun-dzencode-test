import { createAsyncThunk } from "@reduxjs/toolkit";
import type { ApiError } from "@/types";
import type { AppDispatch, RootState } from "./store";

/**
 * `createAsyncThunk` с раз и навсегда подставленными типами приложения — та же
 * идея, что у `useAppDispatch` / `useAppSelector` из `hooks.ts`.
 *
 * Главное здесь `rejectValue: ApiError`: без него `action.payload` в ветке
 * `rejected` имеет тип `unknown`, и в редьюсере пришлось бы приводить его
 * вручную. С ним компилятор следит, что в стор кладут именно разобранную
 * ошибку, а не пойманный `catch (e)`.
 */
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: ApiError;
}>();
