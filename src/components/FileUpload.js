import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileUpload.css';
import { storage, ref, uploadBytesResumable, getDownloadURL } from '../utils/firebase';
import axios from 'axios';

function FileUpload({ closeModal,onUploadComplete }) {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  // const [pdfFile, setPdfFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const [uploadTasks, setUploadTasks] = useState({});
  const [cancelingFiles, setCancelingFiles] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const cancelFileUpload = (file) => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`;

    if (uploadTasks[fileId]) {
      console.log("Cancelling upload for:", file.name);
      uploadTasks[fileId].intentionallyCanceled = true;

      // Get reference to the DOM element (for animation)
      const fileElement = document.getElementById(`file-item-${fileId}`);

      // Set the file as "canceling" for UI feedback
      setCancelingFiles(prev => [...prev, fileId]);

      // Add visual canceling effect
      if (fileElement) {
        fileElement.classList.add('canceling');

        // Create a progress countdown effect
        const currentProgress = uploadProgress[fileId] || 0;
        const decrementInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (!prev[fileId] || prev[fileId] <= 5) {
              clearInterval(decrementInterval);
              return prev;
            }

            return {
              ...prev,
              [fileId]: prev[fileId] - 5 // Decrease by 5% each step
            };
          });
        }, 50); // Update every 50ms

        // Cancel actual upload after a short delay for visual feedback
        setTimeout(() => {
          // Cancel the upload task
          uploadTasks[fileId].cancel();

          // Add fade-out effect
          if (fileElement) fileElement.classList.add('fade-out');

          // Remove the task and progress after animation completes
          setTimeout(() => {
            // Remove the task from uploadTasks
            setUploadTasks(prev => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });

            // Remove the file from selected files
            setSelectedFiles(prev => prev.filter(f =>
              `${f.name}-${f.size}-${f.lastModified}` !== fileId
            ));

            // Clear the progress for this file
            setUploadProgress(prev => {
              const updated = { ...prev };
              delete updated[fileId];
              return updated;
            });

            // Remove from cancelingFiles
            setCancelingFiles(prev => prev.filter(id => id !== fileId));

            // Clear the interval if it's still running
            clearInterval(decrementInterval);
          }, 500); // Wait for fade-out animation to complete
        }, 300); // Short delay before actual cancellation
      } else {
        // Fallback if DOM element not found
        uploadTasks[fileId].cancel();

        setUploadTasks(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });

        setSelectedFiles(prev => prev.filter(f =>
          `${f.name}-${f.size}-${f.lastModified}` !== fileId
        ));

        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });

        setTimeout(() => {
          setCancelingFiles(prev => prev.filter(id => id !== fileId));
        }, 1000);
      }
    }
  };
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    // Check file size (e.g., limit to 100 MB)
    const maxSize = 100 * 1024 * 1024; // 100 MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setError('File size exceeds the limit (100 MB).');
      return;
    }

    setSelectedFiles(prevFiles => [...prevFiles, ...files]);
    setError(null);

  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) {
      setError('No files selected!');
      return;
    }

    setIsUploading(true);
    setError(null);
    const newTasks = {};

    try {
      const uploadPromises = selectedFiles.map((file) => {
        return new Promise(async (resolve, reject) => {
          const fileId = `${file.name}-${file.size}-${file.lastModified}`;
          const fileName = `pdfs/${Date.now()}-${file.name}`;
          const storageRef = ref(storage, fileName);

          // Start the upload
          const uploadTask = uploadBytesResumable(storageRef, file);
          newTasks[fileId] = uploadTask;

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(prev => ({
                ...prev,
                [fileId]: progress
              }));
            },
            (error) => {
              if (uploadTask.intentionallyCanceled) {
                resolve({ canceled: true });
              } else {
                reject(error);
              }
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                originalname: file.name,
                url: downloadUrl,
                firebasePath: fileName
              });
            }
          );
        });
      });

      setUploadTasks(newTasks);
      const results = await Promise.allSettled(uploadPromises);
      
      const successfullyUploadedFilesInfo = results
        .filter(result => result.status === 'fulfilled' && result.value && !result.value.canceled)
        .map(result => result.value);

      if (successfullyUploadedFilesInfo.length > 0) {
        setUploadedFiles(prevUploadedFiles => [
          ...prevUploadedFiles,
          ...successfullyUploadedFilesInfo
        ]);
        
        if (onUploadComplete) {
          onUploadComplete();
        }
      }

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error uploading files:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress({});
    }
  };

  const handleDeleteClick = async (file) => {
    try {

      if (file.firebasePath) {
        const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
        await axios.delete(`${apiBaseUrl}/files/${encodeURIComponent(file.firebasePath)}`);
        console.log("File successfully deleted from Firebase:", file.firebasePath);
      }

      
      if (onUploadComplete) { 
        onUploadComplete();
    }
      setUploadedFiles(uploadedFiles.filter((f) => f !== file));
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file. Please try again.");
    }
  };

  const handleCreateProjectClick = async () => {
    try {

      navigate('/dashboard');
      closeModal();
    } catch (error) {
      console.error("Error creating project:", error);
      setError("Failed to create project. Please try again.");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    
    document.addEventListener("mousedown", handleClickOutside);

    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeModal]);

  return (
    <div className="file-upload">
      <div className="file-upload-container" ref={modalRef}>

        <div className="upload-file-area">
          <div className="upload-frame">
            <div className="folder-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="65"
                height="65"
                viewBox="0 0 65 65"
                fill="none"
              >
                <path
                  d="M32.0427 59.9475H15.9442C8.64067 59.9319 2.72387 54.0151 2.70828 46.7116V18.7093C2.70076 15.1914 4.09103 11.8146 6.57324 9.32171C9.05546 6.82886 12.4263 5.42417 15.9442 5.41666H26.8844C31.0011 5.41666 34.3384 8.75396 34.3384 12.8707C34.3538 14.6331 35.7787 16.058 37.5411 16.0734H48.4813C55.7848 16.089 61.7016 22.0058 61.7172 29.3093M58.2028 44.0474L47.1776 54.5908C46.9167 54.8299 46.5916 54.9876 46.2423 55.0443L41.1973 55.8095L41.9626 51.133C42.0159 50.8155 42.1759 50.5256 42.416 50.3111L47.9145 45.0394L53.4129 39.7677C54.1148 39.117 55.035 38.7529 55.9921 38.7474C56.8564 38.7295 57.6924 39.0558 58.3161 39.6543C58.8921 40.1885 59.2206 40.9378 59.2231 41.7233C59.2176 42.6055 58.8484 43.4463 58.2028 44.0474Z"
                  stroke="#5C5E64"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p>
              Drag & drop files or{' '}
              <span className="browse" onClick={handleBrowseClick}>
                Browse
              </span>
            </p>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        {selectedFiles.length > 0 && (
          <>
            <div className="heading">
              Uploading - {selectedFiles.length}/{selectedFiles.length} files
            </div>
            <div className="selected-files">
              {selectedFiles.map((file, index) => {
                const fileId = `${file.name}-${file.size}-${file.lastModified}`;
                const progress = uploadProgress[fileId] || 0;
                const isCanceling = cancelingFiles.includes(fileId);
                const isCurrentlyUploading = uploadTasks[fileId] != null;

                return (
                  <div
                    key={index}
                    className={`progress-frame ${isCanceling ? 'canceling' : ''}`}
                    id={`file-item-${fileId}`}
                  >
                    <div className="inner-frame">
                      <div className="file-name">{file.name}</div>
                      {isCurrentlyUploading && !isCanceling && (
                        <button
                          className="cancel-upload-button"
                          onClick={() => cancelFileUpload(file)}
                          aria-label="Cancel upload"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        {uploadedFiles.length > 0 && (
          <>
          {console.log("uploadedFiles",uploadedFiles)}
            <div className="heading">Uploaded</div>
            <div className="uploaded-files">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="uploaded-file-frame">
                  <div className="inner-frame">
                    <div className="file-name">{file.originalname}</div>
                    <button
                      className="trash-button"
                      onClick={() => handleDeleteClick(file)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M18.79 7C18.3537 7 18 7.35369 18 7.79V16.63C18 18.4912 16.4912 20 14.63 20H8.95C7.0888 20 5.58 18.4912 5.58 16.63V7.79C5.58 7.35369 5.22631 7 4.79 7C4.3537 7 4 7.35369 4 7.79V16.63C4.02742 19.3719 6.25799 21.5801 9 21.58H14.68C17.4025 21.5529 19.6029 19.3525 19.63 16.63V7.79C19.6304 7.57152 19.5404 7.36262 19.3812 7.21294C19.2221 7.06326 19.008 6.98617 18.79 7Z"
                          fill="#5C5E64"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M18.79 5.58H4.79C4.3537 5.58 4 5.22631 4 4.79C4 4.35369 4.3537 4 4.79 4H7.44L8.62 2.72C9.07107 2.26141 9.68675 2.00218 10.33 2H13.25C13.8839 1.99999 14.4918 2.25179 14.94 2.7L16.14 4H18.79C19.2263 4 19.58 4.35369 19.58 4.79C19.58 5.22631 19.2263 5.58 18.79 5.58ZM13.25 3.58H10.33C10.1301 3.58007 9.93744 3.65499 9.79 3.79L9.6 3.99H13.98L13.79 3.79C13.6436 3.65326 13.4503 3.57807 13.25 3.58Z"
                          fill="#5C5E64"
                        />
                        <path
                          d="M11.04 8.79V16.79C11.04 17.2042 11.3758 17.54 11.79 17.54C12.2042 17.54 12.54 17.2042 12.54 16.79V8.79C12.54 8.37579 12.2042 8.04 11.79 8.04C11.3758 8.04 11.04 8.37579 11.04 8.79Z"
                          fill="#5C5E64"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {error && !Object.values(uploadTasks).some(task => task.intentionallyCanceled) && (
          <p className="error-message">{error}</p>
        )}

        {selectedFiles.length > 0 ? (

          <div className="action-buttons">
            <button
              className="upload-button"
              onClick={handleUploadClick}
              disabled={isUploading}

            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        ) : uploadedFiles.length > 0 ? (
          <div className="action-buttons">
            <button className="cancel-button-upload" onClick={closeModal}>
              <span>Cancel</span>
            </button>
            <button
              className="create-project-button"
              onClick={handleCreateProjectClick}
            >
              <span>Create Project</span>
            </button>
          </div>
        ) : (

          <div className="action-buttons">

            <button
              className="upload-button"
              onClick={handleUploadClick}
              disabled={true}
            >
              Upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FileUpload;




