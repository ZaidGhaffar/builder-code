// src/components/FloatingToolbar.js
import React, { useEffect, useRef, useState } from 'react';

import { useDispatch, useSelector } from "react-redux";
import {
  setDistance,
  setScaleRatio,
  setReferenceLinePoints,
  setScaleDefined,
  setActiveMeasurement,
  setScaleWorkflowStep,
  setActiveTool,
  setScaleSettingMode,
  updateMeasurementsWithScale,
  clearPoints, completeMeasurement
} from "../redux/appSlice";


import { ReactComponent as PolylineIcon } from '../assets/Polyline.svg';
import { ReactComponent as PolygonIcon } from '../assets/Polygon.svg';
import { ReactComponent as Rectangle2PointIcon } from '../assets/Rectangle2Point.svg';
import { ReactComponent as Rectangle3PointIcon } from '../assets/Rectangle3Point.svg';
import { ReactComponent as StickyNoteIcon } from '../assets/StickyNote.svg';
import { ReactComponent as RuleIcon } from '../assets/Rule.svg';
import { ReactComponent as ScaleIcon } from '../assets/Scale.svg';
import { ReactComponent as M } from '../assets/M.svg';
import './FloatingToolbar.css';




const toolInfoMap = {
  polyline: {
    name: 'Polyline',
    description: 'Click points sequentially. Double-click or press Enter to finish.'
  },
  polygon: {
    name: 'Polygon',
    description: 'Click points. Click the first point again or press Enter to finish.'
  },
  rectangle2Point: {
    name: 'Rectangle two point',
    description: 'Click the starting corner, then click the opposite corner.'
  },
  rectangle3Point: {
    name: 'Rectangle three point',
    description: 'Click start corner, click adjacent corner, click third point for width.'
  },
  stickyNote: {
    name: 'Sticky Note',
    description: 'Click to place a note.'
  },
  rule: {
    name: 'Ruler',
    description: 'Click the starting point, then click the end point.'
  },

};




const FloatingToolbar = ({ toggleActionBar }) => {



  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [distanceInput, setDistanceInput] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);
  
  
  const [showWarning, setShowWarning] = useState(false);
  
  const scaleSettingMode = useSelector((state) => state.app.scaleSettingMode);
  const activeMeasurementStore = useSelector(state => state.app.activeMeasurement);
  const activeTool = useSelector(state => state.app.activeTool);
  const currentDistance = useSelector((state) => state.app.distance);
  const scaleWorkflowStep = useSelector((state) => state.app.scaleWorkflowStep);
  const isScaleDefined = useSelector((state) => state.app.isScaleDefined);
  const measurements = useSelector(state => state.app.measurements || []); 

  const referenceLinePoints = useSelector((state) => state.app.referenceLinePoints);
  const [previousTool, setPreviousTool] = useState(null);

  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const [visibleInfoTool, setVisibleInfoTool] = useState(null); // Tracks which tool's info is showing

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  // Function to toggle more menu
  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.more-menu-button') && !event.target.closest('.more-menu-dropdown')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Find the actual active measurement object
    const currentActiveMeasurement = measurements.find(m => m.id === activeMeasurementStore);
  
    // Determine if the active measurement exists and has NO points
    const isActiveMeasurementEmpty = !currentActiveMeasurement || !currentActiveMeasurement.points || currentActiveMeasurement.points.length === 0;
  
    // Conditions to show the popup for the *active* tool:
    // 1. Scale must be defined
    // 2. A tool must be active AND have info defined
    // 3. The corresponding active measurement must be empty (no points added yet)
    if (isScaleDefined && activeTool && toolInfoMap[activeTool] && isActiveMeasurementEmpty) {
      setVisibleInfoTool(activeTool); // Show info for the current tool
      console.log(`Showing info popup for NEW empty measurement with tool: ${activeTool}`);
    } else {
      // Otherwise (no active tool, or points already added, or scale not defined)
      // Hide the popup
      if (visibleInfoTool) { // Only log if it was previously visible
          console.log(`Hiding info popup. Reason: activeTool=${activeTool}, isScaleDefined=${isScaleDefined}, isActiveMeasurementEmpty=${isActiveMeasurementEmpty}`);
      }
      setVisibleInfoTool(null);
    }
  
  // Dependencies: Re-run when the active tool, scale definition, or the list/content of measurements changes.
  // Including 'measurements' is important here to detect when points are added.
  }, [activeTool, isScaleDefined, measurements, activeMeasurementStore, visibleInfoTool]);
  const calculatePixelDistance = (point1, point2) => {
    // Simple Euclidean distance calculation
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2)
    );
  };

  const handleToolClick = (tool) => {
    // Prevent tool selection during scale setting
    if (scaleSettingMode) {
      console.log("Cannot select tool while setting scale");
      return;
    }

    // Check if we're changing tools (using Redux activeTool)
    if (activeTool !== tool) { // <<< CHANGED: Compare with Redux activeTool
      // First complete any active measurement
      if (activeMeasurementStore) {
        dispatch(completeMeasurement());
      }
      // Then clear points to start fresh with new tool
      dispatch(clearPoints());
      console.log('Tool switching to:', tool);
    }

    // Update local UI state (REMOVED setSelectedTool call)
    // setSelectedTool(tool); // <<< REMOVED

    // Update Redux state (This IS the primary state now)
    console.log("Setting active tool to:", tool);
    dispatch(setActiveTool(tool)); // Dispatch the action to update Redux
  };


  const startScaleSetting = () => {
    dispatch(setScaleSettingMode(true));
    dispatch(setScaleWorkflowStep(1));
    dispatch(setReferenceLinePoints([]));
    dispatch(setActiveTool('scaleReference'));

    // Only use local state for UI highlighting
    setSelectedTool('scaleReference');
    setIsDropdownOpen(false);
    console.log('[FloatingToolbar] Scale setting initialized', {
      scaleWorkflowStep: 1,
      tool: 'scaleReference'
    });
  };
  // Add this state to store the previously selected tool
  

  // Update this function to save the current tool before opening scale dialog
  const handleScaleButtonClick = () => {
    // Store current tool before entering scale mode
    console.log("Saving current tool before scale mode:", selectedTool);
    setPreviousTool(selectedTool);

    // Clear active tool during scale setting
    dispatch(setActiveTool(null));

    // Enable scale setting mode
    dispatch(setScaleSettingMode(true));
    setIsDropdownOpen(true);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    console.log('[FloatingToolbar] Toggle dropdown requested', {
      currentlyOpen: isDropdownOpen,
      scaleSettingMode,
      step: scaleWorkflowStep
    });
    if (scaleSettingMode) {
      if (scaleWorkflowStep === 1) {

        dispatch(setScaleWorkflowStep(2)); // Add this line

        console.log('[FloatingToolbar] Advancing scale workflow to step 2');

        setIsDropdownOpen(true);
      } else {
        dispatch(setScaleWorkflowStep(0));
        console.log('[FloatingToolbar] Exiting scale workflow');

        dispatch(setScaleSettingMode(false));
      }
    } else {
      // Regular toggle behavior
      setIsDropdownOpen(!isDropdownOpen);
      console.log('[FloatingToolbar] Dropdown toggled', { nowOpen: !isDropdownOpen });

    }
  };

  const handleSave = () => {
    console.log("[FloatingToolbar] Scale save attempted", {
      inputValue: distanceInput,
      referencePointsCount: referenceLinePoints?.length || 0
    });

    if (distanceInput.trim() !== "") {
      const scaleValue = parseFloat(distanceInput);

      if (isNaN(scaleValue) || scaleValue <= 0) {
        alert("Please enter a valid positive number");
        return;
      }
      console.log("[FloatingToolbar] Valid scale value", { scaleValue });

      // Save scale values to Redux
      dispatch(setDistance(scaleValue));

      if (referenceLinePoints && referenceLinePoints.length === 2) {
        const pixelDistance = calculatePixelDistance(
          referenceLinePoints[0],
          referenceLinePoints[1]
        );
        const ratio = scaleValue / pixelDistance;
        console.log("[FloatingToolbar] Scale ratio calculated", {
          pixelDistance,
          scaleValue,
          ratio
        });

        dispatch(setScaleRatio(ratio));
      } else {
        console.log("[FloatingToolbar] Using direct scale value", { scaleValue });

        dispatch(setScaleRatio(scaleValue));
      }
      console.log("[FloatingToolbar] Scale successfully defined");

      dispatch(setScaleDefined(true));

      // Reset scale workflow
      setIsDropdownOpen(false);
      dispatch(setScaleSettingMode(false));

      console.log("[FloatingToolbar] Scale workflow reset");

      // Show notification (non-blocking)
      const notification = document.createElement("div");
      notification.className = "scale-notification";
      notification.textContent = `Scale successfully set to ${scaleValue} meters`;
      document.body.appendChild(notification);

      setTimeout(() => {
        document.body.removeChild(notification);
      }, 3000);

      // IMPORTANT: Restore previous tool with a delay
      // IMPORTANT: Restore previous tool with a delay
      setTimeout(() => {
        if (previousTool) {
          console.log("Restoring previous tool:", previousTool);
          dispatch(setActiveTool(previousTool));
          setSelectedTool(previousTool); // Need to update local state too
          setPreviousTool(null);
        }
      }, 100);
    } else {
      alert("Please enter a distance value");
    }
  };


  return (
    <div className='main-div'>
      <div className="floating-toolbar">
        <button
          onClick={() => handleToolClick('polyline')}
           className={`PolylineIcon ${activeTool === 'polyline' ? 'active-tool' : ''}`} 
          disabled={!isScaleDefined}
          title="Draw a polyline"
        >
          <PolylineIcon />
        </button>
        <button
          onClick={() => handleToolClick('polygon')}
          className={`polygon ${activeTool === 'polygon' ? 'active-tool' : ''}`}
          disabled={!isScaleDefined}
          title="Draw a polygon"
        >
          <PolygonIcon />
        </button>
        <button
          onClick={() => handleToolClick('rectangle2Point')}
          className={`rectangle2Point ${activeTool === 'rectangle2Point' ? 'active-tool' : ''}`}
          disabled={!isScaleDefined}
          title="Draw a 2-point rectangle"
        >
          <Rectangle2PointIcon />
        </button>
        <button
          onClick={() => handleToolClick('rectangle3Point')}
          className={`rectangle3Point hidden-on-tablet ${activeTool === 'rectangle3Point' ? 'active-tool' : ''}`}
          disabled={!isScaleDefined}
          title="Draw a 3-point rectangle"
        >
          <Rectangle3PointIcon />
        </button>
        <button
          onClick={() => handleToolClick('stickyNote')}
          className={`stickyNote hidden-on-tablet ${activeTool === 'stickyNote' ? 'active-tool' : ''}`}
          disabled={!isScaleDefined}
          title="Add a sticky note"
        >
          <StickyNoteIcon />
        </button>
        <button
          onClick={() => handleToolClick('rule')}
          className={`rule hidden-on-tablet ${activeTool === 'rule' ? 'active-tool' : ''}`}
          title="Measure with ruler"
        >
          <RuleIcon />
        </button>
        <button
          onClick={toggleMoreMenu}
          className="more-menu-button"
          title="More tools"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" />
            <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" />
            <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" />
          </svg>
        </button>
        <div className={`more-menu-dropdown ${showMoreMenu ? 'visible' : ''}`}>
          <div 
            className="more-menu-item"
            onClick={() => {
              handleToolClick('rectangle3Point');
              setShowMoreMenu(false);
            }}
          >
            <Rectangle3PointIcon />
            <span>3-Point Rectangle</span>
          </div>
          <div 
            className="more-menu-item"
            onClick={() => {
              handleToolClick('stickyNote');
              setShowMoreMenu(false);
            }}
          >
            <StickyNoteIcon />
            <span>Sticky Note</span>
          </div>
          <div 
            className="more-menu-item"
            onClick={() => {
              handleToolClick('rule');
              setShowMoreMenu(false);
            }}
          >
            <RuleIcon />
            <span>Ruler</span>
          </div>
        </div>
        <button
          onClick={toggleActionBar}
          className='ScaleIcon'
          title="Toggle action bar"
        >
          <ScaleIcon />
        </button>
      </div>
      
      {visibleInfoTool && toolInfoMap[visibleInfoTool] && (
       <div className="tool-info-popup"> {/* Use specific class */}
          {/* Use visibleInfoTool to get the correct info */}
          <div className="tool-info-name">{toolInfoMap[visibleInfoTool].name}</div>
          <div className="tool-info-description">{toolInfoMap[visibleInfoTool].description}</div>
       </div>
    )}


      <div className="dropdown-container" ref={dropdownRef}>

        <button
          className="action-button"
          onClick={toggleDropdown}
          title="Set scale"
        >
          <M />
        </button>
        {isDropdownOpen && (
          <div className="dropdown-menu1">
            <div className="dropdown-item1">
              Scale
            </div>
            < input
              type="text"
              className="dropdown-item2"
              placeholder={scaleSettingMode ? "Distance in meters" : "Scale (meters/pixel)"}
              value={distanceInput}
              onChange={(e) => {
                // Only allow numbers and decimal point
                const value = e.target.value;
                if (value === "" || /^\d*\.?\d*$/.test(value)) {
                  setDistanceInput(value);
                }
              }}
            />


            <div className='buttons-distance'>

              <button className="dropdown-item3" onClick={() => {
                setIsDropdownOpen(false);
                setDistanceInput("");
                if (scaleSettingMode) {
                  dispatch(setScaleSettingMode(false));
                  dispatch(setScaleWorkflowStep(0));
                }
              }}>
                Cancel
              </button>
              {!scaleSettingMode || scaleWorkflowStep === 2 ? (
                <button className="dropdown-item4" onClick={handleSave}>
                  Save
                </button>
              ) : (
                <button className="dropdown-item4" onClick={startScaleSetting}>
                  Set Reference
                </button>
              )}

            </div>

          </div>
        )}
      </div>
      {showWarning && (
        <div className="scale-warning">
          Please define the scale first using the M button
        </div>
      )}
    </div>
  );
};

export default FloatingToolbar;
