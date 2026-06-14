import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/redux/store'
import { IUser } from '@/models/user-model'

// Define a type for the slice state
interface UserState {
  user: string,
  email : string
  userData : IUser | null
}

// Define the initial state using that type
const initialState: UserState = {
  user: "",
  email: "",
  userData : null
}

export const counterSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    handleEmail : (state,action) => {
      state.email = action.payload
    },
     getUserData : (state,action) => {
      state.user = action.payload
    },
    handleUserData : (state, action) => {
      // console.log(action.payload.user);
      
      state.userData = action.payload.user
      // console.log(state.userData);
      
    }
  },
})

export const { getUserData, handleEmail, handleUserData } = counterSlice.actions

export default counterSlice.reducer