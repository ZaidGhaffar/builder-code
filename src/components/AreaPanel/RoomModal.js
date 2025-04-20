// import React, { useState } from 'react';
// import './RoomModal.css'; // We'll create this style file

// const RoomModal = ({ isOpen, onClose, onSave, initialRoomName = "" }) => {
//     const [roomName, setRoomName] = useState(initialRoomName);

//     if (!isOpen) return null;

//     const handleSave = () => {
//         onSave(roomName);
//         onClose();
//     };

//     return (
//         <div className="modal-backdrop">
//             <div className="room-modal">
//                 <div className="modal-header">
//                     <h4>Room title</h4>
//                 </div>
//                 <div className="modal-content">
//                     <input
//                         type="text"
//                         value={roomName}
//                         onChange={(e) => setRoomName(e.target.value)}
//                         placeholder="Enter room name"
//                         className="room-input"
//                         autoFocus
//                     />
//                 </div>
//                 <div className="modal-footer">
//                     <button className="cancel-btn" onClick={onClose}>
//                         Cancel
//                     </button>
//                     <button
//                         className="save-btn"
//                         onClick={handleSave}
//                         disabled={!roomName.trim()}
//                     >
//                         Save
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RoomModal;