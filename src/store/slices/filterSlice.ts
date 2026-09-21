import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FilterState {
  selectedCity: string;
  selectedCategory: string;
  searchQuery: string;
  experience: string;
  jobType: string;
  qualification: string;
  urgentOnly: boolean;
  minSalary: number | null;
}

const initialState: FilterState = {
  selectedCity: "",
  selectedCategory: "",
  searchQuery: "",
  experience: "All",
  jobType: "All",
  qualification: "All",
  urgentOnly: false,
  minSalary: null,
};

export const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setExperience: (state, action: PayloadAction<string>) => {
      state.experience = action.payload;
    },
    setJobType: (state, action: PayloadAction<string>) => {
      state.jobType = action.payload;
    },
    setQualification: (state, action: PayloadAction<string>) => {
      state.qualification = action.payload;
    },
    setUrgentOnly: (state, action: PayloadAction<boolean>) => {
      state.urgentOnly = action.payload;
    },
    setMinSalary: (state, action: PayloadAction<number | null>) => {
      state.minSalary = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setCity,
  setCategory,
  setSearchQuery,
  setExperience,
  setJobType,
  setQualification,
  setUrgentOnly,
  setMinSalary,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
