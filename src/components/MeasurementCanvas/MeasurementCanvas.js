// MeasurementCanvas.js
import React, { useRef, useState, useEffect, useCallback } from "react"; // Import useCallback
import { useSelector, useDispatch } from "react-redux";
import "./MeasurementCanvas.css";

import StickyNote from "./components/StrickyNote";
import AngleIndicators from "./components/AngleIndicators";
import DebugOverlay from "./components/DebugOverlay";
import DistanceLabels from "./components/DistanceLabels";
import Points from "./components/Points";

const MeasurementCanvas = ({
  containerRef,
  currentPageRect,
  currentPageNumber,
  zoom,
}) => {
  const dispatch = useDispatch();
  console.log(
    `>>> MeasurementCanvas PROP CHECK: currentPageNumber = ${currentPageNumber}`
  );
  console.log(
    `>>> MeasurementCanvas: Rendering START. Page: ${currentPageNumber}, Zoom: ${zoom}`
  );
  console.log(
    `>>> MeasurementCanvas: Received Props - currentPageRect:`,
    currentPageRect
  );
  console.log(
    `>>> MeasurementCanvas: Received Props - containerRef.current:`,
    containerRef?.current
  );

  const canvasRef = useRef(null);

  const [canvasStyle, setCanvasStyle] = useState({
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    display: "none",
    pointerEvents: "none",
  });
  console.log(`>>> MeasurementCanvas: Current canvasStyle State:`, canvasStyle);

  const getScreenCoords = useCallback(
    (normalizedPoint) => {
      const widthNum = parseFloat(canvasStyle.width) || 0;
      const heightNum = parseFloat(canvasStyle.height) || 0;

      if (
        !normalizedPoint ||
        typeof normalizedPoint.x !== "number" ||
        typeof normalizedPoint.y !== "number"
      ) {
        console.error(
          "getScreenCoords received invalid normalizedPoint:",
          normalizedPoint
        );
        return { x: 0, y: 0 };
      }

      if (widthNum === 0 || heightNum === 0) {
        console.warn(
          // Reduce noise
          "getScreenCoords called with zero dimensions from state",
          { widthNum, heightNum },
          "for point:",
          normalizedPoint
        );
        return { x: 0, y: 0 };
      }

      const screenX = normalizedPoint.x * widthNum;
      const screenY = normalizedPoint.y * heightNum;
      return { x: screenX, y: screenY };
    },
    [canvasStyle.width, canvasStyle.height]
  ); // Dependency: re-create if dimensions change

  const selectedMeasurementId = useSelector(
    (state) => state.app.selectedMeasurementId
  );
  const activeTool = useSelector((state) => state.app.activeTool);
  const measurements = useSelector((state) => state.app.measurements || []);
  const activeMeasurementId = useSelector(
    (state) => state.app.activeMeasurement
  );
  const isScaleDefined = useSelector((state) => state.app.isScaleDefined);
  const scaleRatio = useSelector((state) => state.app.scaleRatio);

  const activeMeasurement = measurements.find(
    (m) => m.id === activeMeasurementId
  );
  const currentPoints = activeMeasurement ? activeMeasurement.points : [];

  const selectedMeasurement = measurements.find(
    (m) => m.id === selectedMeasurementId
  );

  useEffect(() => {
    if (!selectedMeasurementId || !containerRef.current) return;

    const measurement = measurements.find(
      (m) => m.id === selectedMeasurementId
    );
    if (!measurement || !measurement.points || measurement.points.length === 0)
      return;

    const centerX =
      measurement.points.reduce((sum, p) => sum + p.x, 0) /
      measurement.points.length;
    const centerY =
      measurement.points.reduce((sum, p) => sum + p.y, 0) /
      measurement.points.length;

    containerRef.current.scrollTo({
      left: centerX - containerRef.current.clientWidth / 2,
      top: centerY - containerRef.current.clientHeight / 2,
      behavior: "smooth",
    });
  }, [selectedMeasurementId, measurements, containerRef]);

  useEffect(() => {
    if (currentPageRect && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();

      const newStyle = {
        position: "absolute",
        top: `${
          currentPageRect.top -
          containerRect.top +
          containerRef.current.scrollTop
        }px`,
        left: `${
          currentPageRect.left -
          containerRect.left +
          containerRef.current.scrollLeft
        }px`,
        width: `${currentPageRect.width}px`,
        height: `${currentPageRect.height}px`,
        display: "block",
        pointerEvents: "auto",
        overflow: "visible",
        zIndex: 10,
      };
      console.log("Setting Canvas Style:", newStyle);
      setCanvasStyle(newStyle);

      const handleScroll = () => {
        const updatedContainerRect =
          containerRef.current.getBoundingClientRect();
        setCanvasStyle((prevStyle) => ({
          ...prevStyle,
          top: `${
            currentPageRect.top -
            updatedContainerRect.top +
            containerRef.current.scrollTop
          }px`,
          left: `${
            currentPageRect.left -
            updatedContainerRect.left +
            containerRef.current.scrollLeft
          }px`,
        }));
      };

      containerRef.current.addEventListener("scroll", handleScroll);
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener("scroll", handleScroll);
        }
      };
    } else {
      console.log("Hiding canvas, currentPageRect:", currentPageRect);
      setCanvasStyle({
        position: "absolute",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        display: "none",
        pointerEvents: "none",
      });
    }
  }, [currentPageRect, containerRef]);

  const handleCanvasClick = (e) => {
    console.log("--- handleCanvasClick Fired ---");
    console.log("Active Tool:", activeTool);
    console.log("Canvas Style:", canvasStyle);
    console.log("Target Element:", e.target);
    if (
      !activeTool ||
      ![
        "polyline",
        "polygon",
        "rectangle2Point",
        "rectangle3Point",
        "stickyNote",
        "rule",
      ].includes(activeTool)
    ) {
      return;
    }

    if (activeTool === "rule" && currentPoints.length >= 2) {
      return;
    }

    if (activeTool === "rectangle2Point" && currentPoints.length >= 2) {
      return;
    }

    if (canvasStyle.pointerEvents !== "auto") {
      console.warn(
        "Canvas click ignored: Canvas is not currently interactive."
      );
      return;
    }

    const rect = canvasRef.current.getBoundingClientRect();

    if (!rect) return;

    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;

    const normalizedX = rawX / rect.width;
    const normalizedY = rawY / rect.height;

    console.log("Click coords - Raw:", { x: rawX, y: rawY }, "Normalized:", {
      x: normalizedX,
      y: normalizedY,
    });

    dispatch({
      type: "app/addPoint",
      payload: {
        x: normalizedX,
        y: normalizedY,
        rawX: rawX,
        rawY: rawY,
        pageWidth: rect.width,
        pageHeight: rect.height,
        pageNumber: currentPageNumber,
      },
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // For undo (Ctrl+Z)
      if (e.ctrlKey && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "app/undo" });
        console.log("Undo triggered via keyboard");
      }

      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: "app/redo" });
        console.log("Redo triggered via Ctrl+Shift+Z");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Clean up
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!selectedMeasurementId || !containerRef.current) return;

    const measurement = measurements.find(
      (m) => m.id === selectedMeasurementId
    );
    if (!measurement || !measurement.points || measurement.points.length === 0)
      return;

    const centerX =
      measurement.points.reduce((sum, p) => sum + p.x, 0) /
      measurement.points.length;
    const centerY =
      measurement.points.reduce((sum, p) => sum + p.y, 0) /
      measurement.points.length;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    const scrollX = centerX - containerWidth / 2;
    const scrollY = centerY - containerHeight / 2;

    containerRef.current.scrollTo({
      left: scrollX > 0 ? scrollX : 0,
      top: scrollY > 0 ? scrollY : 0,
      behavior: "smooth",
    });
  }, [selectedMeasurementId, measurements, containerRef]);

  useEffect(() => {
    if (currentPageRect?.element && containerRef.current) {
      const updatedPageRect = currentPageRect.element.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      setCanvasStyle((prevStyle) => ({
        ...prevStyle,
        top: `${
          updatedPageRect.top -
          containerRect.top +
          containerRef.current.scrollTop
        }px`,
        left: `${
          updatedPageRect.left -
          containerRect.left +
          containerRef.current.scrollLeft
        }px`,
        width: `${updatedPageRect.width}px`,
        height: `${updatedPageRect.height}px`,
      }));
    }
  }, [zoom, currentPageRect, containerRef]);

  const renderPolygons = () => {
    if (
      !activeMeasurement ||
      activeMeasurement.type !== "polygon" ||
      currentPoints.length < 3
    )
      return null;

    const pointsString = currentPoints
      .map((p) => {
        const screenPoint = getScreenCoords(p);
        return `${screenPoint.x},${screenPoint.y}`;
      })
      .join(" ");

    return (
      <polygon
        points={pointsString}
        fill="#634CF240"
        stroke="#634CF2"
        strokeWidth="2"
      />
    );
  };

  const renderRectangle2Point = () => {
    if (
      !activeMeasurement ||
      activeMeasurement.type !== "rectangle2Point" ||
      currentPoints.length < 2
    )
      return null;

    const [p1, p2] = currentPoints;
    const p1Screen = getScreenCoords(p1);
    const p2Screen = getScreenCoords(p2);
    return (
      <rect
        x={Math.min(p1Screen.x, p2Screen.x)}
        y={Math.min(p1Screen.y, p2Screen.y)}
        width={Math.abs(p2Screen.x - p1Screen.x)}
        height={Math.abs(p2Screen.y - p1Screen.y)}
        fill="#634CF240"
        stroke="#634CF2"
        strokeWidth="2"
      />
    );
  };

  // Rectangle 3-point rendering
  const renderRectangle3Point = () => {
    if (
      !activeMeasurement ||
      activeMeasurement.type !== "rectangle3Point" ||
      currentPoints.length < 3
    )
      return null;

    const [p1, p2, p3] = currentPoints;

    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const p4 = {
      x: p3.x + (p1.x - p2.x),
      y: p3.y + (p1.y - p2.y),
    };

    const p1Screen = getScreenCoords(p1);
    const p2Screen = getScreenCoords(p2);
    const p3Screen = getScreenCoords(p3);
    const p4Screen = getScreenCoords(p4);
    const pointsString = `${p1Screen.x},${p1Screen.y} ${p2Screen.x},${p2Screen.y} ${p3Screen.x},${p3Screen.y} ${p4Screen.x},${p4Screen.y}`;

    return (
      <polygon
        points={pointsString}
        fill="#634CF240"
        stroke="#634CF2"
        strokeWidth="2"
      />
    );
  };

  const renderRuleTool = () => {
    if (
      !activeMeasurement ||
      activeMeasurement.type !== "rule" ||
      currentPoints.length < 2
    )
      return null;

    const [start, end] = currentPoints;
    const startScreen = getScreenCoords(start);
    const endScreen = getScreenCoords(end);

    // --- Style Definitions ---
    const ruleColor = "#FF0000"; // Red color from design
    const ruleStrokeWidth = "3";
    const capHeight = 10; // Total height of the vertical end cap
    const arrowLength = 8; // Length of the arrow part
    const arrowWidth = 6; // Width of the arrow base

    // --- Calculations ---
    const dx = endScreen.x - startScreen.x;
    const dy = endScreen.y - startScreen.y;
    const lineAngleRad = Math.atan2(dy, dx); // Angle in radians
    const perpAngleRad = lineAngleRad + Math.PI / 2; // Perpendicular angle

    // Calculate offsets for vertical caps
    const capDx = (capHeight / 2) * Math.cos(perpAngleRad);
    const capDy = (capHeight / 2) * Math.sin(perpAngleRad);

    // Calculate arrow points relative to the cap ends
    // Vector along the line direction
    const lineVecX = Math.cos(lineAngleRad);
    const lineVecY = Math.sin(lineAngleRad);
    // Vector perpendicular to the line
    const perpVecX = Math.cos(perpAngleRad);
    const perpVecY = Math.sin(perpAngleRad);

    return (
      // Use a group for the entire ruler style
      <g className="active-ruler">
        {/* Main Ruler Line (Solid Red) */}
        <line
          x1={startScreen.x}
          y1={startScreen.y}
          x2={endScreen.x}
          y2={endScreen.y}
          stroke={ruleColor}
          strokeWidth={ruleStrokeWidth}
          // strokeDasharray="5,5" // Removed dashed style
        />

        {/* Start Cap (Vertical Line) */}
        <line
          x1={startScreen.x - capDx}
          y1={startScreen.y - capDy}
          x2={startScreen.x + capDx}
          y2={startScreen.y + capDy}
          stroke={ruleColor}
          strokeWidth={ruleStrokeWidth}
        />

        {/* End Cap (Vertical Line) */}
        <line
          x1={endScreen.x - capDx}
          y1={endScreen.y - capDy}
          x2={endScreen.x + capDx}
          y2={endScreen.y + capDy}
          stroke={ruleColor}
          strokeWidth={ruleStrokeWidth}
        />

        {/* Start Arrow */}
               {/* Start Arrow (Points: Top of cap, Bottom of cap, Tip pointing out) */}
               <polygon
          points={`
            ${startScreen.x - capDx}, ${startScreen.y - capDy}
            ${startScreen.x + capDx}, ${startScreen.y + capDy}
            ${startScreen.x - lineVecX * arrowLength}, ${startScreen.y - lineVecY * arrowLength}
          `}
          fill={ruleColor}
        />

        {/* End Arrow (Points: Top of cap, Bottom of cap, Tip pointing out) */}
        <polygon
          points={`
            ${endScreen.x - capDx}, ${endScreen.y - capDy}
            ${endScreen.x + capDx}, ${endScreen.y + capDy}
            ${endScreen.x + lineVecX * arrowLength}, ${endScreen.y + lineVecY * arrowLength}
          `}
          fill={ruleColor}
        />
        {/* REMOVE any duplicate/extra polygon elements from the previous attempt */}
      </g>
    );
  };
  const renderStickyNotes = () => {
    if (
      !activeMeasurement ||
      activeMeasurement.type !== "stickyNote" ||
      !currentPoints.length
    ) {
      return null;
    }

    const point = currentPoints[0];
    const screenPoint = getScreenCoords(point);

    if (
      screenPoint.x === 0 &&
      screenPoint.y === 0 &&
      (point.x !== 0 || point.y !== 0)
    ) {
      console.warn(
        `StickyNote (Active) ${activeMeasurement.id}: Calculated screen coords are (0,0).`
      );
    }

    return (
      <StickyNote
        key={`note-${activeMeasurement.id}`}
        screenPoint={screenPoint}
        measurementId={activeMeasurement.id}
        initialText={activeMeasurement.noteText || ""}
        onTextChange={(text) => {
          dispatch({
            type: "app/updateMeasurement",
            payload: {
              id: activeMeasurement.id,
              noteText: text,
            },
          });
        }}
      />
    );
  };
  const renderMeasurement = (measurement, isSelected) => {
    const canvasWidthNum = parseFloat(canvasStyle.width) || 0;
    const canvasHeightNum = parseFloat(canvasStyle.height) || 0;
    if (isSelected) {
      console.log(
        `>>> renderMeasurement CALLED for SELECTED: ID=${measurement.id}`,
        measurement
      );
    }

    if (canvasWidthNum === 0 || canvasHeightNum === 0) {
      console.warn(
        `renderMeasurement: Canvas dimensions are zero for ${measurement.id}. Skipping shape/line render.`
      );

      return isSelected ? (
        <Points
          key={`sel-pts-${measurement.id}-zerodim`}
          points={measurement.points}
          canvasWidth={canvasWidthNum}
          canvasHeight={canvasHeightNum}
          color={isSelected ? "#634CF2" : "#634CF2"}
        />
      ) : null;
    }

    const shapeStrokeColor = "#634CF2";
    const pointColor = "#634CF2";
    const strokeWidth = isSelected ? "5" : "4";
    const fillColor = isSelected
      ? `${shapeStrokeColor}60`
      : `${shapeStrokeColor}40`;

    const screenPoints = measurement.points.map(getScreenCoords);

    const allScreenPointsAtOrigin = screenPoints.every(
      (p) => p.x === 0 && p.y === 0
    );
    const originalPointsNotAllOrigin = measurement.points.some(
      (p) => p.x !== 0 || p.y !== 0
    );

    if (allScreenPointsAtOrigin && originalPointsNotAllOrigin) {
      console.warn(
        `renderMeasurement: All screen points are (0,0) for ${measurement.id} despite non-origin normalized points. Skipping shape render.`
      );
      return isSelected ? (
        <Points
          key={`sel-pts-${measurement.id}-origin`}
          points={measurement.points}
          canvasWidth={canvasWidthNum}
          canvasHeight={canvasHeightNum}
          color={pointColor}
        />
      ) : null;
    }

    switch (measurement.type) {
      case "polyline": {
        if (screenPoints.length < 2) return null;
        const pointsString = screenPoints
          .map((sp) => `${sp.x},${sp.y}`)
          .join(" ");
        if (isSelected) {
          console.log(
            `>>> renderMeasurement rendering SELECTED polyline: ${measurement.id}`,
            { pointsString, shapeStrokeColor, strokeWidth }
          );
        }
        return (
          <g key={`measurement-${measurement.id}`}>
            <polyline
              points={pointsString}
              fill="none"
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      case "polygon":
      case "area": {
        if (screenPoints.length < 3) return null;
        const pointsString = screenPoints
          .map((sp) => `${sp.x},${sp.y}`)
          .join(" ");
        return (
          <g key={`measurement-${measurement.id}`}>
            <polygon
              points={pointsString}
              fill={fillColor}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      case "rectangle2Point": {
        if (screenPoints.length < 2) return null;
        const [p1Screen, p2Screen] = screenPoints;
        return (
          <g key={`measurement-${measurement.id}`}>
            <rect
              x={Math.min(p1Screen.x, p2Screen.x)}
              y={Math.min(p1Screen.y, p2Screen.y)}
              width={Math.abs(p2Screen.x - p1Screen.x)}
              height={Math.abs(p2Screen.y - p1Screen.y)}
              fill={fillColor}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }

      case "rule":
      case "distance": {
        if (screenPoints.length < 2) return null;
        const [startScreen, endScreen] = screenPoints;
        return (
          <g key={`measurement-${measurement.id}`}>
            <line
              x1={startScreen.x}
              y1={startScreen.y}
              x2={endScreen.x}
              y2={endScreen.y}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          </g>
        );
      }
      case "angle": {
        if (screenPoints.length < 3) return null;
        const [p1Screen, p2Screen, p3Screen] = screenPoints;
        return (
          <g key={`measurement-${measurement.id}`}>
            <line
              x1={p1Screen.x}
              y1={p1Screen.y}
              x2={p2Screen.x}
              y2={p2Screen.y}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
            <line
              x1={p2Screen.x}
              y1={p2Screen.y}
              x2={p3Screen.x}
              y2={p3Screen.y}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }
      case "circle": {
        if (screenPoints.length < 2) return null;
        const [centerScreen, radiusPointScreen] = screenPoints;
        const radius = Math.sqrt(
          Math.pow(radiusPointScreen.x - centerScreen.x, 2) +
            Math.pow(radiusPointScreen.y - centerScreen.y, 2)
        );
        if (isNaN(radius) || radius <= 0) {
          console.warn(
            `renderMeasurement (circle): Invalid radius ${radius} for ${measurement.id}. Skipping render.`
          );

          return isSelected ? (
            <Points
              key={`sel-pts-${measurement.id}-radius`}
              points={measurement.points}
              canvasWidth={canvasWidthNum}
              canvasHeight={canvasHeightNum}
              color={pointColor}
            />
          ) : null;
        }
        return (
          <g key={`measurement-${measurement.id}`}>
            <circle
              cx={centerScreen.x}
              cy={centerScreen.y}
              r={radius}
              fill={fillColor}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }
      case "rectangle3Point": {
        if (measurement.points.length < 3) return null;
        const [p1, p2, p3] = measurement.points;
        const p4Norm = { x: p3.x + (p1.x - p2.x), y: p3.y + (p1.y - p2.y) };
        const allScreenPoints = [p1, p2, p3, p4Norm].map(getScreenCoords);

        if (allScreenPoints.some((p) => isNaN(p.x) || isNaN(p.y))) {
          console.error(
            `NaN detected in screen points for rect3p ${measurement.id}`
          );
          return null;
        }
        const allRect3PointsAtOrigin = allScreenPoints.every(
          (p) => p.x === 0 && p.y === 0
        );
        if (allRect3PointsAtOrigin && originalPointsNotAllOrigin) {
          console.warn(
            `renderMeasurement (rect3p): All screen points are zero for ${measurement.id}. Skipping shape render.`
          );
          return isSelected ? (
            <Points
              key={`sel-pts-${measurement.id}-origin`}
              points={measurement.points}
              canvasWidth={canvasWidthNum}
              canvasHeight={canvasHeightNum}
              color={pointColor}
            />
          ) : null;
        }

        const pointsString = allScreenPoints
          .map((sp) => `${sp.x},${sp.y}`)
          .join(" ");
        return (
          <g key={`measurement-${measurement.id}`}>
            <polygon
              points={pointsString}
              fill={fillColor}
              stroke={shapeStrokeColor}
              strokeWidth={strokeWidth}
            />
          </g>
        );
      }
      case "stickyNote": {
        if (!measurement.points || measurement.points.length === 0) return null;

        const point = measurement.points[0];
        const screenPoint = getScreenCoords(point);

        if (
          screenPoint.x === 0 &&
          screenPoint.y === 0 &&
          (point.x !== 0 || point.y !== 0)
        ) {
          console.warn(
            `StickyNote (Completed) ${measurement.id}: Screen coords are (0,0).`
          );
        }

        return (
          <StickyNote
            key={`note-${measurement.id}`}
            screenPoint={screenPoint}
            measurementId={measurement.id}
            initialText={measurement.noteText || ""}
            onTextChange={(text) => {
              dispatch({
                type: "app/updateMeasurement",
                payload: { id: measurement.id, noteText: text },
              });
            }}
            isSelected={isSelected}
            isReadOnly={!isSelected}
          />
        );
      }

      default:
        console.log("Unknown measurement type:", measurement.type);
        return null;
    }
  };
  const renderCompletedMeasurements = () => {
    const pageToRender = currentPageNumber;

    if (!selectedMeasurementId) {
      return null;
    }

    const measurementToRender = measurements.find(
      (m) => m.id === selectedMeasurementId
    );

    if (
      !measurementToRender ||
      measurementToRender.id === activeMeasurementId ||
      measurementToRender.pageNumber !== pageToRender
    ) {
      console.log(
        `>>> renderCompletedMeasurements: Selected item ${selectedMeasurementId} is not valid for rendering on page ${pageToRender} (Active: ${
          measurementToRender?.id === activeMeasurementId
        }, Page Match: ${measurementToRender?.pageNumber === pageToRender})`
      );
      return null;
    }

    console.log(
      `>>> renderCompletedMeasurements: Rendering selected measurement ${measurementToRender.id} on page ${pageToRender}`
    );

    return renderMeasurement(measurementToRender, true);
  };
  const canvasWidthNum = parseFloat(canvasStyle.width) || 0;
  const canvasHeightNum = parseFloat(canvasStyle.height) || 0;

  const activeScreenPoints = currentPoints.map(getScreenCoords);

  const selectedScreenPoints =
    selectedMeasurement && selectedMeasurement.id !== activeMeasurementId
      ? selectedMeasurement.points.map(getScreenCoords)
      : [];

  return (
    <div className="measurement-canvas-container">
      <svg
        ref={canvasRef}
        className="measurement-canvas"
        onClick={handleCanvasClick}
        style={{ ...canvasStyle, cursor: activeTool ? "crosshair" : "default" }}
        viewBox={`0 0 ${canvasWidthNum} ${canvasHeightNum}`}
      >
        {canvasStyle.display === "block" &&
          canvasWidthNum > 0 &&
          canvasHeightNum > 0 && (
            <>
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="6"
                  markerHeight="4"
                  refX="5.5"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#634CF2" />
                </marker>
              </defs>

              {renderCompletedMeasurements()}

              {activeMeasurement &&
                activeMeasurement.type === "polygon" &&
                renderPolygons()}
              {activeMeasurement &&
                activeMeasurement.type === "rectangle2Point" &&
                renderRectangle2Point()}
              {activeMeasurement &&
                activeMeasurement.type === "rectangle3Point" &&
                renderRectangle3Point()}
              {activeMeasurement &&
                activeMeasurement.type === "rule" &&
                renderRuleTool()}

              {activeMeasurement &&
                activeMeasurement.type === "stickyNote" &&
                renderStickyNotes()}

              {activeMeasurementId &&
                currentPoints.length > 0 &&
                activeMeasurement?.type !== "rule" && (
                  <Points
                    key={`active-pts-${activeMeasurementId}`}
                    points={
                      activeMeasurement?.type === "polyline" &&
                      currentPoints.length > 1
                        ? currentPoints.slice(0, -1)
                        : currentPoints
                    }
                    canvasWidth={canvasWidthNum}
                    canvasHeight={canvasHeightNum}
                    color="#634CF2"
                  />
                )}

              {selectedMeasurement &&
                selectedMeasurement.id !== activeMeasurementId &&
                selectedMeasurement.points.length > 0 && (
                  <Points
                    key={`selected-pts-${selectedMeasurement.id}`}
                    points={selectedMeasurement.points}
                    canvasWidth={canvasWidthNum}
                    canvasHeight={canvasHeightNum}
                    color="#634CF2"
                  />
                )}
              {activeMeasurement &&
                activeMeasurement.type === "polyline" &&
                activeScreenPoints.length > 1 && (
                  <polyline
                    key={`active-polyline-${activeMeasurement.id}`}
                    points={activeScreenPoints
                      .map((sp) => `${sp.x},${sp.y}`)
                      .join(" ")}
                    fill="none"
                    stroke="#634CF2"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd="url(#arrowhead)"
                  />
                )}

              {activeMeasurementId && activeScreenPoints.length > 1 && (
                <DistanceLabels
                  key={`dist-active-${activeMeasurementId}`}
                  screenPoints={activeScreenPoints}
                  originalPoints={currentPoints}
                  isScaleDefined={isScaleDefined}
                  scaleRatio={scaleRatio}
                  isActive={true}
                  toolType={activeMeasurement?.type}
                />
              )}

              {selectedMeasurement &&
                selectedMeasurement.id !== activeMeasurementId &&
                selectedScreenPoints.length > 1 && (
                  <DistanceLabels
                    key={`dist-selected-${selectedMeasurement.id}`}
                    screenPoints={selectedScreenPoints}
                    originalPoints={selectedMeasurement.points}
                    isScaleDefined={isScaleDefined}
                    scaleRatio={scaleRatio}
                    isActive={false}
                  />
                )}

              {activeMeasurementId && activeScreenPoints.length > 2 && (
                <AngleIndicators
                  key={`angle-active-${activeMeasurementId}`}
                  screenPoints={activeScreenPoints}
                />
              )}

              {selectedMeasurement &&
                selectedMeasurement.id !== activeMeasurementId &&
                selectedScreenPoints.length > 2 && (
                  <AngleIndicators
                    key={`angle-selected-${selectedMeasurement.id}`}
                    screenPoints={selectedScreenPoints}
                  />
                )}
            </>
          )}
      </svg>
      <DebugOverlay />
    </div>
  );
};

export default MeasurementCanvas;
