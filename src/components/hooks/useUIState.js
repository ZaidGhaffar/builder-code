

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTool as setReduxActiveTool } from '../../redux/appSlice';
export const useUIState = () => {
    const dispatch = useDispatch();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showActionBar, setShowActionBar] = useState(false);
    const activeTool = useSelector(state => state.app.activeTool);
    const isScaleDefined = useSelector(state => state.app.isScaleDefined);



    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);



    // Toggle the action bar
    const toggleActionBar = () => {
        setShowActionBar(!showActionBar);
    };


    const handleCreateProject = () => {
        console.log("Create project button clicked");
        setShowUploadModal(true);
    };


    const setActiveTool = (tool) => {
        console.log('Setting active tool in Redux:', tool);
        dispatch(setReduxActiveTool(tool));
    };


    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return {
        showUploadModal,
        setShowUploadModal,
        showActionBar,
        activeTool,

        setActiveTool,
        isScaleDefined,

        isMobile,
        toggleActionBar,
        handleCreateProject
    };
}