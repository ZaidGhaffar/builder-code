
import React, { useMemo } from 'react';

const Points = ({ points = [], canvasWidth, canvasHeight, color = '#FF0000', radius = 8 }) => { 

  
  const screenPoints = useMemo(() => {
    if (!points || points.length === 0 || !canvasWidth || !canvasHeight || canvasWidth === 0 || canvasHeight === 0) {
      console.warn("Points: Canvas dimensions not ready or no points. Points:", points?.length, "W:", canvasWidth, "H:", canvasHeight);
      return []; 
    }

    return points.map((point, index) => {
      
      const screenX = point.x * canvasWidth;
      const screenY = point.y * canvasHeight;
      

      console.log(`>>> Points Component - Calc point ${index}: Norm=`, point, `Screen=`, { x: screenX, y: screenY }, `using W/H:`, { canvasWidth, canvasHeight });

      
      if (isNaN(screenX) || isNaN(screenY)) {
        console.error(`>>> Points Component - Invalid screen coords calculated for point ${index}`, { screenX, screenY });
        return null; 
      }
      
      const key = `point-${index}-${point.x?.toFixed(5)}-${point.y?.toFixed(5)}`;
      return { x: screenX, y: screenY, key: key }; 
    }).filter(p => p !== null); 

    
  }, [points, canvasWidth, canvasHeight]);


  
  if (screenPoints.length === 0) {
  
      return null; 
  }
  console.log(`>>> Points Component - Rendering ${screenPoints.length} points with color ${color}.`);

  return (
    <g className="measurement-points">
      {screenPoints.map((sp) => (
        <circle
          key={sp.key}
          cx={sp.x} 
          cy={sp.y} 
          r={radius} 
          fill={color} 
          style={{ pointerEvents: 'none' }} 
        />
      ))}
    </g>
  );
};

export default Points;