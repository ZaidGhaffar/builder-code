import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addPoint } from '../../redux/appSlice';

const usePointManagement = (canvasRef) => {
  const dispatch = useDispatch();
  const activeTool = useSelector((state) => state.app.activeTool);
  const isScaleDefined = useSelector((state) => state.app.isScaleDefined);
  const scaleRatio = useSelector((state) => state.app.scaleRatio);
  const currentPoints = useSelector((state) => {
    const activeMeasurementId = state.app.activeMeasurement;
    const activeMeasurement = state.app.measurements?.find(
      (m) => m.id === activeMeasurementId
    );
    return activeMeasurement ? activeMeasurement.points : [];
  });

  // Calculate distance between two points
  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  const handleCanvasClick = useCallback((e) => {
    if (
      !activeTool ||
      !["polyline", "polygon", "rectangle2Point", "rectangle3Point"].includes(
        activeTool
      )
    ) {
      console.log(`No suitable active tool: ${activeTool}`);
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log(`Canvas clicked at (${x}, ${y}) with tool: ${activeTool}`);

    // Dispatch addPoint action
    dispatch(addPoint({ x, y }));

    // Log distance information
    if (currentPoints && currentPoints.length > 0) {
      const lastPoint = currentPoints[currentPoints.length - 1];
      const newPoint = { x, y };
      const segmentDist = calculateDistance(lastPoint, newPoint);
      const scaledDist = isScaleDefined ? segmentDist * scaleRatio : segmentDist;

      console.log(
        `New segment distance: ${
          isScaleDefined
            ? scaledDist.toFixed(2) + " m"
            : segmentDist.toFixed(0) + " px"
        }`
      );
    }
  }, [activeTool, canvasRef, currentPoints, dispatch, isScaleDefined, scaleRatio]);

  return { handleCanvasClick };
};

export default usePointManagement;