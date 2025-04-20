import React from 'react';

// Added isActive and toolType props with defaults
const DistanceLabels = ({
    screenPoints,
    originalPoints,
    isScaleDefined,
    scaleRatio,
    isActive = false, // Default to false
    toolType = null    // Default to null
}) => {

    // --- Constants for Ruler Label Style ---
    const rulerLabelBgColor = "#FF0000"; // Red background
    const rulerLabelTextColor = "#FFFFFF"; // White text
    const rulerLabelPaddingX = 5; // Horizontal padding inside background
    const rulerLabelPaddingY = 2; // Vertical padding inside background
    const rulerLabelBorderRadius = 4; // Rounded corners for background
    const rulerLabelFontSize = 10;

  if (!screenPoints || screenPoints.length < 2 || !originalPoints || originalPoints.length !== screenPoints.length) return null;

   // --- Input checks remain the same ---
   if (screenPoints.some(p => !p || isNaN(p.x) || isNaN(p.y))) {
       console.warn("DistanceLabels received invalid or NaN screen coordinates", screenPoints);
       return null;
   }
   const allScreenAtOrigin = screenPoints.every(p => p.x === 0 && p.y === 0);
   if (allScreenAtOrigin) {
        return null;
    }

  // For the ruler tool (active), we only care about the first segment (index 0)
  const labelsToRender = (isActive && toolType === 'rule')
    ? screenPoints.slice(1, 2) // Only the second point to make one segment
    : screenPoints.slice(1);    // Render all segments for other tools

  // Adjust index offset if only rendering ruler label
  // const indexOffset = (isActive && toolType === 'rule') ? 0 : index;


  return (
    <g className="distance-labels">

      {labelsToRender.map((currScreenPoint, mapIndex) => { // Use mapIndex
        // Adjust index based on whether we're filtering for ruler
         const index = (isActive && toolType === 'rule') ? 0 : mapIndex;
         const prevScreenPoint = screenPoints[index];
         const actualIndex = index + 1; // Index in original points array

         const prevOriginalPoint = originalPoints[index];
         const currOriginalPoint = originalPoints[actualIndex];

         // --- Point validation remains the same ---
         if (!prevOriginalPoint || !currOriginalPoint ||
             typeof prevOriginalPoint.x !== 'number' || typeof prevOriginalPoint.y !== 'number' ||
             typeof currOriginalPoint.x !== 'number' || typeof currOriginalPoint.y !== 'number') {
             console.warn(`DistanceLabels: Invalid original points for segment ${index}`);
             return null;
         }

         const screenDist = Math.sqrt(Math.pow(currScreenPoint.x - prevScreenPoint.x, 2) + Math.pow(currScreenPoint.y - prevScreenPoint.y, 2));

         let displayValue;
         let displayUnit;
         if (isScaleDefined && scaleRatio && scaleRatio > 0) {
              // Use normalized points for calculation if scale is defined, as screenDist changes with zoom
              const normDist = Math.sqrt(Math.pow(currOriginalPoint.x - prevOriginalPoint.x, 2) + Math.pow(currOriginalPoint.y - prevOriginalPoint.y, 2));
              // NOTE: Need page dimensions if normalized points represent fraction of page
              // Assuming scaleRatio is pixels-to-meters derived from screen distance used during scale set
              // OR that scaleRatio is meters-per-normalized-unit (less likely)
              // Let's ASSUME scaleRatio is correctly calculated based on screen pixels for now.
              displayValue = (screenDist * scaleRatio).toFixed(2); // Use screenDist if scaleRatio maps screen pixels -> meters
              displayUnit = 'm';
         } else {
              displayValue = screenDist.toFixed(0);
              displayUnit = 'px';
         }

        const midX = (prevScreenPoint.x + currScreenPoint.x) / 2;
        const midY = (prevScreenPoint.y + currScreenPoint.y) / 2;
        const dx = currScreenPoint.x - prevScreenPoint.x;
        const dy = currScreenPoint.y - prevScreenPoint.y;
        let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
         if (angle < -90 || angle > 90) {
             angle += 180;
         }

         if (isNaN(midX) || isNaN(midY) || isNaN(angle) || isNaN(screenDist)) {
             console.warn("Distance label calculation resulted in NaN", { midX, midY, angle, screenDist });
             return null;
         }

        // --- Conditional Styling & Positioning ---
        const isRulerLabel = isActive && toolType === 'rule';
        let transform = '';
        let textFill = '#1E90FF'; // Default blue
        let textStroke = 'white';
        let textStrokeWidth = '2px';
        let showBackground = false;

        if (isRulerLabel) {
            // Center on the line, no offset
            transform = `translate(${midX}, ${midY}) rotate(${angle})`;
            textFill = rulerLabelTextColor; // White text
            textStroke = 'none'; // No outline needed with background
            textStrokeWidth = '0';
            showBackground = true;
        } else {
            // Existing perpendicular offset for other tools
            const labelOffset = 8;
            const offsetX = labelOffset * Math.sin(angle * Math.PI / 180);
            const offsetY = -labelOffset * Math.cos(angle * Math.PI / 180);
            transform = `translate(${midX + offsetX}, ${midY + offsetY}) rotate(${angle})`;
            // Keep default textFill, textStroke, textStrokeWidth
        }

        const labelText = `${displayValue}${displayUnit}`;

        // Estimate background size (adjust as needed)
        // This is tricky without knowing exact text width in SVG
        const estimatedTextWidth = labelText.length * (rulerLabelFontSize * 0.6); // Rough estimate
        const bgWidth = estimatedTextWidth + rulerLabelPaddingX * 2;
        const bgHeight = rulerLabelFontSize + rulerLabelPaddingY * 2;


        return (
          <g key={`dist-label-${index}`} transform={transform}>
            {/* Conditionally render background rect for ruler */}
            {showBackground && (
                <rect
                    // Position centered around (0,0) which is the text anchor point
                    x={-bgWidth / 2}
                    y={-bgHeight / 2}
                    width={bgWidth}
                    height={bgHeight}
                    fill={rulerLabelBgColor}
                    rx={rulerLabelBorderRadius} // Rounded corners
                    ry={rulerLabelBorderRadius}
                />
            )}
            {/* Distance text */}
            <text
              x="0"
              y="0"
              fill={textFill} // Use determined fill color
              fontSize={rulerLabelFontSize} // Use constant font size
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              paintOrder="stroke"
              stroke={textStroke} // Use determined stroke color
              strokeWidth={textStrokeWidth} // Use determined stroke width
              strokeLinejoin="round"
            >
              {labelText}
            </text>
          </g>
        );
      })}
    </g>
  );
};

export default DistanceLabels;