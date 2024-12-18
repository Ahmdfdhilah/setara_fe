import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  FeatureGroup,
  useMap
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds, LatLng, divIcon } from 'leaflet';
import axios from 'axios';
import { area, centerOfMass } from '@turf/turf';
import { Feature, FeatureCollection } from 'geojson';

// Custom hook for calculating bounds
const useDynamicBounds = () => {
  const [bounds, setBounds] = useState<LatLngBounds | null>(null);

  const calculateOptimizedBounds = (locations: number[][][], gudangLocations?: number[][]) => {
    if (!locations || locations.length === 0) return null;

    const allCoordinates: number[][] = [];

    // Collect all coordinates from lahan
    locations.forEach(lahanCoords => {
      lahanCoords.forEach(coord => {
        allCoordinates.push(coord);
      });
    });

    // Add gudang coordinates if available
    if (gudangLocations) {
      allCoordinates.push(...gudangLocations);
    }

    // Find extreme points
    const longitudes = allCoordinates.map(coord => coord[0]);
    const latitudes = allCoordinates.map(coord => coord[1]);

    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);

    // Calculate padding dynamically based on spread
    const lngSpread = maxLng - minLng;
    const latSpread = maxLat - minLat;
    const lngPadding = lngSpread * 0.1;
    const latPadding = latSpread * 0.1;

    return new LatLngBounds(
      new LatLng(minLat - latPadding, minLng - lngPadding),
      new LatLng(maxLat + latPadding, maxLng + lngPadding)
    );
  };

  return { bounds, calculateOptimizedBounds, setBounds };
};

// Define types for our data
interface LahanData {
  nama: string;
  id: string;
  koordinat: number[][];
  luas?: number;
}

interface GudangData {
  id: string;
  nama: string;
  lokasi: number[];
}

// Custom component to handle zooming to feature
const ZoomToFeature = ({ feature }: { feature: Feature }) => {
  const map = useMap();

  const zoomToFeature = () => {
    if (feature.geometry.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0];
      const bounds = new LatLngBounds(
        coordinates.map(coord => [coord[1], coord[0]])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <Marker
      position={createLabelPosition(feature)}
      icon={divIcon({
        className: 'custom-label',
        html: `
        <div class="flex justify-center items-center text-xs font-bold text-blue-700 
          bg-white/70 px-12 py-2 rounded-md border border-blue-300 
          hover:bg-blue-100 cursor-pointer">
          ${(feature.properties as any)?.name || ''}
        </div>`,
      })}
      eventHandlers={{
        click: zoomToFeature,
      }}
    />

  );
};

// Function to create label position
const createLabelPosition = (feature: Feature): [number, number] => {
  const center = centerOfMass(feature);
  const [lng, lat] = center.geometry.coordinates;
  return [lat, lng];
};


const Map = () => {
  const [lahanData, setLahanData] = useState<FeatureCollection | null>(null);
  const [gudangData, setGudangData] = useState<GudangData[]>([]);
  const { bounds, calculateOptimizedBounds, setBounds } = useDynamicBounds();
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);

  // New function to estimate yield based on area and soil type
  const calculateEstimatedYield = (lahan: LahanData) => {
    const baseYieldPerHectare = 5; 
    const area = parseFloat(calculateArea(lahan.koordinat));

    // Adjust yield based on different factors
    const soilMultiplier = determineSoilYieldMultiplier(lahan.koordinat);

    return (area * baseYieldPerHectare * soilMultiplier).toFixed(2);
  };

  // Determine soil type based on geographical characteristics
  const determineSoilType = (coordinates: number[][]) => {
    // This is a simplified mock implementation
    // In a real-world scenario, you'd use more sophisticated geospatial analysis
    const centerCoord = coordinates[0];
    const longitude = centerCoord[0];
    const latitude = centerCoord[1];

    if (latitude < -5.4 && longitude > 105.4) return 'Aluvial';
    if (latitude < -5.3 && longitude < 105.3) return 'Volcanik';
    return 'Sedimen';
  };

  // Soil yield multiplier based on soil type
  const determineSoilYieldMultiplier = (coordinates: number[][]) => {
    const soilType = determineSoilType(coordinates);

    switch (soilType) {
      case 'Volcanik': return 1.2; // Higher yield
      case 'Aluvial': return 1.0; // Average yield
      case 'Sedimen': return 0.8; // Lower yield
      default: return 1.0;
    }
  };

  // Dynamic styling based on estimated yield
  const getDynamicLahanStyle = (feature?: Feature) => {
    if (!feature) return lahanStyle;

    const estimatedYield = parseFloat((feature.properties as any)?.estimatedYield || 0);

    const getColorBasedOnYield = () => {
      if (estimatedYield < 10) return 'red';
      if (estimatedYield < 20) return 'orange';
      if (estimatedYield < 30) return 'yellow';
      return 'green';
    };

    return {
      ...lahanStyle,
      fillColor: getColorBasedOnYield(),
      color: getColorBasedOnYield(),
      fillOpacity: 0.7
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lahanResponse, gudangResponse] = await Promise.all([
          axios.get<LahanData[]>('http://localhost:8000/api/lahan'),
          axios.get<GudangData[]>('http://localhost:8000/api/gudang'),
        ]);

        const processedLahanData: FeatureCollection = {
          type: 'FeatureCollection',
          features: lahanResponse.data.map((lahan) => ({
            type: 'Feature',
            properties: {
              name: lahan.nama,
              id: lahan.id,
              luas: calculateArea(lahan.koordinat),
              estimatedYield: calculateEstimatedYield(lahan),
              soilType: determineSoilType(lahan.koordinat),
            },
            geometry: {
              type: 'Polygon',
              coordinates: [lahan.koordinat],
            },
          })),
        };

        const gudangLocations = gudangResponse.data.map(
          (gudang) => gudang.lokasi
        );

        const lahanCoordinates = lahanResponse.data.map(
          (lahan) => lahan.koordinat
        );

        const calculatedBounds = calculateOptimizedBounds(
          lahanCoordinates,
          gudangLocations
        );

        setLahanData(processedLahanData);
        setGudangData(gudangResponse.data);
        setBounds(calculatedBounds);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Function to calculate area if not provided
  const calculateArea = (coordinates: number[][]) => {
    try {
      const polygonFeature: Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates]
        }
      };
      const areaInSquareMeters = area(polygonFeature);
      return (areaInSquareMeters / 10000).toFixed(2);
    } catch (error) {
      console.error('Error calculating area:', error);
      return 'N/A';
    }
  };

  // Gaya untuk lahan
  const lahanStyle = {
    color: 'blue',
    weight: 2,
    opacity: 1,
    fillColor: 'lightblue',
    fillOpacity: 0.5,
  };

  const getPopupContent = (feature: Feature) => {
    const { name, luas, estimatedYield, soilType } = feature.properties as any;
    return `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${name}</h3>
        <p><strong>Luas:</strong> ${luas} hektar</p>
        <p><strong>Perkiraan Hasil Panen:</strong> ${estimatedYield} ton</p>
        <p><strong>Jenis Tanah:</strong> ${soilType}</p>
      </div>
    `;
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-16 space-y-12">
        <div data-aos="fade-up" className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Persebaran Kami</h2>
          </div>
          <p className="text-lg text-gray-700 flex items-center justify-center">
            Persebaran lahan, mitra, dan gudang Setara Commodity
          </p>
        </div>
        <div className="w-[90vw] h-[70vh] shadow-2xl rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-full">
            <MapContainer
              center={[-5.35, 105.5]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              bounds={bounds || undefined}
              minZoom={8}
              maxZoom={18}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
              />

              {lahanData && (
                <FeatureGroup>
                  <GeoJSON
                    data={lahanData}
                    style={(feature) => getDynamicLahanStyle(feature)}
                    onEachFeature={(feature, layer) => {
                      layer.bindPopup(getPopupContent(feature));

                      layer.on({
                        click: () => {
                          setSelectedFeature(feature);
                        }
                      });
                    }}
                  />

                  {lahanData.features.map((feature: Feature, index: number) => (
                    <ZoomToFeature key={`label-${index}`} feature={feature} />
                  ))}
                </FeatureGroup>
              )}

              {gudangData.map((gudang: GudangData) => (
                <Marker
                  key={gudang.id}
                  position={[gudang.lokasi[1], gudang.lokasi[0]] as [number, number]}
                >
                  <Popup>
                    <strong>{gudang.nama}</strong>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Panel Detail Tambahan: Lahan yang Dipilih */}
        {selectedFeature && (
          <div className="mt-6 p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-3xl font-extrabold text-emerald-700/70 mb-4">
              📍 Detail {(selectedFeature.properties as any).name}
            </h3>
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">📏 Luas:</span> {(selectedFeature.properties as any).luas} hektar
                </p>
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">🌱 Jenis Tanah:</span> {(selectedFeature.properties as any).soilType}
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-lg">
                  <span className="font-semibold text-gray-700">🌾 Perkiraan Hasil:</span> {(selectedFeature.properties as any).estimatedYield} ton
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 border-t border-blue-300">
              <p className="text-sm text-gray-600 italic">
                Catatan: Perkiraan hasil panen bergantung pada kondisi cuaca dan faktor lingkungan lainnya.
              </p>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Map;