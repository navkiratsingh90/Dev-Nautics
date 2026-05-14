import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
	darkMode: true
};

const ThemeSlice = createSlice({
  name: 'Theme',
  initialState,
  reducers: {
		handleTheme: (state) => {
				state.darkMode = !state.darkMode;
			console.log(state.darkMode);
			
		}
  },
});


export const {handleTheme} = ThemeSlice.actions;

export default ThemeSlice.reducer;