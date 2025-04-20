
import React, { useState, useEffect, useRef } from "react";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { ProgressBar } from "@react-pdf-viewer/core";

export const usePdfViewer = () => {



  const [pdfRendered, setPdfRendered] = useState(false);


  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const viewerContainerRef = useRef(null);
  const [currentZoomLevel, setCurrentZoomLevel] = useState(100);

  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();

  const ZoomIn = zoomPluginInstance ? zoomPluginInstance.ZoomIn : null;
  const ZoomOut = zoomPluginInstance ? zoomPluginInstance.ZoomOut : null;
  const Thumbnails = thumbnailPluginInstance ? thumbnailPluginInstance.Thumbnails : null;

  const toggleThumbnails = () => {
    setShowThumbnails(!showThumbnails);
  };

  const handleSetScale = (scale, list) => {
    console.log(`Scale set to ${scale}, List set to ${list}`);
  };



  useEffect(() => {
    if (!zoomPluginInstance || !pdfRendered) return;

    let unsubscribe;
    const timeoutId = setTimeout(() => {
      if (zoomPluginInstance.store) {
        unsubscribe = zoomPluginInstance.store.subscribe(() => {
          const zoomState = zoomPluginInstance.store.get();
          if (zoomState && typeof zoomState.scale === 'number') {
            setCurrentZoomLevel(zoomState.scale * 100);
          }
        });
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [zoomPluginInstance, pdfRendered]);


  // Handle PDF loading progress
  const renderLoader = (percentages) => (
    <div className="pdf-loader-overlay">
      <div className="pdf-loader-container">
        <div className="pdf-loader-icon">
          <svg width="50" height="50" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M12,19.2C9.5,19.2 7.29,17.92 6,16C6.03,14 10,12.9 12,12.9C14,12.9 17.97,14 18,16C16.71,17.92 14.5,19.2 12,19.2M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,6.47 17.5,2 12,2Z" />
          </svg>
        </div>
        <h3 className="pdf-loader-title">Loading PDF Document</h3>
        <ProgressBar progress={Math.round(percentages)} />
        <div className="pdf-loader-text">{Math.round(percentages)}% Complete</div>
      </div>
    </div>
  );

  return {
    pdfRendered,
    setPdfRendered,
    totalPages,
    setTotalPages,
    currentPage,
    setCurrentPage,
    showThumbnails,
    currentZoomLevel,
    viewerContainerRef,
    zoomPluginInstance,
    pageNavigationPluginInstance,
    thumbnailPluginInstance,
    ZoomIn,
    ZoomOut,
    Thumbnails,

    toggleThumbnails,
    handleSetScale,
    renderLoader
  };
}

