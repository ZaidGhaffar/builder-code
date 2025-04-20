// ToolIcon.jsx
import React from 'react';

const ToolIcon = ({ toolType }) => {
    const getIconByToolType = (type) => {
        switch (type) {
            case 'rectangle':
                return <svg>...</svg>; // Rectangle icon
            case 'polygon':
                return <svg>...</svg>; // Polygon icon
            case 'polyline':
                return <svg>...</svg>; // Polyline/zigzag icon
            default:
                return <svg>...</svg>; // Default icon
        }
    };

    return (
        <div className="tool-icon">
            {getIconByToolType(toolType)}
        </div>
    );
};

export default ToolIcon;