
import React, { useState, useEffect } from 'react';

// import './StickyNote.css';

const StickyNote = ({
    screenPoint,         
    measurementId,       
    initialText = '',    
    onTextChange,       
    isSelected = false,
    isReadOnly = false
}) => {
    const [text, setText] = useState(initialText);
    
    const [isEditing, setIsEditing] = useState(!initialText && isSelected && !isReadOnly);

    
    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleTextChange = (event) => {
        
        setText(event.target.value);
    };

    const handleBlur = () => {
        setIsEditing(false); 
        if (text !== initialText && onTextChange) {
            onTextChange(text);
        }
    };

    const handleContainerClick = () => {
    
        if (isSelected && !isReadOnly && !isEditing) {
            setIsEditing(true);
        }
    };

    
    const noteWidth = 150;
    const noteHeight = 100;

    
    if (!screenPoint || isNaN(screenPoint.x) || isNaN(screenPoint.y)) {
        console.warn(`StickyNote ${measurementId}: Invalid screenPoint`, screenPoint);
        return null;
    }

    return (
        <foreignObject
            x={screenPoint.x}
            y={screenPoint.y}
            width={noteWidth}
            height={noteHeight}
            
            
        >
            
            <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#FFFACD', 
                    padding: '8px',
                    border: isSelected ? '2px solid #FFA500' : '1px solid #DAC79D', 
                    boxShadow: '3px 3px 7px rgba(0,0,0,0.2)',
                    boxSizing: 'border-box',
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: (isSelected && !isReadOnly && !isEditing) ? 'pointer' : 'default', 
                    position: 'relative', 
                    overflow: 'hidden', 
                }}
                onClick={handleContainerClick}
            >
                <textarea
                    autoFocus={isEditing}
                    style={{
                        flexGrow: 1, 
                        border: 'none',
                        backgroundColor: 'transparent',
                        resize: 'none',
                        fontFamily: 'inherit',
                        fontSize: '13px', 
                        outline: 'none', 
                        overflowY: 'auto', 
                        padding: 0,
                        margin: 0, 
                        color: '#333',
                    }}
                    value={text}
                    readOnly={isReadOnly || !isEditing} 
                    onChange={handleTextChange}
                    onBlur={handleBlur} 
                    placeholder={(isEditing && !isReadOnly) ? "Add note..." : ""} 
                />
                
                {!isEditing && !text && (
                     <div style={{
                         position: 'absolute',
                         top: '8px', 
                         left: '8px',
                         color: '#888',
                         fontSize: '13px',
                         pointerEvents: 'none',
                         fontStyle: 'italic',
                     }}>
                         Click to add text
                     </div>
                 )}
                
            </div>
        </foreignObject>
    );
};

export default StickyNote;