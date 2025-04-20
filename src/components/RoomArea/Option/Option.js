// src/components/RoomArea/OptionsMenu.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteRoom, updateRoom } from '../../../redux/appSlice';

const OptionsMenu = ({ roomId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleRename = () => {
    const newName = prompt('Enter new room name:');
    if (newName && newName.trim()) {
      dispatch(updateRoom({ id: roomId, updates: { name: newName } }));
    }
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      dispatch(deleteRoom(roomId));
    }
    setIsOpen(false);
  };

  return (
    <div className="room-options-menu">
      <button
        className="options-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        •••
      </button>

      {isOpen && (
        <div className="options-dropdown">
          <button onClick={handleRename}>Rename</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default OptionsMenu;