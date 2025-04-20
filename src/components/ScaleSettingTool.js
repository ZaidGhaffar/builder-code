// src/components/ScaleSettingTool.js
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import './ScaleSettingTool.css';

const ScaleSettingTool = () => {
    const dispatch = useDispatch();

    // Get relevant state from Redux
    const scaleWorkflowStep = useSelector((state) => state.app.scaleWorkflowStep);
    const referenceLinePoints = useSelector((state) => state.app.referenceLinePoints);
    const activeTool = useSelector((state) => state.app.activeTool);

    // Only show when in scale reference mode
    if (activeTool !== 'scaleReference') {
        return null;
    }

    // Determine which step instructions to show
    const renderStepInstructions = () => {
        switch (scaleWorkflowStep) {
            case 1:
                return (
                    <div className="scale-instruction">
                        <div className="step-indicator">Step 1 of 2</div>
                        <h3>Draw Reference Line</h3>
                        <p>Click and drag to draw a line along a known dimension in the document.</p>
                        {referenceLinePoints.length === 2 ? (
                            <div className="hint success">
                                <span className="icon">✓</span>
                                Line drawn! Click the M button to continue.
                            </div>
                        ) : (
                            <div className="hint">
                                <span className="icon">ℹ️</span>
                                Draw a line between two points with a known real-world distance.
                            </div>
                        )}
                    </div>
                );

            case 2:
                return (
                    <div className="scale-instruction">
                        <div className="step-indicator">Step 2 of 2</div>
                        <h3>Enter Reference Measurement</h3>
                        <p>Enter the real-world measurement of the line you've drawn.</p>
                        <div className="hint">
                            <span className="icon">ℹ️</span>
                            For best results, use a clearly defined dimension like a wall or doorway.
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="scale-setting-tool">
            {renderStepInstructions()}
        </div>
    );
};

export default ScaleSettingTool;