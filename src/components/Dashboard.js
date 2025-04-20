import React, { useState } from "react";

// Import necessary styles
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/thumbnail/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";


import { useFileManagement } from "./hooks/useFileManagement";
import { usePdfViewer } from "./hooks/usePdfViewer";
import { useUIState } from "./hooks/useUIState";


import { useImageViewer } from "./hooks/useImageViewer";
import PdfViewerComponent from "./Sub-Components/PdfViewerComponent";
import ImageViewerComponent from "./Sub-Components/ImageViewerComponent";
import FileListComponent from "./Sub-Components/FileListComponent";
import AreaPanel from './AreaPanel/AreaPanel';


import Header from "./Header";
// import Sidebar from "./Sidebar";
import FileCard from "./FileCard";
import FloatingToolbar from "./FloatingToolbar";
import FloatingPane from "./FloatingPane";
import ActionBar from "./ActionBar";
import PolylineTool from "./PolylineTool";
import "./Dashboard.css";
import FileUpload from "./FileUpload";


import ScaleSettingTool from './ScaleSettingTool';
import RoomCreationDialog from "./RoomArea/RoomCreationDialouge/RoomCreationDialouge";
import { useSelector } from "react-redux";


// Import environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const PDF_WORKER_URL = process.env.REACT_APP_PDF_WORKER_URL ||
  "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

function Dashboard() {

  const imageViewerHookState = useImageViewer();

  const pdfViewer = usePdfViewer();
  const fileManagement = useFileManagement(pdfViewer.setPdfRendered);
  const uiState = useUIState();
  const [showRoomDialog, setShowRoomDialog] = useState(false);
  const [selectedMeasurements, setSelectedMeasurements] = useState([]);
  const {
    files,
    isLoading,
    openedFile,
    openedFileType,
    fetchFiles,
    handleDelete,
    handleOpen,
    handleUpdateTitle,
    setOpenedFile,
    setIsLoading
  } = fileManagement;

  const {
    pdfRendered,
    setPdfRendered,
    setCurrentPage,
    viewerContainerRef
  } = pdfViewer;

  const {
    showUploadModal,
    setShowUploadModal,
    showActionBar,
    activeTool,
    setActiveTool,
    toggleActionBar,
    handleCreateProject
  } = uiState;
  const measurements = useSelector(state => state.app.measurements || []);

  // Check if at least one measurement in the array has its 'completed' flag set to true
  const hasCompletedMeasurements = measurements.some(m => m.completed === true);

  // The condition to show the panel is now solely based on having completed measurements
  const showAreaPanel = hasCompletedMeasurements;
  
  





  // Add this function inside the Dashboard component
  const closeUploadModal = () => {
    console.log("Dashboard: Closing upload modal..."); // DEBUG
    setShowUploadModal(false); // Use the setter from the hook
  };

  // Keep handleUploadSuccess as defined before
  const handleUploadSuccess = async () => {
    console.log("Dashboard: handleUploadSuccess triggered."); // DEBUG
    try {
      await fetchFiles();
      console.log("Dashboard: fetchFiles completed after upload."); // DEBUG
      console.log("Dashboard: Current files state:", files); // DEBUG (may show old state)
    } catch (error) {
      console.error("Dashboard: Error during fetchFiles after upload:", error);
    }
    // Optional: closeUploadModal(); // Close after success?
  };

  return (
    <div className="dashboard-with-sidebar">
      <Header onUploadClick={handleCreateProject} />

      <div className="content-area">


        <div className="main-content">
          {openedFile ? (
            <div className="pdf-container">
               {(openedFileType === 'pdf' || openedFileType === 'image') && showAreaPanel &&
              <AreaPanel />}

              {/* PDF Viewer */}
              <div className="pdf-view-area" ref={viewerContainerRef}>
                <div className={`pdf-tools ${activeTool ? 'tool-active' : ''}`}>
                  <FloatingToolbar
                    setActiveTool={setActiveTool}
                    toggleActionBar={toggleActionBar}
                  />
                  {/* {activeTool === "polyline" && <PolylineTool />} */}
                  <ScaleSettingTool />
                  {showActionBar && (
                    <FloatingPane>
                      <ActionBar
                        onScaleSet={pdfViewer.handleSetScale}
                        zoomPluginInstance={pdfViewer.zoomPluginInstance}
                        onClose={toggleActionBar}
                      />
                    </FloatingPane>
                  )}
                </div>
                {openedFileType === 'pdf' ? (
                  <PdfViewerComponent
                    fileUrl={openedFile}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    pdfViewerState={pdfViewer}
                    setCurrentPage={setCurrentPage}
                    setPdfRendered={setPdfRendered}
                    areaPanelVisible={showAreaPanel}
                  />
                ) : openedFileType === 'image' ? (
                  <ImageViewerComponent
                    fileUrl={openedFile}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    areaPanelVisible={showAreaPanel} 
                    
                    // containerRef={viewerContainerRef} 
                  />
                ) : (
                  <div className="unsupported-file-type">
                    <h3>Unsupported File Type</h3>
                    <p>This file format is not supported for preview.</p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="file-list-and-button">
            <FileListComponent
              files={files}
              isLoading={isLoading}
              handleDelete={handleDelete}
              handleOpen={handleOpen}
              handleUpdateTitle={handleUpdateTitle}
              handleCreateProject={handleCreateProject}
            
            />
          
            {/* <div className="create-project-container">
              <button className="create-project-button" onClick={handleCreateProject}>
                Create Project
              </button>
            </div> */}
          </div>
          

                 
          )}
        </div>
      </div>
      {showUploadModal && (
        <FileUpload
          closeModal={closeUploadModal}
          onUploadComplete={handleUploadSuccess}
        />
      )}
      {showRoomDialog && (
        <RoomCreationDialog
          measurements={selectedMeasurements}
          onClose={() => setShowRoomDialog(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;