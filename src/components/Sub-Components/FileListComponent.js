


import React from "react";
import FileCard from "../FileCard"; // Adjust path as needed

const FileListComponent = ({
    files,
    isLoading,
    handleDelete,
    handleOpen,
    handleUpdateTitle,
    handleCreateProject
}) => {
    return (

        <div className="files-view">

            {isLoading ? (
                <div className="loading-spinner">Loading files...</div>
            ) : (
                <div className="file-cards-container">
                    {files && files.length > 0 ? (

                        files.map((file, index) => (
                            <FileCard
                                key={file.id || file.filename}
                                file={file}
                                onDelete={handleDelete}
                                onOpen={handleOpen}
                                onUpdateTitle={handleUpdateTitle}

                            />
                        ))
                    ) : (
                        <div className="empty-state-container">

                            <button className="create-project-button" onClick={handleCreateProject}>
                                Create Project
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

    );
};
export default FileListComponent;
