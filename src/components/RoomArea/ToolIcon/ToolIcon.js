// src/components/RoomArea/ToolIcon.js
import React from 'react';
import { ReactComponent as PolylineIcon } from '../../../assets/Polyline.svg';
import { ReactComponent as PolygonIcon } from '../../../assets/Polygon.svg';
import { ReactComponent as Rectangle2PointIcon } from '../../../assets/Rectangle2Point.svg';
import { ReactComponent as Rectangle3PointIcon } from '../../../assets/Rectangle3Point.svg';
import { ReactComponent as StickyNoteIcon } from '../../../assets/StickyNote.svg';
import { ReactComponent as RuleIcon } from '../../../assets/Rule.svg';
import { ReactComponent as ScaleIcon } from '../../../assets/Scale.svg';
import { ReactComponent as M } from '../../../assets/M.svg';

const ToolIcon = ({ toolType }) => {
    const getIcon = () => {
        switch (toolType?.toLowerCase()) {
            case 'polyline':
                return <PolylineIcon />;
            case 'polygon':
                return <PolygonIcon />;
            case 'rectangle':
            case 'rectangle2point':
                return <Rectangle2PointIcon />;
            case 'rectangle3point':
                return <Rectangle3PointIcon />;
            case 'stickynote':
                return <StickyNoteIcon />;
            case 'rule':
            case 'distance':
                return <RuleIcon />;
            case 'scale':
                return <ScaleIcon />;
            case 'measurement':
                return <M />;
            default:
                // For unknown types, you could use an existing icon or return null
                return <PolylineIcon />;
        }
    };

    return (
        <div className="tool-icon">
            {getIcon()}
        </div>
    );
};

export default ToolIcon;