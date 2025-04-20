




import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const useFileManagement = (setPdfRendered) => {




    const [files, setFiles] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openedFile, setOpenedFile] = useState(null);
    const [openedFileType, setOpenedFileType] = useState(null);


    const getFileType = (filename) => {
        if (!filename) return 'unknown';
        const extension = filename.split('.').pop().toLowerCase();
        if (extension === 'pdf') return 'pdf';
        if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
        return 'unknown';
    };


    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await axios.get(`${API_BASE_URL}/files`);
            const filesData = (response?.data?.files && Array.isArray(response.data.files))
                ? response.data.files
                : [];

            if (filesData.length === 0) {
                console.error("Invalid response format or empty files array:", response.data);
                setError("Invalid response format");
            }

            setFiles(filesData);
        } catch (error) {
            console.error("Error fetching files:", error);
            setFiles([]);
            setError("Failed to load files");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);


    // Handle file deletion
    const handleDelete = async (file) => {
        try {
            await axios.delete(`${API_BASE_URL}/files/${file.filename}`);
            setFiles(files.filter((f) => f.filename !== file.filename));
            if (openedFile && openedFile === file.url) {
                setOpenedFile(null);
                setPdfRendered(false);
            }
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };


    const handleOpen = (file) => {
        setPdfRendered(false);
        setIsLoading(true);

        let fileUrl;
        let fileType;

        if (typeof file === 'object' && file.url) {
            fileUrl = `${API_BASE_URL}/proxy-pdf?url=${encodeURIComponent(file.url)}`;
            fileType = getFileType(file.filename || file.originalname || file.url);
        } else if (typeof file === 'string') {
            fileUrl = file;
            fileType = getFileType(file);
        } else {
            console.error('Invalid file format:', file);
            setIsLoading(false);
            return;
        }

        setOpenedFile(fileUrl);
        setOpenedFileType(fileType);
        console.log("Opened File URL:", fileUrl, "Type:", fileType);
    };



    const handleUpdateTitle = (file, newTitle) => {
        // Update the file title in your state or make an API call
        // For example:
        setFiles(prevFiles => prevFiles.map(f =>
            f.id === file.id ? { ...f, originalname: newTitle } : f
        ));
    };



    return {
        files,
        setFiles,
        isLoading,
        setIsLoading,
        error,
        setError,
        openedFile,
        setOpenedFile,
        openedFileType,
        setOpenedFileType,
        getFileType,
        fetchFiles,
        handleDelete,
        handleOpen,
        handleUpdateTitle
    };
};

