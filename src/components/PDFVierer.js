// src/components/PDFViewer.js
import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useParams } from 'react-router-dom';

function PDFViewer() {
  const { filename } = useParams();

  return (
    <div className="PDFViewer-with-sidebar">
      <Header />
      <div className="content-area">
        <Sidebar />
        <div className="main-content" style={{ height: '80vh' }}>
          <div className="pdf-viewer">
            <Worker
              workerUrl={`https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js`}
            >
              <Viewer fileUrl={`http://localhost:5000/uploads/${filename}`} />
            </Worker>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PDFViewer;
