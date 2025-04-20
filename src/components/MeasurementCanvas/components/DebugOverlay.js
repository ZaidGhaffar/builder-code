import React from 'react';

const DebugOverlay = ({ activeTool, pointsCount, isScaleDefined, scaleRatio, currentPoints }) => {
  // Calculate total polyline distance
  const calculatePolylineDistance = (points) => {
    if (!points || points.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < points.length; i++) {
      const point1 = points[i - 1];
      const point2 = points[i];
      totalDistance += Math.sqrt(
        Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
      );
    }
    return totalDistance;
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "5px 10px",
        borderRadius: "3px",
        fontSize: "12px",
        zIndex: 1000,
      }}
    >
      Tool: {activeTool || "none"} | Points: {pointsCount || 0} |
      {isScaleDefined && `Scale: ${scaleRatio} m/px |`}
      {currentPoints?.length > 1 &&
        `Distance: ${
          isScaleDefined
            ? `${(
                calculatePolylineDistance(currentPoints) * scaleRatio
              ).toFixed(2)} m`
            : `${calculatePolylineDistance(currentPoints).toFixed(0)} px`
        }`}
    </div>
  );
};

export default DebugOverlay;