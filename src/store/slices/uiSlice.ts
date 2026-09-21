import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Job } from "@/types";

interface UIState {
  isCityModalOpen: boolean;
  isPostJobModalOpen: boolean;
  isAuthModalOpen: boolean;
  isDashboardOpen: boolean;
  selectedJobForDetail: Job | null;
  selectedJobForHR: { job: Job; mode: "call" | "whatsapp" } | null;
}

const initialState: UIState = {
  isCityModalOpen: false,
  isPostJobModalOpen: false,
  isAuthModalOpen: false,
  isDashboardOpen: false,
  selectedJobForDetail: null,
  selectedJobForHR: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCityModal: (state) => {
      state.isCityModalOpen = true;
    },
    closeCityModal: (state) => {
      state.isCityModalOpen = false;
    },
    openPostJobModal: (state) => {
      state.isPostJobModalOpen = true;
    },
    closePostJobModal: (state) => {
      state.isPostJobModalOpen = false;
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
    },
    openDashboard: (state) => {
      state.isDashboardOpen = true;
    },
    closeDashboard: (state) => {
      state.isDashboardOpen = false;
    },
    setSelectedJobForDetail: (state, action: PayloadAction<Job | null>) => {
      state.selectedJobForDetail = action.payload;
    },
    setSelectedJobForHR: (
      state,
      action: PayloadAction<{ job: Job; mode: "call" | "whatsapp" } | null>
    ) => {
      state.selectedJobForHR = action.payload;
    },
  },
});

export const {
  openCityModal,
  closeCityModal,
  openPostJobModal,
  closePostJobModal,
  openAuthModal,
  closeAuthModal,
  openDashboard,
  closeDashboard,
  setSelectedJobForDetail,
  setSelectedJobForHR,
} = uiSlice.actions;

export default uiSlice.reducer;
