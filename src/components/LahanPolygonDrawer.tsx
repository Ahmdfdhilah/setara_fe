import React, { useState, useCallback, useMemo } from 'react';
import {
    MapContainer,
    TileLayer,
    Marker,
    Polygon,
    Polyline,
    useMapEvents
} from 'react-leaflet';
import {
    LatLng,
    LatLngExpression
} from 'leaflet';
import {
    FaSave,
    FaUndo,
    FaCheckCircle,
    FaTimesCircle,
    FaDrawPolygon,
    FaTrash
} from 'react-icons/fa';
import * as turf from '@turf/turf';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

// Enum for polygon drawing status
enum PolygonStatus {
    DRAWING,
    COMPLETE,
    INVALID,
    DELETE_POINT
}

// Type for land data
interface Lahan {
    id?: string;
    nama: string;
    koordinat: [number, number][];
    luas?: number;
}

// Constants for proximity threshold
const PROXIMITY_THRESHOLD = 0.005; // Approximately 500-600 meters
const MIN_POLYGON_POINTS = 3;

// Utility function to check if two points are close
const arePointsClose = (point1: LatLng, point2: LatLng): boolean => {
    const distance = Math.sqrt(
        Math.pow(point1.lat - point2.lat, 2) + Math.pow(point1.lng - point2.lng, 2)
    );
    return distance < PROXIMITY_THRESHOLD;
};

// Utility function to check for line intersections
const linesCross = (coords: LatLng[]): boolean => {
    if (coords.length < 4) return false;

    const turfLine = turf.lineString(coords.map(coord => [coord.lng, coord.lat]));
    const selfIntersection = turf.lineIntersect(turfLine, turfLine);

    // Ignore intersections at start/end points
    const realIntersections = selfIntersection.features.filter(
        (feat) => !coords.some(
            coord =>
                Math.abs(feat.geometry.coordinates[0] - coord.lng) < 0.0001 &&
                Math.abs(feat.geometry.coordinates[1] - coord.lat) < 0.0001
        )
    );

    return realIntersections.length > 0;
};

// Function to calculate polygon area
const calculatePolygonArea = (coords: LatLng[]): number => {
    if (coords.length < MIN_POLYGON_POINTS) return 0;

    // Ensure polygon is closed by adding first point at the end
    const closedCoords = [...coords, coords[0]];

    const turfPolygon = turf.polygon([
        closedCoords.map(coord => [coord.lng, coord.lat])
    ]);

    return turf.area(turfPolygon) / 10000; // Convert to hectares
};

const LahanPolygonDrawer: React.FC = () => {
    const [koordinat, setKoordinat] = useState<LatLng[]>([]);
    const [nama, setNama] = useState<string>('');
    const [center] = useState<LatLngExpression>([-2.5489, 118.0148]);
    const [mode, setMode] = useState<PolygonStatus>(PolygonStatus.DRAWING);

    // Polygon status calculation
    const polygonStatus = useMemo(() => {
        if (koordinat.length < MIN_POLYGON_POINTS) return PolygonStatus.DRAWING;

        // Check if polygon is close to being closed
        const firstPoint = koordinat[0];
        const lastPoint = koordinat[koordinat.length - 1];

        const isClosedNearFirstPoint = firstPoint && lastPoint &&
            arePointsClose(firstPoint, lastPoint);

        // Check for line intersections
        if (linesCross(koordinat)) {
            return PolygonStatus.INVALID;
        }

        return isClosedNearFirstPoint ? PolygonStatus.COMPLETE : PolygonStatus.DRAWING;
    }, [koordinat]);

    // Calculate land area
    const luasLahan = useMemo(() => {
        return calculatePolygonArea(koordinat);
    }, [koordinat]);

    const handleAddCoordinate = useCallback((event: any) => {
        const newCoord = event.latlng;

        // Point deletion mode
        if (mode === PolygonStatus.DELETE_POINT) {
            const indexToRemove = koordinat.findIndex(
                coord => arePointsClose(coord, newCoord)
            );

            if (indexToRemove !== -1) {
                const newKoordinat = [
                    ...koordinat.slice(0, indexToRemove),
                    ...koordinat.slice(indexToRemove + 1)
                ];
                setKoordinat(newKoordinat);
            }
            return;
        }

        // If polygon is not complete, add coordinate
        if (polygonStatus !== PolygonStatus.COMPLETE) {
            // Check if new point is close to the first point to close the polygon
            const firstPoint = koordinat[0];
            const isNearFirstPoint = firstPoint &&
                arePointsClose(firstPoint, newCoord);

            if (isNearFirstPoint && koordinat.length >= MIN_POLYGON_POINTS - 1) {
                // Close the polygon by adding the first point
                setKoordinat([...koordinat, firstPoint]);
            } else {
                // Add new coordinate
                setKoordinat([...koordinat, newCoord]);
            }
        }
    }, [koordinat, polygonStatus, mode]);

    const resetDrawing = () => {
        setKoordinat([]);
        setMode(PolygonStatus.DRAWING);
    };

    const handleSaveLahan = async () => {
        if (polygonStatus !== PolygonStatus.COMPLETE) {
            alert('Polygon belum lengkap atau tidak valid');
            return;
        }

        // Validate land name
        if (!nama.trim()) {
            alert('Silakan masukkan nama lahan');
            return;
        }

        const lahanData: Lahan = {
            nama: nama.trim(),
            koordinat: koordinat.map(coord => [coord.lng, coord.lat]),
        };

        try {
            console.log(lahanData.koordinat[0]);
            
            await axios.post('http://localhost:8000/api/lahan', lahanData);
            alert(`Lahan berhasil disimpan. Luas: ${luasLahan.toFixed(2)} hektar`);
            resetDrawing();
            setNama('');
        } catch (error) {
            console.error('Gagal menyimpan lahan:', error);
            alert('Gagal menyimpan lahan');
        }
    };

    // Custom map events component
    const MapEvents = () => {
        useMapEvents({
            click: handleAddCoordinate
        });
        return null;
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <div className="flex space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Nama Lahan"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="flex-grow p-2 border rounded"
                />
                <button
                    onClick={resetDrawing}
                    className="p-2 bg-yellow-500 text-white rounded flex items-center"
                >
                    <FaUndo className="mr-2" /> Reset
                </button>
                <button
                    onClick={() => setMode(
                        mode === PolygonStatus.DELETE_POINT
                            ? PolygonStatus.DRAWING
                            : PolygonStatus.DELETE_POINT
                    )}
                    className={`p-2 rounded flex items-center ${mode === PolygonStatus.DELETE_POINT
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                >
                    <FaTrash className="mr-2" />
                    {mode === PolygonStatus.DELETE_POINT ? 'Batal Hapus' : 'Hapus Titik'}
                </button>
                <button
                    onClick={handleSaveLahan}
                    disabled={polygonStatus !== PolygonStatus.COMPLETE}
                    className={`p-2 text-white rounded flex items-center ${polygonStatus === PolygonStatus.COMPLETE
                            ? 'bg-green-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    <FaSave className="mr-2" /> Simpan
                </button>
            </div>

            <div className="flex-grow relative">
                <MapContainer
                    center={center}
                    zoom={5}
                    style={{ height: '600px', width: '100%' }}
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
                    />

                    <MapEvents />

                    {/* Markers for each coordinate */}
                    {koordinat.map((coord, index) => (
                        <Marker
                            key={index}
                            position={coord}
                            eventHandlers={{
                                click: mode === PolygonStatus.DELETE_POINT
                                    ? () => {
                                        const newKoordinat = [
                                            ...koordinat.slice(0, index),
                                            ...koordinat.slice(index + 1)
                                        ];
                                        setKoordinat(newKoordinat);
                                    }
                                    : undefined
                            }}
                            opacity={mode === PolygonStatus.DELETE_POINT ? 0.5 : 1}
                        />
                    ))}

                    {/* Temporary line before polygon is complete */}
                    {koordinat.length > 1 && polygonStatus !== PolygonStatus.COMPLETE && (
                        <Polyline
                            positions={koordinat}
                            color={linesCross(koordinat) ? 'red' : 'blue'}
                        />
                    )}

                    {/* Polygon when complete */}
                    {polygonStatus === PolygonStatus.COMPLETE && (
                        <Polygon
                            positions={koordinat}
                            color="green"
                            fillColor="rgba(0,255,0,0.3)"
                        />
                    )}
                </MapContainer>

                {/* Polygon status */}
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded shadow">
                    <div className="flex items-center mb-2">
                        <FaDrawPolygon className="mr-2" />
                        Mode:
                        {mode === PolygonStatus.DRAWING && (
                            <span className="ml-2 text-yellow-500">Menggambar</span>
                        )}
                        {mode === PolygonStatus.DELETE_POINT && (
                            <span className="ml-2 text-red-500">Hapus Titik</span>
                        )}
                        {polygonStatus === PolygonStatus.COMPLETE && (
                            <span className="ml-2 text-green-500 flex items-center">
                                <FaCheckCircle className="mr-1" /> Lengkap
                            </span>
                        )}
                        {polygonStatus === PolygonStatus.INVALID && (
                            <span className="ml-2 text-red-500 flex items-center">
                                <FaTimesCircle className="mr-1" /> Tidak Valid
                            </span>
                        )}
                    </div>
                    <div>Luas: {luasLahan.toFixed(2)} hektar</div>
                </div>
            </div>
        </div>
    );
};

export default LahanPolygonDrawer;