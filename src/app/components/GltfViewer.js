'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import { Viewer } from '../lib/viewer';
import './GltfViewer.css';

// Predefined camera positions for different views (lowered positions)
const CAMERA_VIEWS = {
  default: { position: [0, -2, 15], name: 'Default View' },
  front: { position: [0, -2, 3], name: 'Front View' },
  back: { position: [0, -2, -3], name: 'Back View' },
  left: { position: [-3, -2, 0], name: 'Left View' },
  right: { position: [3, -2, 0], name: 'Right View' },
  top: { position: [0, 1, 0], name: 'Top View' },
  bottom: { position: [0, -5, 0], name: 'Bottom View' },
  closeup: { position: [1, -1.5, 1], name: 'Close-up View' },
  wide: { position: [5, 1, 60], name: 'Wide View' }
};

export default function GltfViewer() {
  const viewerRef = useRef(null);
  const viewerInstanceRef = useRef(null);
  const [currentView, setCurrentView] = useState('default');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showNSSC, setShowNSSC] = useState(false);
  const [animateNSSC, setAnimateNSSC] = useState(false);

  const createViewer = () => {
    if (!viewerRef.current) return;
    
    // Clear any existing content
    viewerRef.current.innerHTML = '';
    
    // Create viewer element
    const viewerEl = document.createElement('div');
    viewerEl.classList.add('viewer');
    viewerEl.style.width = '100%';
    viewerEl.style.height = '100%';
    
    viewerRef.current.appendChild(viewerEl);
    
    // Initialize viewer with minimal options
    viewerInstanceRef.current = new Viewer(viewerEl, {
      kiosk: false, // Hide controls
      preset: '',
      cameraPosition: null,
    });
    
  };

  const performEntryAnimation = () => {
    if (!viewerInstanceRef.current) return;
    
    const camera = viewerInstanceRef.current.defaultCamera;
    const modelCenter = new THREE.Vector3(0, -2, 0); // Model center point
    
    setIsTransitioning(true);
    
    // Orbital entry animation parameters
    const duration = 3000; // 4 seconds
    const startTime = Date.now();
    const startRadius = 3; // Start close to model
    const endRadius = 15; // End at default distance
    const totalRotations = 1.23; // 1.5 full rotations around the model
    const startAngle = 0; // Start from the right side
    const startHeight = -2; // Start at model level
    const endHeight = -2; // Stay at same height
    
    function animateEntry() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutQuart for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      
      // Calculate current radius (spiral outward)
      const currentRadius = startRadius + (endRadius - startRadius) * easedProgress;
      
      // Calculate current angle (rotate around model)
      const currentAngle = startAngle + (totalRotations * Math.PI * 2 * progress);
      
      // Calculate current height
      const currentHeight = startHeight + (endHeight - startHeight) * easedProgress;
      
      // Convert polar coordinates to cartesian
      const x = modelCenter.x + Math.cos(currentAngle) * currentRadius;
      const z = modelCenter.z + Math.sin(currentAngle) * currentRadius;
      const y = currentHeight;
      
      // Set camera position
      camera.position.set(x, y, z);
      
      // Always look at the model center
      camera.lookAt(modelCenter);
      
      if (progress < 1) {
        requestAnimationFrame(animateEntry);
      } else {
        // Animation complete - set to exact default position
        camera.position.set(0, -2, 15);
        camera.lookAt(modelCenter);
        setIsTransitioning(false);
        setCurrentView('default');
        
        // Start NSSC text animation after camera animation completes
        setTimeout(() => {
          setShowNSSC(true);
          setTimeout(() => {
            setAnimateNSSC(true);
          }, 100);
        }, 500);
        
        console.log('Orbital entry animation completed');
      }
    }
    
    animateEntry();
  };

  const loadModel = useCallback(() => {
    if (!viewerInstanceRef.current) return;

    const modelPath = '/space5.glb';
    
    viewerInstanceRef.current
      .load(modelPath, '', new Map())
      .then(() => {
        // Model loaded successfully, start with entry animation
        performEntryAnimation();
      })
      .catch((error) => {
        console.error('Error loading model:', error);
      });
  }, []);

  useEffect(() => {
    // Check for browser compatibility
    if (!WebGL.isWebGL2Available()) {
      console.error('WebGL is not supported in this browser.');
      return;
    }

    // Set up global THREE reference for debugging
    window.THREE = THREE;
    window.VIEWER = {};

    // Initialize the viewer and load the model immediately
    if (viewerRef.current) {
      createViewer();
      // Automatically load the sample model
      loadModel();
    }

    return () => {
      if (viewerInstanceRef.current) {
        viewerInstanceRef.current.clear();
      }
    };
  }, [loadModel]);

  const setCameraView = (viewKey) => {
    if (!viewerInstanceRef.current || !CAMERA_VIEWS[viewKey] || isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentView(viewKey);
    
    const camera = viewerInstanceRef.current.defaultCamera;
    const targetPosition = new THREE.Vector3(...CAMERA_VIEWS[viewKey].position);
    const startPosition = camera.position.clone();
    
    // Smooth camera transition
    let progress = 0;
    const duration = 2000; // 1 second transition
    const startTime = Date.now();
    
    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / duration, 1);
      
      // Smooth easing function (ease-in-out)
      const easedProgress = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Interpolate camera position
      camera.position.lerpVectors(startPosition, targetPosition, easedProgress);
      camera.lookAt(new THREE.Vector3(0, -2, 0)); // Look at lowered model center
      
      viewerInstanceRef.current.render();
      
      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      } else {
        setIsTransitioning(false);
      }
    };
    
    animateCamera();
  };

  return (
    <div className="gltf-viewer-container" style={{ 
      position: 'relative', 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden',
      margin: 0,
      padding: 0
    }}>
      {/* 3D Viewer */}
      <div 
        ref={viewerRef}
        className="gltf-viewer-container"
      />
      
      {/* Camera View Controls */}
      <div className="camera-controls">
        {Object.entries(CAMERA_VIEWS).map(([key, view]) => (
          <button
            key={key}
            onClick={() => setCameraView(key)}
            disabled={isTransitioning}
            className={`camera-control-button ${currentView === key ? 'active' : ''}`}
          >
            {view.name}
          </button>
        ))}
      </div>
     {/* Place NSSC2025 text above the 3D model, visually above the head */}
     <div
       className={`NSSC ${showNSSC ? 'nssc-visible' : ''} ${animateNSSC ? 'nssc-animate' : ''}`}
     >
       {'NSSC2025'.split('').map((letter, index) => (
         <span key={index}>{letter}</span>
       ))}
     </div>
     
     
      {/* Instructions Panel */}
      <div className="instructions-panel">
        <h4>Camera Controls</h4>
        <p>Click the buttons on the right to change camera views.</p>
        <p>Current view: <strong>{CAMERA_VIEWS[currentView].name}</strong></p>
        {isTransitioning && <p style={{ color: '#4CAF50' }}>Transitioning...</p>}
      </div>
    </div>
  );
}
