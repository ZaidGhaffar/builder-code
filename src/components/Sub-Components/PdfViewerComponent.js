import React, { useEffect, useRef, useState, useCallback } from "react";
import MeasurementCanvas from '../MeasurementCanvas/MeasurementCanvas';
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const PDF_WORKER_URL = process.env.REACT_APP_PDF_WORKER_URL ||
    "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js";

const PdfViewerComponent = ({
    fileUrl,
    isLoading,
    setIsLoading,
    pdfViewerState,
    setCurrentPage,
    areaPanelVisible,
    setPdfRendered
}) => {
    console.log(`>>> PdfViewerComponent: Rendering START. isLoading=${isLoading}, fileUrl=${fileUrl ? 'provided' : 'missing'}`);

    const containerRef = useRef(null);
    const resizeTimeoutRef = useRef(null);

    const [currentPageNumber, setCurrentPageNumber] = useState(0);
    const [currentPageRect, setCurrentPageRect] = useState(null);
    const pageChangeTimeoutRef = useRef(null); // Ref to manage the timeout

    const {
        pdfRendered,
        zoomPluginInstance, // Keep these, we might re-enable later
        pageNavigationPluginInstance,
        thumbnailPluginInstance,
        renderLoader,
        showThumbnails,
        currentZoomLevel,
        Thumbnails,
        setTotalPages
    } = pdfViewerState;




    const handlePageLayerRendered = useCallback((e) => {

        if (e.pageIndex === currentPageNumber) {


            requestAnimationFrame(() => {
                const pageElement = e.ele;
                if (pageElement) {
                    const rect = pageElement.getBoundingClientRect();

                    setCurrentPageRect({
                        top: rect.top, left: rect.left, width: rect.width, height: rect.height,
                        bottom: rect.bottom, right: rect.right, x: rect.x, y: rect.y,
                        element: pageElement
                    });
                } else {
                    console.warn(`>>> PdfViewerComponent: handlePageLayerRendered - pageElement (e.ele) was null or undefined for page ${e.pageIndex}`);
                }
            });
        } else {
            console.log(`>>> PdfViewerComponent: handlePageLayerRendered - Page index ${e.pageIndex} does not match current tracked page ${currentPageNumber}. Skipping rect calculation.`);
        }
    }, [currentPageNumber]);


    const updatePageRect = useCallback((pageIndex) => {
        if (!containerRef.current) {
            console.warn(">>> PdfViewerComponent: updatePageRect - containerRef is null.");
            return;
        }

        const pageSelector = `[data-testid="core__page-layer-${pageIndex}"]`;
        const pageElement = containerRef.current.querySelector(pageSelector);

        if (pageElement) {

            const rect = pageElement.getBoundingClientRect();

            if (rect.width > 0 && rect.height > 0) {

                setCurrentPageRect({
                    top: rect.top, left: rect.left, width: rect.width, height: rect.height,
                    bottom: rect.bottom, right: rect.right, x: rect.x, y: rect.y,
                    element: pageElement
                });
            } else {
                console.warn(`>>> PdfViewerComponent: updatePageRect - Found page element for index ${pageIndex}, but rect has zero dimensions. DOM might not be ready. Rect:`, rect);

            }
        } else {
            console.warn(`>>> PdfViewerComponent: updatePageRect - Could not find page element for index ${pageIndex} using selector "${pageSelector}". Retrying shortly...`);

            if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
            pageChangeTimeoutRef.current = setTimeout(() => updatePageRect(pageIndex), 250);
        }
    }, []);
    useEffect(() => {
        console.log(">>> PdfViewerComponent: AreaPanel visibility changed to:", areaPanelVisible);

        if (pdfRendered) {
            const recalcTimeoutId = setTimeout(() => {
                console.log(">>> PdfViewerComponent: Recalculating page rect due to AreaPanel change.");
                updatePageRect(currentPageNumber);
            }, 150);

            return () => clearTimeout(recalcTimeoutId);
        }
    }, [areaPanelVisible, pdfRendered, updatePageRect, currentPageNumber]);

    useEffect(() => {


        if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current);
            pageChangeTimeoutRef.current = null;

        }

        if (pdfRendered) {


            pageChangeTimeoutRef.current = setTimeout(() => {

                updatePageRect(currentPageNumber);
                pageChangeTimeoutRef.current = null;
            }, 150);
        } else {
            console.log(`>>> PdfViewerComponent: Page/Zoom Effect - PDF not rendered yet, skipping rect update.`);
        }


        return () => {
            if (pageChangeTimeoutRef.current) {
                clearTimeout(pageChangeTimeoutRef.current);

            }
        };
    }, [currentPageNumber, currentZoomLevel, pdfRendered, updatePageRect]);


    useEffect(() => {
        const debounceDelay = 200;

        const handleResize = () => {

            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            // Set a new timeout
            resizeTimeoutRef.current = setTimeout(() => {

                if (typeof updatePageRect === 'function') {
                    updatePageRect(currentPageNumber);
                } else {
                    console.error(">>> PdfViewerComponent: handleResize - updatePageRect is not a function?");
                }
            }, debounceDelay);
        };


        window.addEventListener('resize', handleResize);


        return () => {
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
            window.removeEventListener('resize', handleResize);

        };

    }, [updatePageRect, currentPageNumber]);

    return (
        <div className={`pdf-content ${showThumbnails ? 'with-thumbnails' : ''}`}>
            {/* Thumbnails sidebar */}
            {showThumbnails && (<div className="thumbnails-sidebar"> <Thumbnails /> </div>)}

            <div ref={containerRef} className={`pdf-viewer ${currentZoomLevel > 100 ? 'zoomed' : ''}`} style={{ position: 'relative' }} >

                <Worker workerUrl={PDF_WORKER_URL}>
                    {isLoading && !pdfRendered && (<div className="pdf-loading">Loading PDF...</div>)}
                    <Viewer
                        fileUrl={fileUrl}

                        renderLoader={renderLoader}
                        onDocumentLoad={(e) => {

                            setTotalPages(e.doc.numPages);
                            setIsLoading(false);
                            setPdfRendered(true);

                        }}
                        defaultScale={SpecialZoomLevel.PageWidth}
                        onPageChange={(e) => {


                            if (e.currentPage !== currentPageNumber) {

                                setCurrentPage(e.currentPage);
                                setCurrentPageNumber(e.currentPage);
                                setCurrentPageRect(null);

                            } else {
                                console.log(`>>> PdfViewerComponent: onPageChange - Event for same page (${e.currentPage}), state not changed.`);
                            }
                        }}

                        onPageLayerRendered={handlePageLayerRendered}
                        onError={(error) => {
                            console.error(">>> PdfViewerComponent: onError - Error loading PDF:", error);
                            setIsLoading(false);
                            alert(`Failed to load PDF: ${error.message}`);
                        }}
                        renderError={(error) => (
                            console.error(">>> PdfViewerComponent: renderError - Rendering error component.", error),
                            <div className="pdf-error"> Please Try Again </div>
                        )}
                    />
                </Worker>


                {pdfRendered && currentPageRect && currentPageRect.width > 0 ? (

                    <MeasurementCanvas
                        containerRef={containerRef}
                        currentPageRect={currentPageRect}
                        currentPageNumber={currentPageNumber}
                        zoom={currentZoomLevel}
                    />
                ) : (
                    console.log(">>> PdfViewerComponent: NOT rendering MeasurementCanvas because",
                        !pdfRendered ? 'pdfRendered is false' :
                            !currentPageRect ? 'currentPageRect is null' :
                                'currentPageRect has zero width/height'
                    )
                )}
            </div>

        </div>
    );
};

export default PdfViewerComponent;