// AngleIndicators.js (Modified)
import React from 'react';

// --- MODIFICATION: Accept screenPoints ---
const AngleIndicators = ({ screenPoints }) => {
  // Use screenPoints directly for positioning
  if (!screenPoints || screenPoints.length < 3) return null;

  // Check if points are valid numbers
   if (screenPoints.some(p => !p || isNaN(p.x) || isNaN(p.y))) {
      console.warn("AngleIndicators received invalid or NaN screen coordinates", screenPoints);
      return null;
   }
   // Check if points are all at origin (potential issue)
    const allAtOrigin = screenPoints.every(p => p.x === 0 && p.y === 0);
    if (allAtOrigin) {
        // console.warn("AngleIndicators: All screen points are at origin. Skipping render."); // Reduce noise
        return null; // Don't render if all points are 0,0
    }


  return (
    <g className="angle-indicators">
      {/* Iterate through points that form an angle (index 1 to length - 2) */}
      {screenPoints.slice(1, -1).map((vertexPoint, index) => {
        // The actual index in screenPoints is index + 1 because of slice
        const actualIndex = index + 1;
        const prevPoint = screenPoints[actualIndex - 1];
        const nextPoint = screenPoints[actualIndex + 1];

        // Extra safety check
        if (!prevPoint || !nextPoint || !vertexPoint) {
            console.warn(`AngleIndicators: Missing point data for index ${actualIndex}`);
            return null;
        }

        // Calculate vectors using SCREEN coordinates
        const v1x = prevPoint.x - vertexPoint.x;
        const v1y = prevPoint.y - vertexPoint.y;
        const v2x = nextPoint.x - vertexPoint.x;
        const v2y = nextPoint.y - vertexPoint.y;

        // Avoid calculations if vectors have zero length
        const mag1Sq = v1x * v1x + v1y * v1y;
        const mag2Sq = v2x * v2x + v2y * v2y;
        if (mag1Sq < 1e-6 || mag2Sq < 1e-6) { // Use a small threshold for floating point
            // console.warn(`AngleIndicators: Zero length vector detected at index ${actualIndex}`);
            return null; // Cannot calculate angle
        }

        // Calculate the angle
        const dot = v1x * v2x + v1y * v2y;
        const det = v1x * v2y - v1y * v2x; // Determinant for signed angle

        // Calculate interior angle (commonly desired) 0-180 degrees
        let angleBetween = Math.acos(dot / (Math.sqrt(mag1Sq) * Math.sqrt(mag2Sq))) * (180 / Math.PI);

         // --- POSITIONING using screen coordinates ---
        const indicatorRadius = 13; // Slightly smaller
        const textOffsetY = 0; // Use dominantBaseline instead
        const indicatorDist = 20; // Distance from vertex along angle bisector

        // Calculate angle bisector direction (normalized)
        const angle1 = Math.atan2(v1y, v1x);
        const angle2 = Math.atan2(v2y, v2x);
        let bisectorAngle = (angle1 + angle2) / 2;

        // Adjust bisector angle if it points "the wrong way" (across the reflex angle)
        if (Math.abs(angle1 - angle2) > Math.PI) {
            bisectorAngle += Math.PI;
        }
         // Optional: Try to place outside based on determinant (for concave vertices)
        if (det < 0) { // If cross product is negative (clockwise turn), flip bisector
             bisectorAngle += Math.PI;
        }


        // Position away from the vertex using the bisector
         const indicatorX = vertexPoint.x + indicatorDist * Math.cos(bisectorAngle);
         const indicatorY = vertexPoint.y + indicatorDist * Math.sin(bisectorAngle);


        // Prevent rendering if calculation resulted in NaN
        if (isNaN(indicatorX) || isNaN(indicatorY) || isNaN(angleBetween)) {
             console.warn("Angle indicator calculation resulted in NaN", { indicatorX, indicatorY, angleBetween });
             return null;
         }

        return (
          // Use actualIndex for a more stable key
          <g key={`angle-indicator-${actualIndex}`}>
            {/* Background circle */}
            <circle
              cx={indicatorX} // Use calculated SCREEN X
              cy={indicatorY} // Use calculated SCREEN Y
              r={indicatorRadius}
              fill="#634CF2"
              fillOpacity="0.8"
            />

            {/* Angle text */}
            <text
              x={indicatorX} // Use calculated SCREEN X
              y={indicatorY + textOffsetY} // Use calculated SCREEN Y + offset
              fill="white"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle" // Better vertical alignment
            >
              {`${Math.round(angleBetween)}°`}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default AngleIndicators;