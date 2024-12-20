import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
    LatLngExpression,
    Icon,
    DivIcon
} from 'leaflet';
import {
    FaSave,
    FaUndo,
    FaCheckCircle,
    FaTimesCircle,
    FaDrawPolygon,
    FaTrash,
    FaWarehouse
} from 'react-icons/fa';
import { Notification, Confirmation, AlertType } from './Alert';

import * as turf from '@turf/turf';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

enum DrawingMode {
    LAHAN = 'LAHAN',
    GUDANG = 'GUDANG',
    DELETE = 'DELETE'
}

enum PolygonStatus {
    DRAWING,
    COMPLETE,
    INVALID
}

interface Gudang {
    id?: string;
    nama: string;
    lokasi: [number, number];
}

interface Lahan {
    id?: string;
    nama: string;
    koordinat: [number, number][];
    luas?: number;
}

const PROXIMITY_THRESHOLD = 0.001;
const MIN_POLYGON_POINTS = 3;

const arePointsClose = (point1: LatLng, point2: LatLng): boolean => {
    const distance = Math.sqrt(
        Math.pow(point1.lat - point2.lat, 2) + Math.pow(point1.lng - point2.lng, 2)
    );
    return distance < PROXIMITY_THRESHOLD;
};

const linesCross = (coords: LatLng[], existingLahan: Lahan[]): boolean => {
    if (coords.length < 4) return false;

    // Check self-intersection
    const turfLine = turf.lineString(coords.map(coord => [coord.lng, coord.lat]));
    const selfIntersection = turf.lineIntersect(turfLine, turfLine);

    // Check intersection with existing polygons
    for (const lahan of existingLahan) {
        const existingPolygon = turf.polygon([lahan.koordinat]);
        const intersection = turf.lineIntersect(turfLine, existingPolygon);
        if (intersection.features.length > 0) return true;
    }

    const realIntersections = selfIntersection.features.filter(
        (feat) => !coords.some(
            coord =>
                Math.abs(feat.geometry.coordinates[0] - coord.lng) < 0.0001 &&
                Math.abs(feat.geometry.coordinates[1] - coord.lat) < 0.0001
        )
    );

    return realIntersections.length > 0;
};

const calculatePolygonArea = (coords: LatLng[]): number => {
    if (coords.length < MIN_POLYGON_POINTS) return 0;
    const closedCoords = [...coords, coords[0]];
    const turfPolygon = turf.polygon([
        closedCoords.map(coord => [coord.lng, coord.lat])
    ]);
    return turf.area(turfPolygon) / 10000;
};
const coordinateMarkerIcon = new DivIcon({
    html: `<div style="
        width: 12px;
        height: 12px;
        background-color: #3498db;
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
    "></div>`,
    className: 'custom-div-icon',
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const selectedWarehouseIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const existingWarehouseIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LahanGudangManager: React.FC = () => {
    const [koordinat, setKoordinat] = useState<LatLng[]>([]);
    const [nama, setNama] = useState<string>('');
    const [mode, setMode] = useState<DrawingMode>(DrawingMode.LAHAN);
    const [existingLahan, setExistingLahan] = useState<Lahan[]>([]);
    const [existingGudang, setExistingGudang] = useState<Gudang[]>([]);
    const [selectedWarehouseLocation, setSelectedWarehouseLocation] = useState<LatLng | null>(null);
    const [notification, setNotification] = useState<{
        show: boolean;
        type: AlertType;
        message: string;
    }>({
        show: false,
        type: 'info',
        message: '',
    });

    const [confirmation, setConfirmation] = useState<{
        show: boolean;
        title: string;
        message: string;
        itemType?: 'lahan' | 'gudang';
        itemId?: string;
    }>({
        show: false,
        title: '',
        message: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lahanRes, gudangRes] = await Promise.all([
                    axios.get('http://localhost:8000/api/lahan'),
                    axios.get('http://localhost:8000/api/gudang')
                ]);
                setExistingLahan(lahanRes.data);
                setExistingGudang(gudangRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                alert('Gagal memuat data existing');
            }
        };
        fetchData();
    }, []);

    const showNotification = (type: AlertType, message: string) => {
        setNotification({
            show: true,
            type,
            message,
        });
    };

    const polygonStatus = useMemo(() => {
        if (koordinat.length < MIN_POLYGON_POINTS) return PolygonStatus.DRAWING;

        const firstPoint = koordinat[0];
        const lastPoint = koordinat[koordinat.length - 1];
        const isClosedNearFirstPoint = firstPoint && lastPoint &&
            arePointsClose(firstPoint, lastPoint);

        if (linesCross(koordinat, existingLahan)) {
            return PolygonStatus.INVALID;
        }

        return isClosedNearFirstPoint ? PolygonStatus.COMPLETE : PolygonStatus.DRAWING;
    }, [koordinat, existingLahan]);


    const center = useMemo(() => {
        const points: [number, number][] = [];

        // Add warehouse points
        existingGudang.forEach(gudang => {
            points.push([gudang.lokasi[0], gudang.lokasi[1]]);
        });

        // Add land area points
        existingLahan.forEach(lahan => {
            lahan.koordinat.forEach(coord => {
                points.push([coord[0], coord[1]]);
            });
        });

        if (points.length === 0) {
            return [-4.5585, 105.4068] as LatLngExpression;
        }

        // Calculate bounds untuk menentukan center yang lebih akurat
        const lats = points.map(p => p[0]);
        const lngs = points.map(p => p[1]);

        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        return [centerLat, centerLng] as LatLngExpression;
    }, [existingLahan, existingGudang]);

    const luasLahan = useMemo(() => {
        return calculatePolygonArea(koordinat);
    }, [koordinat]);

    const handleMapClick = useCallback((event: any) => {
        const newCoord = event.latlng;

        if (mode === DrawingMode.DELETE) {
            return;
        }

        if (mode === DrawingMode.GUDANG) {
            setSelectedWarehouseLocation(newCoord);
            return;
        }

        if (mode === DrawingMode.LAHAN && polygonStatus !== PolygonStatus.COMPLETE) {
            const firstPoint = koordinat[0];
            const isNearFirstPoint = firstPoint &&
                arePointsClose(firstPoint, newCoord);

            if (isNearFirstPoint && koordinat.length >= MIN_POLYGON_POINTS - 1) {
                setKoordinat([...koordinat, firstPoint]);
            } else {
                setKoordinat([...koordinat, newCoord]);
            }
        }
    }, [koordinat, polygonStatus, mode]);

    const resetDrawing = () => {
        setKoordinat([]);
        setSelectedWarehouseLocation(null);
        setMode(DrawingMode.LAHAN);
        setNama('');
    };

    const handleDelete = (type: 'lahan' | 'gudang', id: string) => {
        setConfirmation({
            show: true,
            title: 'Konfirmasi Hapus',
            message: `Apakah Anda yakin ingin menghapus ${type === 'lahan' ? 'lahan' : 'gudang'} ini?`,
            itemType: type,
            itemId: id,
        });
    };

    const handleConfirmDelete = async () => {
        const { itemType, itemId } = confirmation;
        if (!itemId || !itemType) return;

        try {
            await axios.delete(`http://localhost:8000/api/${itemType}/${itemId}`);
            if (itemType === 'lahan') {
                setExistingLahan(prev => prev.filter(item => item.id !== itemId));
            } else {
                setExistingGudang(prev => prev.filter(item => item.id !== itemId));
            }
            showNotification('success', `${itemType === 'lahan' ? 'Lahan' : 'Gudang'} berhasil dihapus`);
        } catch (error) {
            console.error(`Failed to delete ${itemType}:`, error);
            showNotification('error', `Gagal menghapus ${itemType}`);
        } finally {
            setConfirmation(prev => ({ ...prev, show: false }));
        }
    };


    const handleSave = async () => {
        if (!nama.trim()) {
            showNotification('error', 'Silakan masukkan nama');
            return;
        }

        try {
            if (mode === DrawingMode.LAHAN) {
                if (polygonStatus !== PolygonStatus.COMPLETE) {
                    showNotification('error', 'Polygon belum lengkap atau tidak valid');
                    return;
                }

                const lahanData: Lahan = {
                    nama: nama.trim(),
                    koordinat: koordinat.map(coord => [coord.lng, coord.lat]),
                };

                const response = await axios.post('http://localhost:8000/api/lahan', lahanData);
                setExistingLahan([...existingLahan, response.data]);
                showNotification('success', `Lahan berhasil disimpan. Luas: ${luasLahan.toFixed(2)} hektar`);
            } else if (mode === DrawingMode.GUDANG && selectedWarehouseLocation) {
                const gudangData: Gudang = {
                    nama: nama.trim(),
                    lokasi: [selectedWarehouseLocation.lng, selectedWarehouseLocation.lat],
                };

                const response = await axios.post('http://localhost:8000/api/gudang', gudangData);
                setExistingGudang([...existingGudang, response.data]);
                showNotification('success', 'Gudang berhasil disimpan');
            }

            resetDrawing();
        } catch (error) {
            console.error('Gagal menyimpan:', error);
            showNotification('error', 'Gagal menyimpan data');
        }
    };

    const MapEvents = () => {
        useMapEvents({
            click: handleMapClick
        });
        return null;
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />

            <Confirmation
                show={confirmation.show}
                title={confirmation.title}
                message={confirmation.message}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmation(prev => ({ ...prev, show: false }))}
            />
            <div className="flex space-x-4 mb-4">
                <input
                    type="text"
                    placeholder="Nama"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="flex-grow p-2 border rounded"
                />
                <button
                    onClick={() => setMode(DrawingMode.LAHAN)}
                    className={`p-2 rounded flex items-center ${mode === DrawingMode.LAHAN
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'}`}
                >
                    <FaDrawPolygon className="mr-2" /> Mode Lahan
                </button>
                <button
                    onClick={() => setMode(DrawingMode.GUDANG)}
                    className={`p-2 rounded flex items-center ${mode === DrawingMode.GUDANG
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-700'}`}
                >
                    <FaWarehouse className="mr-2" /> Mode Gudang
                </button>
                <button
                    onClick={() => setMode(DrawingMode.DELETE)}
                    className={`p-2 rounded flex items-center ${mode === DrawingMode.DELETE
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 text-gray-700'}`}
                >
                    <FaTrash className="mr-2" /> Mode Hapus
                </button>
                <button
                    onClick={resetDrawing}
                    className="p-2 bg-yellow-500 text-white rounded flex items-center"
                >
                    <FaUndo className="mr-2" /> Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={mode === DrawingMode.DELETE ||
                        (mode === DrawingMode.LAHAN && polygonStatus !== PolygonStatus.COMPLETE) ||
                        (mode === DrawingMode.GUDANG && !selectedWarehouseLocation)}
                    className={`p-2 text-white rounded flex items-center ${(mode === DrawingMode.LAHAN && polygonStatus === PolygonStatus.COMPLETE) ||
                        (mode === DrawingMode.GUDANG && selectedWarehouseLocation)
                        ? 'bg-green-500'
                        : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    <FaSave className="mr-2" /> Simpan
                </button>
            </div>

            <div className="flex-grow relative">
                <MapContainer
                    center={center}
                    className="z-[500]"
                    zoom={8}
                    minZoom={9}
                    style={{ height: '600px', width: '100%' }}
                >
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
                    />

                    <MapEvents />

                    {/* Existing Land Areas */}
                    {existingLahan.map((lahan, index) => (
                        <Polygon
                            key={`lahan-${index}`}
                            positions={lahan.koordinat.map(coord => ({ lat: coord[1], lng: coord[0] }))}
                            color="green"
                            fillColor="rgba(0,255,0,0.3)"
                            eventHandlers={{
                                click: () => {
                                    if (mode === DrawingMode.DELETE && lahan.id) {
                                        handleDelete('lahan', lahan.id);
                                    }
                                }
                            }}
                        />
                    ))}

                    {/* Existing Warehouses */}
                    {existingGudang.map((gudang, index) => (
                        <Marker
                            key={`gudang-${index}`}
                            position={[gudang.lokasi[1], gudang.lokasi[0]]}
                            icon={existingWarehouseIcon}
                            eventHandlers={{
                                click: () => {
                                    if (mode === DrawingMode.DELETE && gudang.id) {
                                        handleDelete('gudang', gudang.id);
                                    }
                                }
                            }}
                        />
                    ))}

                    {/* Current Drawing */}
                    {mode === DrawingMode.LAHAN && (
                        <>
                            {koordinat.map((coord, index) => (
                                <Marker
                                    key={index}
                                    position={coord}
                                    icon={coordinateMarkerIcon}
                                />
                            ))}

                            {koordinat.length > 1 && polygonStatus !== PolygonStatus.COMPLETE && (
                                <Polyline
                                    positions={koordinat}
                                    color={linesCross(koordinat, existingLahan) ? 'red' : 'blue'}
                                />
                            )}

                            {polygonStatus === PolygonStatus.COMPLETE && (
                                <Polygon
                                    positions={koordinat}
                                    color="green"
                                    fillColor="rgba(0,255,0,0.3)"
                                />
                            )}
                        </>
                    )}

                    {/* Selected Warehouse Location */}
                    {mode === DrawingMode.GUDANG && selectedWarehouseLocation && (
                        <Marker
                            position={selectedWarehouseLocation}
                            icon={selectedWarehouseIcon}
                        />
                    )}
                </MapContainer>

                {/* Status Display */}
                <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded shadow">
                    <div className="flex items-center mb-2">
                        {mode === DrawingMode.LAHAN && (
                            <>
                                <FaDrawPolygon className="mr-2" />
                                Status:
                                {polygonStatus === PolygonStatus.DRAWING && (
                                    <span className="ml-2 text-yellow-500">Menggambar</span>
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
                            </>
                        )}
                        {mode === DrawingMode.GUDANG && (
                            <>
                                <FaWarehouse className="mr-2" />
                                Status:
                                {selectedWarehouseLocation ? (
                                    <span className="ml-2 text-green-500 flex items-center">
                                        <FaCheckCircle className="mr-1" /> Lokasi Dipilih
                                    </span>
                                ) : (
                                    <span className="ml-2 text-yellow-500">Pilih Lokasi</span>
                                )}
                            </>
                        )}
                        {mode === DrawingMode.DELETE && (
                            <>
                                <FaTrash className="mr-2" />
                                <span className="ml-2 text-red-500">Mode Hapus Aktif</span>
                            </>
                        )}
                    </div>
                    {mode === DrawingMode.LAHAN && (
                        <div>Luas: {luasLahan.toFixed(2)} hektar</div>
                    )}
                    <div className="mt-2">
                        <div>Total Lahan: {existingLahan.length}</div>
                        <div>Total Gudang: {existingGudang.length}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LahanGudangManager;