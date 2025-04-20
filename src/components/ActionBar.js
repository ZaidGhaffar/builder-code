import React from 'react';
import { zoomPlugin, ZoomInIcon, ZoomOutIcon } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import './ActionBar.css';

const ActionBar = ({ scale, onScaleChange, list, onListChange, onApplyScale, zoomPluginInstance, onClose }) => {
  const { ZoomInButton, ZoomOutButton } = zoomPluginInstance;

  return (
    <div className="action-bar">
      <select value={scale} onChange={onScaleChange}>
        <option value="1:5">1:5</option>
        <option value="1:10">1:10</option>
        <option value="1:20">1:20</option>
        <option value="1:25">1:25</option>
        <option value="1:30">1:30</option>
        <option value="1:40">1:40</option>
        <option value="1:50">1:50</option>
        <option value="1:75">1:75</option>
        <option value="1:100">1:100</option>
        <option value="1:125">1:125</option>
        <option value="1:150">1:150</option>
        <option value="1:200">1:200</option>
        <option value="1:250">1:250</option>
        <option value="1:300">1:300</option>
        <option value="1:400">1:400</option>
        <option value="1:500">1:500</option>
        <option value="1:750">1:750</option>
        <option value="1:1000">1:1000</option>
        <option value="1:1250">1:1250</option>
        <option value="1:2000">1:2000</option>
        <option value="1:1">1:1</option>
        <option value="1:6">1:6</option>
        <option value="1:8">1:8</option>
        <option value="1:12">1:12</option>
        <option value="1:16">1:16</option>
        <option value="1:24">1:24</option>
        <option value="1:32">1:32</option>
        <option value="1:48">1:48</option>
        <option value="1:64">1:64</option>
        <option value="1:96">1:96</option>
        <option value="1:128">1:128</option>
        <option value="1:192">1:192</option>
        <option value="1:384">1:384</option>
        <option value="1:768">1:768</option>
        <option value="1:1536">1:1536</option>
        <option value="1:120">1:120</option>
        <option value="1:240">1:240</option>
        <option value="1:360">1:360</option>
        <option value="1:480">1:480</option>
        <option value="1:600">1:600</option>
        <option value="1:720">1:720</option>
        <option value="1:840">1:840</option>
        <option value="1:960">1:960</option>
        <option value="1:1080">1:1080</option>
        <option value="1:1200">1:1200</option>
        <option value="1:18000">1:18000</option>
        <option value="1:2400">1:2400</option>
        <option value="1:3600">1:3600</option>
        <option value="1:4800">1:4800</option>
        <option value="1:6000">1:6000</option>
      </select>
      <select value={list} onChange={onListChange}>
        <option value="ISO A0">ISO A0</option>
        <option value="ISO A1">ISO A1</option>
        <option value="ISO A2">ISO A2</option>
        <option value="ISO A3">ISO A3</option>
        <option value="ISO A4">ISO A4</option>
        <option value="ISO A5">ISO A5</option>
        <option value="ARCH A">ARCH A</option>
        <option value="ARCH B">ARCH B</option>
        <option value="ARCH C">ARCH C</option>
        <option value="ARCH D">ARCH D</option>
        <option value="ARCH E">ARCH E</option>
        <option value="ARCH E1">ARCH E1</option>
        <option value="ANSI A">ANSI A</option>
        <option value="ANSI B">ANSI B</option>
        <option value="ANSI C">ANSI C</option>
        <option value="ANSI D">ANSI D</option>
        <option value="ANSI E">ANSI E</option>
      </select>
      <button className="wide-button" onClick={onApplyScale}>Select Scale</button>
      <ZoomInButton />
      <ZoomOutButton />
      <button className="wide-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default ActionBar;
