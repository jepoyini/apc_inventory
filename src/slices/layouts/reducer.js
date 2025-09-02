import { createSlice } from "@reduxjs/toolkit";

//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  backgroundImageTypes,
  sidebarVisibilitytypes
} from "../../Components/constants/layout";

// Load initial state from localStorage if available
let initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.DARK,
  layoutModeType: layoutModeTypes.DARKMODE,
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  preloader: preloaderTypes.DISABLE,
  backgroundImageType: backgroundImageTypes.IMG3,
  sidebarVisibilitytype: sidebarVisibilitytypes.SHOW
};

const savedLayout = localStorage.getItem('layout_state');
if (savedLayout) {
  try {
    const parsed = JSON.parse(savedLayout);
    initialState = { ...initialState, ...parsed };
  } catch (error) {
    console.error("Failed to parse layout_state from localStorage", error);
  }
}

// Helper function to save to localStorage
const saveLayoutToStorage = (state) => {
  localStorage.setItem('layout_state', JSON.stringify(state));
};

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state, action) {
      state.layoutType = action.payload;
      saveLayoutToStorage(state);
    },
    changeLayoutModeAction(state, action) {
      state.layoutModeType = action.payload;
      state.leftSidebarType = action.payload;
      saveLayoutToStorage(state);
    },
    changeSidebarThemeAction(state, action) {
      state.leftSidebarType = action.payload;
      saveLayoutToStorage(state);
    },
    changeLayoutWidthAction(state, action) {
      state.layoutWidthType = action.payload;
      saveLayoutToStorage(state);
    },
    changeLayoutPositionAction(state, action) {
      state.layoutPositionType = action.payload;
      saveLayoutToStorage(state);
    },
    changeTopbarThemeAction(state, action) {
      state.topbarThemeType = action.payload;
      saveLayoutToStorage(state);
    },
    changeLeftsidebarSizeTypeAction(state, action) {
      state.leftsidbarSizeType = action.payload;
      saveLayoutToStorage(state);
    },
    changeLeftsidebarViewTypeAction(state, action) {
      state.leftSidebarViewType = action.payload;
      saveLayoutToStorage(state);
    },
    changeSidebarImageTypeAction(state, action) {
      state.leftSidebarImageType = action.payload;
      saveLayoutToStorage(state);
    },
    changePreLoaderAction(state, action) {
      state.preloader = action.payload;
      saveLayoutToStorage(state);
    },
    changeBackgroundImageTypeAction(state, action) {
      state.backgroundImageType = action.payload;
      saveLayoutToStorage(state);
    },
    changeSidebarVisibilityAction(state, action) {
      state.sidebarVisibilitytype = action.payload;
      saveLayoutToStorage(state);
    }
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changePreLoaderAction,
  changeBackgroundImageTypeAction,
  changeSidebarVisibilityAction
} = LayoutSlice.actions;

export default LayoutSlice.reducer;
