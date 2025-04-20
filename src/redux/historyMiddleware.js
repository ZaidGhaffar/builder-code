import { addPoint, clearPoints, deleteMeasurement } from './appSlice';

// We'll use a different approach to avoid the infinite loop
export const historyMiddleware = store => next => action => {
  // Process action first
  const result = next(action);
  
  // Skip if we're handling history-related actions
  if (
    action.type === 'app/undo' || 
    action.type === 'app/redo' || 
    action.type === 'app/saveToHistory'
  ) {
    return result;
  }
  
  // Only save history for specific actions
  if (
    action.type === addPoint.type || 
    action.type === clearPoints.type || 
    action.type === deleteMeasurement.type
  ) {
    // Wait until next event loop tick to update history
    setTimeout(() => {
      store.dispatch({
        type: 'app/saveToHistory'
      });
    }, 0); 
  }
  
  return result;
};