import React, { useEffect, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";
import './FileManager.css';

const FileManager = ({ files }) => {
  const [thumbnails, setThumbnails] = useState({});
  const [hoveredFile, setHoveredFile] = useState(null);

  useEffect(() => {
    files.forEach((file) => {
      if (!thumbnails[file.url]) {
        generateThumbnail(file.url);
      }
    });
  }, [files]);

  const generateThumbnail = async (fileUrl) => {
    try {
      const loadingTask = pdfjs.getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.3 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      setThumbnails((prev) => ({ ...prev, [fileUrl]: canvas.toDataURL() }));
    } catch (error) {
      console.error("Error generating thumbnail:", error);
    }
  };

  const handleDelete = (fileName) => {
    console.log("Deleting file:", fileName);
    // Add delete logic here
  };

  const handleRename = (fileName) => {
    console.log("Renaming file:", fileName);
    // Add rename logic here
  };

  const handlePreview = (fileUrl) => {
    window.open(fileUrl, "_blank");
  };

  return (
    <div className="file-manager">
      {files.map((file) => (
        <div
          key={file.name}
          className="file-card"
          onMouseEnter={() => setHoveredFile(file.name)}
          onMouseLeave={() => setHoveredFile(null)}
        >
          <img
            src={thumbnails[file.url] || "placeholder.png"}
            alt={file.name}
            className="file-thumbnail"
          />
          <p>{file.name}</p>
          {hoveredFile === file.name && (
            <div className="file-actions">
              <button onClick={() => handlePreview(file.url)}>Preview</button>
              <button onClick={() => handleRename(file.name)}>Rename</button>
              <button onClick={() => handleDelete(file.name)}>Delete</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FileManager;