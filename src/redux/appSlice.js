import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  files: [],
  distance: null,
  scaleRatio: null,
  referenceLinePoints: [],
  isScaleDefined: false,
  measurements: [],
  activeMeasurement: null,
  selectedMeasurementId: null,
  activeTool: null,

  scaleWorkflowStep: 0,
  measurementUnit: 'm', 
  meterPoints: [],
  scaleSettingMode: false,
  history: [],
  historyIndex: -1,
  rooms: [],
  selectedRoomId: null,

};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload; 
    },
    setActiveTool: (state, action) => {
      // Complete any ongoing measurement BEFORE changing the tool
      if (state.activeMeasurement) {
        const currentActiveMeasurement = state.measurements.find(m => m.id === state.activeMeasurement);
        if (currentActiveMeasurement && !currentActiveMeasurement.completed) {
           // Mark it as completed (add more logic from completeMeasurement if needed)
           currentActiveMeasurement.completed = true;
           console.log(`>>> Reducer (setActiveTool): Completing measurement ${state.activeMeasurement} due to tool change.`);
           // Consider recalculating final value here if needed, like in completeMeasurement
           // switch (currentActiveMeasurement.type) { ... }
        }
        console.log(`>>> Reducer (setActiveTool): Clearing activeMeasurement: ${state.activeMeasurement}`);
        state.activeMeasurement = null; // IMPORTANT: Clear active ID
      }
      // Do NOT automatically select the previous measurement here
      // state.selectedMeasurementId = null; // Keep selection independent

      console.log(`>>> Reducer (setActiveTool): Setting activeTool to ${action.payload}`);
      state.activeTool = action.payload; // Set the new tool

       // If the new tool is null (deselecting tools), also clear selection
       if (action.payload === null) {
            console.log(`>>> Reducer (setActiveTool): Tool deselected, clearing selectedMeasurementId.`);
            state.selectedMeasurementId = null;
       }
    },
    setScaleRatio: (state, action) => {
      state.scaleRatio = action.payload;

      if (state.scaleRatio) {
        state.measurements.forEach(measurement => {
          if (measurement.type === 'distance') {
            measurement.value = calculateDistanceValue(measurement.points, state.scaleRatio);
          } else if (measurement.type === 'area') {
            measurement.value = calculateAreaValue(measurement.points, state.scaleRatio);
          } else if (measurement.type === 'angle') {
            measurement.value = calculateAngleValue(measurement.points);
          } else if (measurement.type === 'polyline') {
            measurement.value = calculatePolylineValue(measurement.points, state.scaleRatio);
          }
        });
      }
    },
    setMeasurementUnit: (state, action) => {
      state.measurementUnit = action.payload;
    },
    updateMeterPoints: (state, action) => {
      if (state.activeMeasurement) {
        const activeMeasurement = state.measurements.find(m => m.id === state.activeMeasurement);
        if (activeMeasurement) {
          const points = activeMeasurement.points;
          const meterPoints = [];

          if (points.length >= 2 && state.isScaleDefined && state.scaleRatio) {
            let accumulatedMeters = 0;
            let nextMeterMark = 1; 

            for (let i = 1; i < points.length; i++) {
              const prevPoint = points[i - 1];
              const currentPoint = points[i];

              const dx = currentPoint.x - prevPoint.x;
              const dy = currentPoint.y - prevPoint.y;
              const segmentPixels = Math.sqrt(dx * dx + dy * dy);
              const segmentMeters = segmentPixels * state.scaleRatio;

              while (accumulatedMeters + segmentMeters >= nextMeterMark) {
                const ratio = (nextMeterMark - accumulatedMeters) / segmentMeters;

                const x = prevPoint.x + dx * ratio;
                const y = prevPoint.y + dy * ratio;

                meterPoints.push({
                  x, y,
                  meter: nextMeterMark
                });

                nextMeterMark += 1; 
              }

              accumulatedMeters += segmentMeters;
            }
          }

          activeMeasurement.meterPoints = meterPoints;
        }
      }
    },

    addPoint: (state, action) => {
      console.log('Redux: Adding point', action.payload);
      
      const { x, y, pageNumber, pageWidth, pageHeight } = action.payload;
      
      const pointData = {
        x,
        y,
        pageNumber,
        pageInfo: { width: pageWidth, height: pageHeight } 
      };
    
      if (!state.activeTool) {
        console.warn("addPoint called with no active tool!");
        return; // Don't add points if no tool is selected
    }

    if (!state.activeMeasurement) {
        // STARTING a new measurement
        const newMeasurementId = `meas-${Date.now()}`; // More descriptive ID
        const newMeasurement = {
            id: newMeasurementId,
            type: state.activeTool,      // Use the currently selected tool
            points: [pointData],       // Start with the first point
            value: 0,
            completed: false,
            pageNumber: pageNumber,    // Store page number for filtering
            name: `${state.activeTool} Measurement` // Default name
            // Add other initial properties if needed
        };
        state.measurements.push(newMeasurement);
        state.activeMeasurement = newMeasurementId; // Set this new one as active
        state.selectedMeasurementId = null;        // Clear selection when starting new measurement
        console.log(`>>> Reducer (addPoint): Started NEW measurement ${newMeasurementId} of type ${state.activeTool}`);
    } else {
        const activeMeasurement = state.measurements.find(m => m.id === state.activeMeasurement);
        if (activeMeasurement) {
          activeMeasurement.points.push(pointData);
    
          const points = activeMeasurement.points;
    
          switch (activeMeasurement.type) {
            case 'distance':
            case 'rule': 
              if (points.length === 2) {
                activeMeasurement.value = calculateDistanceValue(points, state.scaleRatio);
                activeMeasurement.completed = true;
              }
              break;

            case 'polyline':
              if (points.length >= 2) {
                activeMeasurement.value = calculatePolylineValue(points, state.scaleRatio);
              }
              break;

            case 'polygon':
            case 'area':
              if (points.length >= 3) {
                activeMeasurement.value = calculateAreaValue(points, state.scaleRatio);
              }
              break;

            case 'rectangle2Point':
              if (points.length === 2) {
                
const pageWidth = points[0].pageInfo?.width || 1;
  
const width = Math.abs(points[1].x - points[0].x) * pageWidth;
const height = Math.abs(points[1].y - points[0].y) * pageWidth;
activeMeasurement.value = width * height * (state.scaleRatio * state.scaleRatio);
              }
              break;

            case 'rectangle3Point':
              if (points.length === 3) {
                
                const v1 = {
                  x: points[1].x - points[0].x,
                  y: points[1].y - points[0].y
                };
                const v2 = {
                  x: points[2].x - points[0].x,
                  y: points[2].y - points[0].y
                };

                const area = Math.abs(v1.x * v2.y - v1.y * v2.x);
                activeMeasurement.value = area * (state.scaleRatio * state.scaleRatio);
                activeMeasurement.completed = true;
              }
              break;

            case 'angle':
              if (points.length === 3) {
                activeMeasurement.value = calculateAngleValue(points);
                activeMeasurement.completed = true;
              }
              break;


            default:

              break;
          }
        }
      }
    }, completeMeasurement: (state) => {
      if (state.activeMeasurement) {
          const measurementIdToComplete = state.activeMeasurement; // Store ID before clearing
          const activeMeasurement = state.measurements.find(m => m.id === measurementIdToComplete);
          if (activeMeasurement) {
              activeMeasurement.completed = true;
              console.log(`>>> Reducer (completeMeasurement): Marking ${measurementIdToComplete} as completed.`);

              // Recalculate final value on completion if needed (especially for area/polygon)
              switch (activeMeasurement.type) {
                  case 'polygon':
                  case 'area':
                       if (activeMeasurement.points.length >= 3) {
                          activeMeasurement.value = calculateAreaValue(activeMeasurement.points, state.scaleRatio);
                          console.log(`>>> Reducer (completeMeasurement): Recalculated area value for ${measurementIdToComplete}.`);
                       }
                      break;
                  case 'polyline':
                       if (activeMeasurement.points.length >= 2) {
                         activeMeasurement.value = calculatePolylineValue(activeMeasurement.points, state.scaleRatio);
                         console.log(`>>> Reducer (completeMeasurement): Recalculated polyline value for ${measurementIdToComplete}.`);
                       }
                       break;
          
              }
          
          
          }
          
          state.activeMeasurement = null;
          state.activeTool = null;
      }
  },
    addRoom: (state, action) => {
      const { name, toolType, measurementIds } = action.payload;
      const newRoom = {
        id: `room-${Date.now()}`,
        name,
        toolType,
        measurementIds, 
        area: calculateRoomArea(state.measurements, measurementIds),
      };
      state.rooms.push(newRoom);
    },

    updateRoom: (state, action) => {
      const { id, updates } = action.payload;
      const roomIndex = state.rooms.findIndex(room => room.id === id);
      if (roomIndex >= 0) {
        state.rooms[roomIndex] = { ...state.rooms[roomIndex], ...updates };

        if (updates.measurementIds) {
          state.rooms[roomIndex].area = calculateRoomArea(
            state.measurements,
            updates.measurementIds
          );
        }
      }
    },

    deleteRoom: (state, action) => {
      state.rooms = state.rooms.filter(room => room.id !== action.payload);
      if (state.selectedRoomId === action.payload) {
        state.selectedRoomId = null;
      }
    },

    selectRoom: (state, action) => {
      if (state.selectedRoomId === action.payload) {
        state.selectedRoomId = null;
        state.measurements.forEach(m => {
          m.highlighted = false;
        });
        return;
      }

      state.selectedRoomId = action.payload;

      if (action.payload) {
        const selectedRoom = state.rooms.find(r => r.id === action.payload);
        if (selectedRoom) {
          state.selectedMeasurementId = null;

          state.measurements.forEach(m => {
            m.highlighted = selectedRoom.measurementIds.includes(m.id);
          });
        }
      } else {
        state.measurements.forEach(m => {
          m.highlighted = false;
        });
      }
    },

    updateRoomsFromMeasurements: (state) => {
      state.rooms.forEach(room => {
        room.area = calculateRoomArea(state.measurements, room.measurementIds);
      });
    },
    clearPoints: (state) => {
      if (state.activeMeasurement) {
        const activeMeasurement = state.measurements.find(m => m.id === state.activeMeasurement);

        if (activeMeasurement && activeMeasurement.type !== 'scaleReference') {
          if (activeMeasurement.points && activeMeasurement.points.length > 0) {
            activeMeasurement.completed = true;
          } else {
            state.measurements = state.measurements.filter(m => m.id !== state.activeMeasurement);
          }
          state.activeMeasurement = null;
        }
      }
    },
    addFile: (state, action) => {
      state.files.push(action.payload); 
    },
    removeFile: (state, action) => {
      state.files = state.files.filter((file) => file.id !== action.payload); 
    },
    setDistance: (state, action) => {
      state.distance = action.payload;
    },

    setReferenceLinePoints: (state, action) => {
      state.referenceLinePoints = action.payload;
    },
    setScaleSettingMode: (state, action) => {
      state.scaleSettingMode = action.payload;
    },
    saveToHistory: (state) => {
      const newHistory = [...state.history.slice(0, state.historyIndex + 1)];
      newHistory.push(JSON.parse(JSON.stringify(state.measurements)));

      state.history = newHistory;
      state.historyIndex = newHistory.length - 1;
    },

    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex -= 1;
        state.measurements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },

    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex += 1;
        state.measurements = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
      }
    },
    setScaleDefined: (state, action) => {
      state.isScaleDefined = action.payload;
    },
    addMeasurement: (state, action) => {
      if (!state.measurements) state.measurements = [];
      state.measurements.push(action.payload);
    },
    updateMeasurement: (state, action) => {
      const { id, ...updatedProperties } = action.payload;
      const index = state.measurements.findIndex(m => m.id === id);
      if (index !== -1) {
        state.measurements[index] = { ...state.measurements[index], ...updatedProperties };
      }
    },
    setScaleWorkflowStep: (state, action) => {
      state.scaleWorkflowStep = action.payload;
    },
    deleteMeasurement: (state, action) => {
      state.measurements = state.measurements.filter(m => m.id !== action.payload);
    },
    setActiveMeasurement: (state, action) => {
      state.activeMeasurement = action.payload;
    },
    selectMeasurement: (state, action) => {
      state.selectedMeasurementId = action.payload;
    },
    updateMeasurementsWithScale: (state, action) => {
      const newScaleRatio = action.payload;
      const oldScaleRatio = state.scaleRatio || 1;

      if (oldScaleRatio === 0) return;

      const scaleFactor = newScaleRatio / oldScaleRatio;

      state.measurements = state.measurements.map(measurement => {
        const isArea = ['polygon', 'rectangle', 'rectangle2Point', 'rectangle3p', 'rectangle3Point'].includes(measurement.type);
        const scaledValue = isArea
          ? measurement.value * scaleFactor * scaleFactor
          : measurement.value * scaleFactor;

        return {
          ...measurement,
          value: scaledValue
        };
      });
    }
  },
});
function calculateRoomArea(measurements, measurementIds) {
  return measurementIds.reduce((total, id) => {
    const measurement = measurements.find(m => m.id === id);
    return measurement ? total + measurement.value : total;
  }, 0);
}
function calculateDistanceValue(points, scaleRatio) {
  if (!points || points.length < 2 || !scaleRatio) return 0;

  const x1 = points[0].x;
  const y1 = points[0].y;
  const x2 = points[1].x;
  const y2 = points[1].y;
  
  const pageWidth = points[0].pageInfo?.width || 1;
  
  const dx = (x2 - x1) * pageWidth;
  const dy = (y2 - y1) * pageWidth; 
  
  return Math.sqrt(dx * dx + dy * dy) * scaleRatio;
}
function calculateAreaValue(points, scaleRatio) {
  if (!points || points.length < 3 || !scaleRatio) return 0;

  const pageWidth = points[0].pageInfo?.width || 1;
  
  let area = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const x1 = points[i].x * pageWidth;
    const y1 = points[i].y * pageWidth;
    const x2 = points[j].x * pageWidth;
    const y2 = points[j].y * pageWidth;
    
    area += (x2 + x1) * (y2 - y1);
  }
  return Math.abs(area / 2) * scaleRatio * scaleRatio; 
}
function calculateAngleValue(points) {
  if (!points || points.length < 3) return 0;

  const v1 = {
    x: points[0].x - points[1].x,
    y: points[0].y - points[1].y
  };
  const v2 = {
    x: points[2].x - points[1].x,
    y: points[2].y - points[1].y
  };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const v1Mag = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const v2Mag = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  const cos = dot / (v1Mag * v2Mag);
  return Math.acos(Math.min(Math.max(cos, -1), 1)) * (180 / Math.PI);
}
function calculatePolylineValue(points, scaleRatio) {
  if (!points || points.length < 2 || !scaleRatio) return 0;

  const pageWidth = points[0].pageInfo?.width || 1;
  
  let length = 0;
  for (let i = 1; i < points.length; i++) {
    const x1 = points[i-1].x * pageWidth;
    const y1 = points[i-1].y * pageWidth; 
    const x2 = points[i].x * pageWidth;
    const y2 = points[i].y * pageWidth;
    
    const dx = x2 - x1;
    const dy = y2 - y1;
    length += Math.sqrt(dx * dx + dy * dy);
  }
  return length * scaleRatio;
}

export const {
  setUser,
  addFile,
  removeFile,
  setDistance,
  setScaleRatio,
  setReferenceLinePoints,
  setScaleDefined,
  addMeasurement,
  updateMeasurement,
  deleteMeasurement,
  setActiveMeasurement,
  selectMeasurement,
  updateMeasurementsWithScale,
  setActiveTool,
  setScaleWorkflowStep,
  setScaleSettingMode,
  clearPoints,
  setMeasurementUnit,
  updateMeterPoints,
  saveToHistory,
  undo,
  redo,
  addPoint,
  addRoom, updateRoom, deleteRoom, selectRoom, updateRoomsFromMeasurements, completeMeasurement

} = appSlice.actions;

// Export reducer
export default appSlice.reducer;