import { useState, useEffect, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { Minimize2, Maximize2, Map as MapIcon, Globe as GlobeIcon } from 'lucide-react';

const ClientMap = ({ clients = [], width, height }) => {
    const globeEl = useRef();
    const [viewMode, setViewMode] = useState('world'); // 'world' | 'india'
    const [dimensions, setDimensions] = useState({ width: width || 300, height: height || 300 });
    const containerRef = useRef();

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: width || containerRef.current.offsetWidth,
                    height: height || containerRef.current.offsetHeight || 300
                });
            }
        };

        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => window.removeEventListener('resize', updateDimensions);
    }, [width, height]);

    // Helper to extract valid coordinates
    const mapData = useMemo(() => {
        return (clients || [])
            .filter(c => c.lat && c.lng)
            .map(c => ({
                id: c.id,
                name: c.name,
                lat: Number(c.lat),
                lng: Number(c.lng),
                size: 0.5,
                color: '#e67e50'
            }));
    }, [clients]);

    useEffect(() => {
        if (!globeEl.current) return;

        const controls = globeEl.current.controls();
        if (controls) {
            // Auto-rotate
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }

        // Calculate center point of all clients for initial view
        if (mapData.length > 0) {
            const avgLat = mapData.reduce((sum, d) => sum + d.lat, 0) / mapData.length;
            const avgLng = mapData.reduce((sum, d) => sum + d.lng, 0) / mapData.length;

            // View transition
            if (viewMode === 'india') {
                globeEl.current.pointOfView({ lat: 20, lng: 78, altitude: 2 }, 2000);
                if (controls) controls.autoRotateSpeed = 0.2;
            } else {
                // Start from the center of client locations
                globeEl.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: 2.5 }, 2000);
                if (controls) controls.autoRotateSpeed = 0.5;
            }
        } else {
            // Default view if no clients
            if (viewMode === 'india') {
                globeEl.current.pointOfView({ lat: 20, lng: 78, altitude: 2 }, 2000);
                if (controls) controls.autoRotateSpeed = 0.2;
            } else {
                globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 2000);
                if (controls) controls.autoRotateSpeed = 0.5;
            }
        }
    }, [viewMode, mapData]);

    return (
        <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
            {/* Minimal Toggle */}
            <div className="absolute top-2 right-2 z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/20 backdrop-blur-sm p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setViewMode('world')}
                        className={`p-1 rounded ${viewMode === 'world' ? 'text-white' : 'text-white/40'}`}
                    >
                        <GlobeIcon size={14} />
                    </button>
                    <button
                        onClick={() => setViewMode('india')}
                        className={`p-1 rounded ${viewMode === 'india' ? 'text-white' : 'text-white/40'}`}
                    >
                        <MapIcon size={14} />
                    </button>
                </div>
            </div>

            {/* The Globe */}
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"

                // Visual Style
                showGraticules={true}
                graticulesColor="rgba(255,255,255,0.15)"
                showAtmosphere={false}

                // Points/Pins
                htmlElementsData={mapData}
                htmlElement={d => {
                    const el = document.createElement('div');
                    // Reset styling to ensure no default layout interference
                    el.style.width = '0';
                    el.style.height = '0';
                    el.style.position = 'absolute';
                    el.style.overflow = 'visible';
                    el.style.pointerEvents = 'none'; // Container shouldn't block

                    el.innerHTML = `
                         <!-- Content Wrapper: Centered at (0,0) -->
                        <div style="
                            position: absolute;
                            top: 0;
                            left: 0;
                            transform: translate(-50%, -50%); /* EXACT center anchor */
                            display: flex;
                            flex-direction: column-reverse; /* GROW UPWARDS from the dot */
                            align-items: center;
                            justify-content: flex-start;
                        ">
                            <!-- Surface Dot (The Anchor - Bottom) -->
                            <div style="
                                width: 6px;
                                height: 6px;
                                background: var(--accent-orange);
                                border-radius: 50%;
                                box-shadow: 0 0 10px var(--accent-orange);
                                z-index: 10;
                                margin-top: -3px; /* Center alignment adjustment if needed, but flex-direction usually handles it. Actually, centering 6px dot needs no margin in a 0-height container if centered correctly, but let's be safe */
                            "></div>
                            
                            <!-- Connecting Line (Middle) -->
                            <div style="
                                width: 1px;
                                height: 40px;
                                background: linear-gradient(to top, rgba(230, 126, 80, 0.2), var(--accent-orange));
                            "></div>
                            
                            <!-- Floating Label (Top) -->
                            <div style="
                                margin-bottom: 2px;
                                background: rgba(20,20,20,0.95);
                                border: 1px solid var(--accent-orange);
                                padding: 6px 10px;
                                border-radius: 8px;
                                color: white;
                                font-size: 11px;
                                font-weight: 600;
                                box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                white-space: nowrap;
                                pointer-events: auto; /* Allow interaction */
                                cursor: pointer;
                            " class="marker-label">
                                <span style="display:inline-block; width:6px; height:6px; background:var(--accent-orange); border-radius:50%;"></span>
                                ${d.name}
                            </div>
                        </div>
                    `;
                    return el;
                }}
            />
        </div>
    );
};

export default ClientMap;
