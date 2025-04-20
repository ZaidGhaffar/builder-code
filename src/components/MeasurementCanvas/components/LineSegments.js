import React from 'react';

const LineSegments = ({ points }) => {
  if (!points || points.length < 2) return null;
  
  return (
    <>
      {points.slice(1).map((point, index) => {
        const prevPoint = points[index];
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const lineLength = Math.sqrt(dx * dx + dy * dy);
        const lineAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <g
            key={`line-${index}`}
            transform={`translate(${prevPoint.x}, ${prevPoint.y}) rotate(${lineAngle})`}
          >
            <path
              d={`M0 0H${lineLength}`}
              stroke="#634CF2"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>
        );
      })}
    </>
  );
};

export default LineSegments;