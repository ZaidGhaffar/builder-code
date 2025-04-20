import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './FileCard.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const FileCard = ({ file, onDelete, onOpen, onUpdateTitle }) => {
  const [thumbnailSrc, setThumbnailSrc] = useState('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const modalRef = useRef(null);

  const handleCardClick = (e) => {
    // Only open the file if we're not clicking on dropdown or edit modal elements
    if (!e.target.closest('.file-actions') && !showEditModal) {
      onOpen(file);
    }
  };

  const handleEditTitle = () => {
    const currentTitle = file.originalname.includes('-')
      ? file.originalname.substring(file.originalname.indexOf('-') + 1)
      : file.originalname;

    setEditedTitle(currentTitle);
    setShowEditModal(true);
    setShowDropdown(false);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditedTitle('');
  };

  const handleSaveTitle = () => {
    if (onUpdateTitle && editedTitle.trim()) {
      onUpdateTitle(file, editedTitle.trim());
    }
    setShowEditModal(false);
  };

  useEffect(() => {
    // Check if it's a PDF using filename extension
    const isPdf = file.originalname?.toLowerCase().endsWith('.pdf') ||
      file.filename?.toLowerCase().endsWith('.pdf') ||
      file.url?.toLowerCase().includes('.pdf');

    if (isPdf) {
      setIsGeneratingThumbnail(true);

      const generateThumbnail = async () => {
        try {
          // Use the proxy endpoint instead of direct Firebase URL
          const pdfUrl = `${process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"}/proxy-pdf?url=${encodeURIComponent(file.url)}`;

          // Load the document
          const loadingTask = pdfjsLib.getDocument(pdfUrl);
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);

          // Use a smaller scale for thumbnails
          const scale = 0.5;
          const viewport = page.getViewport({ scale });

          // Create a canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          // Render the PDF page
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          // Convert to image 
          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setThumbnailSrc(thumbnailDataUrl);
        } catch (err) {
          console.error('Error generating PDF thumbnail:', err);
          setThumbnailSrc('/images/pdf-icon.png'); // Set a fallback image path
        } finally {
          setIsGeneratingThumbnail(false);
        }
      };

      generateThumbnail();
    }
  }, [file]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target) && showEditModal) {
        handleCancelEdit();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditModal]);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const renderThumbnail = () => {
    if (isGeneratingThumbnail) {
      return <div className="thumbnail-loading">Loading preview...</div>;
    }

    if (thumbnailSrc) {
      return <img src={thumbnailSrc || "/placeholder.svg"} alt="PDF preview" className="file-thumbnail" />;
    }

    // Fallback based on file type
    const getFileExtension = () => {
      const name = file.originalname || file.filename || file.url || '';
      return name.split('.').pop().toLowerCase();
    };

    const extension = getFileExtension();

    if (extension === 'pdf') {
      return <div className="pdf-icon">PDF</div>;
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <img src={file.url || "/placeholder.svg"} alt="Image preview" className="file-thumbnail" />;
    } else {
      return <div className="generic-file-icon">{extension.toUpperCase()}</div>;
    }
  };

  return (
    <div className="file-card" onClick={handleCardClick}>
      <div className="file-thumbnail">
        {renderThumbnail()}
      </div>
      <div className='Bottom-div'>
        <div className="file-info">
          <h3 className="file-name">
            {file.originalname.includes('-')
              ? file.originalname.substring(file.originalname.indexOf('-') + 1)
              : file.originalname}
          </h3>
          <p className="file-date">
            {file.date &&
              new Date(file.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
          </p>
        </div>
        <div className="file-actions" ref={dropdownRef}>
          <button className="options-button" onClick={toggleDropdown}>
            <span className="dots">&#8942;</span>
          </button>
          {showDropdown && (
            <div className="dropdown-menu-buttons">
              <div className="dropdown-menu">
                <button onClick={handleEditTitle}>Edit title</button>
                <button onClick={() => {
                  onDelete(file);
                  setShowDropdown(false);
                }}>Delete</button>
              </div>
            </div>
          )}
          {showEditModal && (
            <div className="edit-modal-positioned" ref={modalRef}>
              <h3 className="edit-modal-title">Site plan title</h3>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="edit-title-input"
                autoFocus
              />
              <div className="edit-modal-actions">
                <button className="cancel-button" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button className="save-button" onClick={handleSaveTitle}>
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileCard;