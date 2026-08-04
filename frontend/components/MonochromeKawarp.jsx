"use client";
import React, { useEffect, useRef } from 'react';
import { Kawarp } from '@kawarp/core';

export default function MonochromeKawarp({ src, isPlaying }) {
    const containerRef = useRef(null);
    const kawarpRef = useRef(null);

    // Initialize Kawarp on mount
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Dynamically create canvas so we can safely lose its context on unmount
        // without breaking React Strict Mode which reuses DOM elements.
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.objectFit = 'cover';
        container.appendChild(canvas);

        // Instantiate the core WebGL visualizer
        const kawarp = new Kawarp(canvas);
        kawarpRef.current = kawarp;

        // Apply visual parameters
        kawarp.warpIntensity = 1.50;
        kawarp.blurPasses = 8;
        kawarp.animationSpeed = 0.60;
        kawarp.saturation = 1.50;
        kawarp.dithering = 0.008;
        kawarp.scale = 2.50;

        // Start rendering loop
        kawarp.start();

        // Perform initial resize
        kawarp.resize();

        // Listen for screen resize to update WebGL viewport
        const handleResize = () => {
            if (kawarpRef.current) {
                kawarpRef.current.resize();
            }
        };
        window.addEventListener('resize', handleResize);

        // Cleanup on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            if (kawarpRef.current) {
                kawarpRef.current.stop();
                
                // Forcefully release the WebGL context to prevent hitting browser limits
                const gl = kawarpRef.current.gl;
                if (gl) {
                    const ext = gl.getExtension('WEBGL_lose_context');
                    if (ext) ext.loseContext();
                }

                kawarpRef.current.dispose();
                kawarpRef.current = null;
            }
            if (container.contains(canvas)) {
                container.removeChild(canvas);
            }
        };
    }, []);

    // Load image when source changes
    useEffect(() => {
        const kawarp = kawarpRef.current;
        let isSubscribed = true;

        if (kawarp && src) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                if (isSubscribed && kawarpRef.current === kawarp) {
                    try {
                        kawarp.loadImageElement(img);
                    } catch (err) {
                        console.warn("Kawarp failed to process image:", err);
                    }
                }
            };
            img.onerror = (err) => {
                console.warn("Failed to load image for Kawarp:", err);
            };
            img.src = src;
        }

        return () => {
            isSubscribed = false;
        };
    }, [src]);


    return (
        <div 
            style={{ 
                position: 'absolute', 
                inset: '-50px',
                width: 'calc(100% + 100px)', 
                height: 'calc(100% + 100px)', 
                overflow: 'hidden',
                filter: 'blur(30px)'
            }} 
            id="visualizer-canvas"
            ref={containerRef}
        >
        </div>
    );
}
