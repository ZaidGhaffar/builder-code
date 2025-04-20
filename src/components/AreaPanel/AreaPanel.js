// src/components/AreaPanel.js
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    updateMeasurement,
    deleteMeasurement,
    selectMeasurement
} from '../../redux/appSlice';




import './AreaPanel.css';



const MeasurementItem = ({ measurement, selectedMeasurementId, onSelect, onEdit, onDelete, formatValue }) => {

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <div
            className={`measurement-item ${selectedMeasurementId === measurement.id ? 'selected' : ''}`}
            onClick={(e) => {
                if (e.target.closest('.three-dots-menu') || e.target.closest('.menu-popup')) {
                    e.stopPropagation();
                    return;
                }
                onSelect(measurement.id);
            }}
        >
            <div className="measurement-info">
                <div className="measurement-name">
                    {measurement.name || `${measurement.type} ${measurement.id.substring(0, 4)}`}
                </div>
                <div className="measurement-value">
                    {formatValue(measurement)}
                </div>
            </div>

            <div
                className="three-dots-menu"
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(!menuOpen);
                }}
            >
                {/* Three dots SVG */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="6" r="2" fill="#5C5E64" />
                    <circle cx="12" cy="12" r="2" fill="#5C5E64" />
                    <circle cx="12" cy="18" r="2" fill="#5C5E64" />
                </svg>
            </div>

            {menuOpen && (
                <div className="menu-popup" ref={menuRef}>
                    <div className='menu-option-main-div'>

                        <div
                            className="menu-option edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(measurement, e); // Pass the event here
                                setMenuOpen(false);
                            }}
                        >
                            Edit
                        </div>
                        <div
                            className="menu-option delete"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(measurement.id);
                                setMenuOpen(false);
                            }}
                        >
                            Delete
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
const RoomTitleModal = ({ isOpen, measurement, position, onClose, onSave }) => {
    const [roomName, setRoomName] = useState(measurement?.name);
    const modalRef = useRef(null);

    if (!isOpen) return null;

    return (
        <div className="room-modal-overlay">
            <div
                className="room-modal"
                ref={modalRef}
                style={{
                    position: 'absolute',
                    top: `${position.top}px`,
                    left: `${position.left}px`,
                    transform: 'none'
                }}
            >
                {/* Modal content stays the same */}
                <div className="modal-header">
                    <h4>Room title</h4>
                </div>
                <div className="modal-content">
                    <input
                        type="text"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="room-input"
                        autoFocus
                    />
                </div>
                <div className="modal-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="save-btn"
                        onClick={() => onSave(roomName)}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

const AreaPanel = () => {
    const dispatch = useDispatch();
    const measurements = useSelector((state) => state.app.measurements || []);
    const selectedMeasurementId = useSelector((state) => state.app.selectedMeasurementId);
    const scaleRatio = useSelector((state) => state.app.scaleRatio);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [groupByType, setGroupByType] = useState(false);
    const [isModalOpen, setModalOpen] = useState(false);
    const [currentMeasurement, setCurrentMeasurement] = useState(null);


    const handleSelectMeasurement = (id) => {
        dispatch({
            type: "app/selectMeasurement",
            payload: id
        });
    };


    const formatMeasurementValue = (measurement) => {
        if (!measurement || measurement.value === undefined) return 'N/A';
        if (!scaleRatio) return 'Set scale first';

        const value = measurement.value;
        const type = measurement.type;

        // Get appropriate unit based on measurement type
        let unit = '';
        let decimalPlaces = 2;

        switch (type) {
            case 'distance':
            case 'polyline':
            case 'rule':  // Add rule tool
                unit = 'm'; // meters
                break;

            case 'area':
            case 'polygon':
            case 'rectangle':
            case 'rectangle2Point': // Add rectangle2Point tool
            case 'rectangle3Point': // Add rectangle3Point tool
                unit = 'm²'; // square meters
                break;

            case 'angle':
                unit = '°'; // degrees
                decimalPlaces = 1;
                break;

            case 'stickyNote':
                return 'N/A'; // stickyNote doesn't have a measurement value

            default:
                unit = '';
        }

        // Format the value with the proper number of decimal places
        const formattedValue = value.toFixed(decimalPlaces);

        // Return the formatted value with its unit
        return `${formattedValue} ${unit}`;
    };
    // Group measurements by type
    const measurementsByType = measurements.reduce((groups, measurement) => {
        const type = measurement.type || 'unknown';
        if (!groups[type]) {
            groups[type] = [];
        }
        groups[type].push(measurement);
        return groups;
    }, {});


    const handleEdit = (measurement, event) => {
        // Get the position of the menu popup
        const menuElement = event.target.closest('.menu-popup');
        const rect = menuElement.getBoundingClientRect();

        setMenuPosition({
            top: rect.top,
            left: rect.left
        });

        setCurrentMeasurement(measurement);
        setModalOpen(true);
    };


    const handleSaveEdit = () => {
        if (editingId) {
            dispatch(updateMeasurement({
                id: editingId,
                name: editName
            }));
            setEditingId(null);
        }
    };

    const handleDelete = (id) => {
        dispatch(deleteMeasurement(id));
        if (selectedMeasurementId === id) {
            dispatch(selectMeasurement(null));
        }
    };
    const handleSaveRoomName = (newName) => {
        dispatch(updateMeasurement({
            id: currentMeasurement.id,
            name: newName
        }));
        setModalOpen(false);
        setCurrentMeasurement(null);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentMeasurement(null);
    };
    const handleSelect = (id) => {
        dispatch(selectMeasurement(id));
    };


    return (
        <div className="area-panel">
            <div className='Sort'>
            <div className="area-panel-header">
                <h3>Rooms</h3>

            </div>
            
            {!scaleRatio ? (
                <div className="scale-warning-panel">
                    <p>Define scale to enable measurements</p>
                </div>
            ) : (
                <>



                    {measurements.length === 0 ? (
                        <div className="no-measurements">No measurements yet</div>
                    ) : groupByType ? (
                        // Group by measurement type
                        Object.entries(measurementsByType).map(([type, items]) => (
                            <div key={type} className="measurement-group">
                                <h4 className="group-title">{type}</h4>
                                <div className="measurements-list">
                                    {items.map(measurement => (
                                        <MeasurementItem
                                            key={measurement.id}
                                            measurement={measurement}
                                            selectedMeasurementId={selectedMeasurementId}
                                            onSelect={handleSelect}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            formatValue={formatMeasurementValue}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="measurements-list">
                            
                            {measurements.map(measurement => (
                                <MeasurementItem
                                    key={measurement.id}
                                    measurement={measurement}
                                    selectedMeasurementId={selectedMeasurementId}
                                    onSelect={handleSelect}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    formatValue={formatMeasurementValue}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
            <RoomTitleModal
                isOpen={isModalOpen}
                measurement={currentMeasurement}
                position={menuPosition}  // Pass the position
                onClose={handleCloseModal}
                onSave={handleSaveRoomName}
            />
        </div>
        </div>
    );
};

export default AreaPanel;