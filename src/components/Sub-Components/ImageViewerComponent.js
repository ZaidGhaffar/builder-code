import React, { useEffect, useRef, useState, useCallback } from "react";
import MeasurementCanvas from '../MeasurementCanvas/MeasurementCanvas'; 


const ImageViewerComponent = ({
    fileUrl,
    isLoading,
    setIsLoading,
    areaPanelVisible
    // containerRef 
}) => {
    console.log(`>>> ImageViewerComponent: Rendering START. isLoading=${isLoading}, fileUrl=${fileUrl ? 'provided' : 'missing'}`);

    const imageRef = useRef(null);
    
    const internalContainerRef = useRef(null); 

    const [imageRendered, setImageRendered] = useState(false);
    const [imageRect, setImageRect] = useState(null);
    const resizeTimeoutRef = useRef(null);
 
    
    const updateImageRect = useCallback(() => {
        
        if (imageRef.current && internalContainerRef && internalContainerRef.current) {
            const imgElement = imageRef.current;
            const containerElement = internalContainerRef.current; 

            const imgBounds = imgElement.getBoundingClientRect();
            const containerBounds = containerElement.getBoundingClientRect();

            if (imgBounds.width > 0 && imgBounds.height > 0) {
                const calculatedRect = {
                    
                    top: imgBounds.top - containerBounds.top + containerElement.scrollTop,
                    left: imgBounds.left - containerBounds.left + containerElement.scrollLeft,
                    width: imgBounds.width,
                    height: imgBounds.height,
                    element: imgElement,
                    bottom: imgBounds.bottom - containerBounds.top + containerElement.scrollTop,
                    right: imgBounds.right - containerBounds.left + containerElement.scrollLeft,
                    x: imgBounds.left - containerBounds.left + containerElement.scrollLeft,
                    y: imgBounds.top - containerBounds.top + containerElement.scrollTop,
                };
                setImageRect(calculatedRect);
                console.log(">>> ImageViewer: Updated imageRect (relative to internal container)", calculatedRect);
            } else {
                console.warn(">>> ImageViewer: updateImageRect - Image bounds have zero dimensions.", imgBounds);
            }
        } else {
            console.warn(`>>> ImageViewer: updateImageRect - Refs not ready. imageRef: ${!!imageRef.current}, internalContainerRef: ${!!internalContainerRef?.current}`);
        }
    
    }, []); 

    
    useEffect(() => {
        console.log(">>> ImageViewer: fileUrl changed, resetting state.");
        setImageRendered(false);
        setImageRect(null);
    }, [fileUrl]);

    
    useEffect(() => {
        const debounceDelay = 200;
        const handleResize = () => {
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
            resizeTimeoutRef.current = setTimeout(() => {
                console.log(">>> ImageViewer: Resize detected, updating image rect.");
                if (imageRendered) {
                   updateImageRect(); // Uses the updated useCallback version
                }
            }, debounceDelay);
        };
        window.addEventListener('resize', handleResize);
        console.log(">>> ImageViewer: Resize listener added.");
        return () => {
            if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
            window.removeEventListener('resize', handleResize);
            console.log(">>> ImageViewer: Resize listener removed.");
        };
    
    }, [imageRendered, updateImageRect]); 

    const handleImageLoad = () => {
        console.log(">>> ImageViewer: Image onLoad fired.");
        setIsLoading(false);
        setImageRendered(true);
        setTimeout(() => {
             console.log(">>> ImageViewer: Attempting initial image rect calculation post-load.");
             updateImageRect(); 
        }, 100);
    };
    useEffect(() => {
        console.log(">>> ImageViewerComponent: AreaPanel visibility changed to:", areaPanelVisible);
        
        if (imageRendered) {
            const recalcTimeoutId = setTimeout(() => {
                console.log(">>> ImageViewerComponent: Recalculating image rect due to AreaPanel change.");
                updateImageRect();
            }, 150); 

            return () => clearTimeout(recalcTimeoutId); 
        }
    }, [areaPanelVisible, imageRendered, updateImageRect]);
    const handleImageError = (e) => {
        console.error(">>> ImageViewer: Error loading image:", fileUrl, e);
        setIsLoading(false);
        setImageRendered(false);
        setImageRect(null);
        alert(`Failed to load image: ${fileUrl}`);
    };

    
    return (
        
        <div
        ref={internalContainerRef}
        className="image-viewer" 
        style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'auto'
        }}
    >
            
            {isLoading && <div className="image-loading">Loading image...</div>}

            
            <img
                ref={imageRef}
                src={fileUrl}
                alt="Document preview"
                onLoad={handleImageLoad}
                onError={handleImageError}
                style={{
                    display: isLoading ? 'none' : 'block',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    margin: 'auto', 
                  
                }}
            />

            
            {imageRendered && imageRect && imageRect.width > 0 && imageRect.height > 0 ? (
                <MeasurementCanvas
            
                    containerRef={internalContainerRef}
                    currentPageRect={imageRect} 
                    currentPageNumber={0}
                    zoom={100} 
                />
            ) : (
                 imageRendered && console.log(">>> ImageViewer: NOT rendering MeasurementCanvas. Condition failed. imageRendered=", imageRendered, "imageRect=", imageRect)
            )}
        </div> 
    );
};

export default ImageViewerComponent;