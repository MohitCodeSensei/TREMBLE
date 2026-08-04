import { jsx as _jsx } from "react/jsx-runtime";
import { Kawarp as KawarpCore } from "./core.js"; // Pointed to our local core.js file
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, } from "react";

/**
 * Hook to control a Kawarp component imperatively
 */
export function useKawarp() {
    const ref = useRef(null);
    const loadImage = useCallback(async (src) => {
        await ref.current?.loadImage(src);
    }, []);
    const loadBlob = useCallback(async (blob) => {
        await ref.current?.loadBlob(blob);
    }, []);
    const loadGradient = useCallback((colors, angle) => {
        ref.current?.loadGradient(colors, angle);
    }, []);
    const start = useCallback(() => {
        ref.current?.start();
    }, []);
    const stop = useCallback(() => {
        ref.current?.stop();
    }, []);
    return { ref, loadImage, loadBlob, loadGradient, start, stop };
}

export const Kawarp = forwardRef(function Kawarp({ className, style, src, autoPlay = true, onLoad, onError, warpIntensity, blurPasses, animationSpeed, transitionDuration, saturation, tintColor, tintIntensity, dithering, scale, }, ref) {
    const canvasRef = useRef(null);
    const kawarpRef = useRef(null);
    const containerRef = useRef(null);
    const initializedRef = useRef(false);
    const currentSrcRef = useRef(undefined);
    // Expose imperative methods
    useImperativeHandle(ref, () => ({
        get instance() {
            return kawarpRef.current;
        },
        loadImage: async (url) => {
            await kawarpRef.current?.loadImage(url);
        },
        loadBlob: async (blob) => {
            await kawarpRef.current?.loadBlob(blob);
        },
        loadGradient: (colors, angle) => {
            kawarpRef.current?.loadGradient(colors, angle);
        },
        start: () => {
            kawarpRef.current?.start();
        },
        stop: () => {
            kawarpRef.current?.stop();
        },
    }), []);
    // Initialize Kawarp
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const kawarp = new KawarpCore(canvas, {
            warpIntensity,
            blurPasses,
            animationSpeed,
            transitionDuration,
            saturation,
            tintColor,
            tintIntensity,
            dithering,
            scale,
        });
        kawarpRef.current = kawarp;
        initializedRef.current = true;
        // Load initial image if provided
        if (src) {
            currentSrcRef.current = src;
            kawarp
                .loadImage(src)
                .then(() => {
                onLoad?.();
                if (autoPlay)
                    kawarp.start();
            })
                .catch((error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            });
        }
        else if (autoPlay) {
            kawarp.start();
        }
        return () => {
            kawarp.dispose();
            kawarpRef.current = null;
            initializedRef.current = false;
        };
        // Only run on mount/unmount - options and src are updated separately
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    // Auto-load when src prop changes
    useEffect(() => {
        if (!initializedRef.current || !kawarpRef.current)
            return;
        if (src === currentSrcRef.current)
            return;
        currentSrcRef.current = src;
        if (src) {
            kawarpRef.current
                .loadImage(src)
                .then(() => onLoad?.())
                .catch((error) => {
                onError?.(error instanceof Error ? error : new Error(String(error)));
            });
        }
    }, [src, onLoad, onError]);
    // Memoize tintColor to prevent unnecessary updates
    const stableTintColor = useMemo(() => tintColor, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tintColor?.[0], tintColor?.[1], tintColor?.[2]]);
    // Update options when props change
    useEffect(() => {
        kawarpRef.current?.setOptions({
            warpIntensity,
            blurPasses,
            animationSpeed,
            transitionDuration,
            saturation,
            tintColor: stableTintColor,
            tintIntensity,
            dithering,
            scale,
        });
    }, [
        warpIntensity,
        blurPasses,
        animationSpeed,
        transitionDuration,
        saturation,
        stableTintColor,
        tintIntensity,
        dithering,
        scale,
    ]);
    // Handle resize with ResizeObserver (debounced, with devicePixelRatio)
    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas)
            return;
        let resizeTimeout = null;
        const updateSize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = Math.round(rect.width);
            canvas.height = Math.round(rect.height);
            kawarpRef.current?.resize();
        };
        const debouncedUpdateSize = () => {
            if (resizeTimeout)
                clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateSize, 100);
        };
        const resizeObserver = new ResizeObserver(debouncedUpdateSize);
        resizeObserver.observe(container);
        updateSize();
        return () => {
            resizeObserver.disconnect();
            if (resizeTimeout)
                clearTimeout(resizeTimeout);
        };
    }, []);
    return (_jsx("div", { ref: containerRef, className: className, style: { position: "relative", ...style }, children: _jsx("canvas", { ref: canvasRef, style: {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
            } }) }));
});
export default Kawarp;
