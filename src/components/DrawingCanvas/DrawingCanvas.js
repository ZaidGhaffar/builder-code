// Create a new component: DrawingCanvas.js
import React, { useRef, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addMeasurement,
    updateReferenceLinePoints
} from '../../redux/appSlice';
import { calculateMeasurement } from '../../utils/MeasurementUtils';

const DrawingCanvas = () => {
    const canvasRef = useRef(null);
    const dispatch = useDispatch();

    const activeTool = useSelector(state => state.app.activeTool);
    const scaleRatio = useSelector(state => state.app.scaleRatio);
    const scaleWorkflowStep = useSelector(state => state.app.scaleWorkflowStep);

    // Points being currently drawn
    const [currentPoints, setCurrentPoints] = useState([]);
    const drawCurrentShape = (ctx) => {
        if (!currentPoints || currentPoints.length < 1) return;

        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.beginPath();
        ctx.strokeStyle = '#00A8FF'; // Or whatever color you prefer
        ctx.lineWidth = 2;

        // Move to first point
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

        // Draw lines to each subsequent point
        for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }

        // If it's a polygon and we have at least 3 points, close the path
        if (activeTool === 'polygon' && currentPoints.length >= 3) {
            ctx.lineTo(currentPoints[0].x, currentPoints[0].y);
        }

        ctx.stroke();

        // Draw points
        currentPoints.forEach(point => {
            ctx.beginPath();
            ctx.fillStyle = '#00A8FF';
            ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    };
    useEffect(() => {
        const canvas = canvasRef.current;
        const parentElement = canvas.parentElement;

        // Set canvas to parent size for proper scaling
        canvas.width = parentElement.offsetWidth;
        canvas.height = parentElement.offsetHeight;

        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        const getMousePos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const startDrawing = (e) => {
            isDrawing = true;
            const point = getMousePos(e);
            setCurrentPoints([point]);
        };

        const continueDrawing = (e) => {
            if (!isDrawing) return;

            const point = getMousePos(e);

            // For tools that need continuous update (like polyline)
            if (['polyline', 'polygon'].includes(activeTool)) {
                setCurrentPoints(prev => [...prev, point]);
            }
            // For two-point tools like rectangle, just update the second point
            else if (activeTool === 'rectangle2Point') {
                setCurrentPoints(prev => [prev[0], point]);
            }

            // Handle scale reference tool
            if (activeTool === 'scaleReference' && scaleWorkflowStep === 1) {
                if (currentPoints.length === 1) {
                    dispatch(updateReferenceLinePoints([currentPoints[0], point]));
                } else {
                    dispatch(updateReferenceLinePoints([currentPoints[0]]));
                }
            }

            drawCurrentShape(ctx);
        };

        const finishDrawing = () => {
            if (!isDrawing) return;
            isDrawing = false;

            if (activeTool === 'scaleReference') {
                // For scale reference tool, points are already dispatched
                return;
            }

            if (currentPoints.length >= 2) {
                // Calculate measurement based on tool type
                const measurementValue = calculateMeasurement(
                    currentPoints,
                    activeTool,
                    scaleRatio
                );

                // Create new measurement in Redux
                dispatch(addMeasurement({
                    type: activeTool,
                    points: [...currentPoints],
                    value: measurementValue
                }));
            }

            // Reset current points
            setCurrentPoints([]);
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', continueDrawing);
        canvas.addEventListener('mouseup', finishDrawing);

        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', continueDrawing);
            canvas.removeEventListener('mouseup', finishDrawing);
        };
    }, [activeTool, currentPoints, scaleWorkflowStep, dispatch, scaleRatio]);

    return (
        <canvas
            ref={canvasRef}
            className="drawing-canvas"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: activeTool ? 'auto' : 'none'
            }}
        />
    );
};

export default DrawingCanvas;