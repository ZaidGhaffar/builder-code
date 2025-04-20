// // src/utils/MeasurementUtils.js

// /**
//  * Calculate the linear distance between two points
//  * @param {Object} point1 - The first point with x, y coordinates
//  * @param {Object} point2 - The second point with x, y coordinates
//  * @returns {number} - The Euclidean distance between the points
//  */
// export const calculateDistanceBetweenPoints = (point1, point2) => {
//     const dx = point2.x - point1.x;
//     const dy = point2.y - point1.y;
//     return Math.sqrt(dx * dx + dy * dy);
// };

// /**
//  * Calculate the total distance of a polyline
//  * @param {Array} points - Array of points with x, y coordinates
//  * @param {number} scaleRatio - Scale ratio for converting pixels to real-world units (optional)
//  * @returns {number} - The total distance of the polyline
//  */
// export const calculateDistance = (points, scaleRatio = 1) => {
//     if (!points || points.length < 2) return 0;

//     let totalDistance = 0;

//     for (let i = 0; i < points.length - 1; i++) {
//         totalDistance += calculateDistanceBetweenPoints(points[i], points[i + 1]);
//     }

//     // Apply scale ratio to convert from pixel distance to real-world distance
//     return totalDistance * scaleRatio;
// };

// /**
//  * Calculate the area of a polygon using the Shoelace formula
//  * @param {Array} points - Array of points with x, y coordinates defining the polygon
//  * @param {number} scaleRatio - Scale ratio for converting pixels to real-world units (optional)
//  * @returns {number} - The area of the polygon
//  */
// export const calculatePolygonArea = (points, scaleRatio = 1) => {
//     if (!points || points.length < 3) return 0;

//     let area = 0;

//     // Use shoelace formula to calculate area
//     for (let i = 0; i < points.length; i++) {
//         const j = (i + 1) % points.length;
//         area += points[i].x * points[j].y;
//         area -= points[j].x * points[i].y;
//     }

//     area = Math.abs(area) / 2;

//     // Apply scale ratio squared for area conversion
//     return area * scaleRatio * scaleRatio;
// };

// /**
//  * Calculate the area of a 2-point rectangle
//  * @param {Object} point1 - First corner point with x, y coordinates
//  * @param {Object} point2 - Opposite corner point with x, y coordinates
//  * @param {number} scaleRatio - Scale ratio for converting pixels to real-world units (optional)
//  * @returns {number} - The area of the rectangle
//  */
// export const calculateRectangleArea = (point1, point2, scaleRatio = 1) => {
//     const width = Math.abs(point2.x - point1.x);
//     const height = Math.abs(point2.y - point1.y);

//     // Apply scale ratio squared for area conversion
//     return width * height * scaleRatio * scaleRatio;
// };

// /**
//  * Calculate the area of a 3-point rectangle
//  * @param {Object} p1 - First point with x, y coordinates
//  * @param {Object} p2 - Second point with x, y coordinates
//  * @param {Object} p3 - Third point with x, y coordinates
//  * @param {number} scaleRatio - Scale ratio for converting pixels to real-world units (optional)
//  * @returns {number} - The area of the rectangle
//  */
// export const calculateRect3PointArea = (p1, p2, p3, scaleRatio = 1) => {
//     // Calculate the width (distance from p1 to p2)
//     const width = calculateDistanceBetweenPoints(p1, p2);

//     // Calculate height using the perpendicular distance from p3 to line p1-p2
//     const length1 = calculateDistanceBetweenPoints(p1, p2);
//     const length2 = calculateDistanceBetweenPoints(p1, p3);
//     const length3 = calculateDistanceBetweenPoints(p2, p3);

//     // Use Heron's formula to find the area of the triangle
//     const s = (length1 + length2 + length3) / 2;
//     const triangleArea = Math.sqrt(s * (s - length1) * (s - length2) * (s - length3));

//     // Height is 2 * triangleArea / base
//     const height = 2 * triangleArea / length1;

//     // Apply scale ratio squared for area conversion
//     return width * height * scaleRatio * scaleRatio;
// };

// /**
//  * Get the center point of a shape defined by points
//  * @param {Array} points - Array of points with x, y coordinates
//  * @returns {Object} - The center point with x, y coordinates
//  */
// export const getCenterPoint = (points) => {
//     if (!points || points.length === 0) return { x: 0, y: 0 };

//     let centerX = 0, centerY = 0;

//     points.forEach(point => {
//         centerX += point.x;
//         centerY += point.y;
//     });

//     return {
//         x: centerX / points.length,
//         y: centerY / points.length
//     };
// };

// /**
//  * Format a measurement value with appropriate units
//  * @param {number} value - The measurement value
//  * @param {string} type - The type of measurement ('line', 'polyline', 'polygon', etc.)
//  * @param {boolean} isScaleDefined - Whether a scale has been defined
//  * @returns {string} - Formatted measurement string with units
//  */
// export const formatMeasurement = (value, type, isScaleDefined) => {
//     if (value === undefined || value === null) return 'N/A';

//     // Determine if the measurement is an area or distance
//     const isArea = ['polygon', 'rectangle', 'rectangle2Point', 'rectangle3p', 'rectangle3Point'].includes(type);

//     if (isArea) {
//         // Area measurements
//         return `${value.toFixed(2)} ${isScaleDefined ? 'm²' : 'px²'}`;
//     } else {
//         // Distance measurements
//         return `${value.toFixed(2)} ${isScaleDefined ? 'm' : 'px'}`;
//     }
// };

// /**
//  * Handle new measurement calculation based on type
//  * @param {Array} points - Array of points defining the measurement
//  * @param {string} type - Type of measurement ('line', 'polyline', etc.)
//  * @param {number} scaleRatio - Scale ratio for converting pixels to real-world units
//  * @returns {number} - The calculated measurement value
//  */
// export const calculateMeasurement = (points, type, scaleRatio = 1) => {
//     if (!points || points.length < 2) return 0;

//     switch (type) {
//         case 'line':
//         case 'polyline':
//         case 'rule':
//             return calculateDistance(points, scaleRatio);

//         case 'polygon':
//             return calculatePolygonArea(points, scaleRatio);

//         case 'rectangle':
//         case 'rectangle2Point':
//             return calculateRectangleArea(points[0], points[1], scaleRatio);

//         case 'rectangle3p':
//         case 'rectangle3Point':
//             if (points.length >= 3) {
//                 return calculateRect3PointArea(points[0], points[1], points[2], scaleRatio);
//             }
//             return 0;

//         default:
//             return 0;
//     }
// };