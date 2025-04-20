// RoomCreationDialog.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addRoom } from '../../../redux/appSlice';

const RoomCreationDialog = ({ measurementIds, onClose }) => {
    const [roomName, setRoomName] = useState('Room ' + (Math.floor(Math.random() * 1000)));
    const [toolType, setToolType] = useState('polygon'); // Default tool type
    const dispatch = useDispatch();
    const measurements = useSelector(state => state.app.measurements);

    const selectedMeasurements = measurements.filter(m => measurementIds.includes(m.id));

    // Determine the most appropriate tool type based on the measurements
    const determineToolType = () => {
        if (selectedMeasurements.length === 0) return 'polygon';

        // Count tool types
        const toolCounts = selectedMeasurements.reduce((counts, m) => {
            counts[m.type] = (counts[m.type] || 0) + 1;
            return counts;
        }, {});

        // Find the most common tool type
        let maxCount = 0;
        let dominantTool = 'polygon';

        for (const [tool, count] of Object.entries(toolCounts)) {
            if (count > maxCount) {
                maxCount = count;
                dominantTool = tool;
            }
        }

        return dominantTool;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addRoom({
            name: roomName,
            toolType: toolType || determineToolType(),
            measurementIds
        }));
        onClose();
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog-content">
                <h2>Create New Room</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Room Name</label>
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Room Type</label>
                        <select
                            value={toolType}
                            onChange={(e) => setToolType(e.target.value)}
                        >
                            <option value="rectangle">Rectangle</option>
                            <option value="polygon">Polygon</option>
                            <option value="polyline">Polyline</option>
                        </select>
                    </div>

                    <div className="button-group">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Create Room</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoomCreationDialog;