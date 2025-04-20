// src/redux/measurementSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeTool: null,         // Current selected tool (ruler, polyline, polygon, etc.)
    scale: 1,                 // Scale ratio (meters per pixel)
    referenceDistance: null,  // User-defined reference in meters
    measurements: [],         // Saved measurements/rooms
    isCalibrating: false      // Flag for scale calibration mode
};

const measurementSlice = createSlice({
    name: 'measurement',
    initialState,
    reducers: {
        setActiveTool: (state, action) => {
            state.activeTool = action.payload;
        },
        setScale: (state, action) => {
            state.scale = action.payload;
        },
        setReferenceDistance: (state, action) => {
            state.referenceDistance = action.payload;
        },
        addMeasurement: (state, action) => {
            state.measurements.push(action.payload);
        },
        updateMeasurement: (state, action) => {
            const index = state.measurements.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.measurements[index] = action.payload;
            }
        },
        deleteMeasurement: (state, action) => {
            state.measurements = state.measurements.filter(m => m.id !== action.payload);
        },
        setCalibrationMode: (state, action) => {
            state.isCalibrating = action.payload;
        }
    }
});

export const {
    setActiveTool,
    setScale,
    setReferenceDistance,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    setCalibrationMode
} = measurementSlice.actions;

export default measurementSlice.reducer;