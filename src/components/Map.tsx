import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  Marker,
  Popup,
  FeatureGroup,
  useMap,
  Polyline,
} from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds, LatLng, divIcon } from 'leaflet';
import axios from 'axios';
import { area, centerOfMass, distance, bearing } from '@turf/turf';
import { Feature, FeatureCollection, Point } from 'geojson';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import RouteModal from './RouteModal';


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
interface MitraData {
  id: number;
  nama: string;
  lokasi: number[];
}

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
interface RouteInstruction {
  text: string;
  distance: number;
  duration: number;
}

interface RouteData {
  coordinates: number[][];
  distance: number;
  duration: number;
  instructions: RouteInstruction[];
}
interface FilterState {
  search: string;
  category: string;
  area: string; // 'small' | 'medium' | 'large'
}

const CurrentLocationMarker = ({ onLocationUpdate }: { onLocationUpdate: (location: [number, number]) => void }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ watch: true, enableHighAccuracy: true });

    map.on('locationfound', (e) => {
      const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPosition);
      onLocationUpdate(newPosition);
    });

    map.on('locationerror', (e) => {
      console.error('Location access denied:', e);
    });

    return () => {
      map.stopLocate();
    };
  }, [map, onLocationUpdate]);

  return position ? (
    <Marker position={position}>
      <Popup>Lokasi Anda Saat Ini</Popup>
    </Marker>
  ) : null;
};

// Calculate distance and bearing between two points
const calculateDistanceAndBearing = (from: [number, number], to: [number, number]) => {
  const fromPoint: Feature<Point> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [from[1], from[0]]
    }
  };

  const toPoint: Feature<Point> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [to[1], to[0]]
    }
  };

  const distanceInKm = distance(fromPoint, toPoint);
  const bearingDegrees = bearing(fromPoint, toPoint);

  // Convert bearing to cardinal direction
  const getCardinalDirection = (bearing: number) => {
    const directions = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
    const index = Math.round(((bearing + 360) % 360) / 45) % 8;
    return directions[index];
  };

  return {
    distance: Math.round(distanceInKm * 100) / 100,
    direction: getCardinalDirection(bearingDegrees)
  };
};

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
  const [mitraData, setMitraData] = useState<MitraData[]>([]);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
  const [selectedGudang, setSelectedGudang] = useState<GudangData | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const { bounds, calculateOptimizedBounds, setBounds } = useDynamicBounds();
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    area: 'all',
  });

  const mitraIcon = new Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
        <circle cx="12" cy="8" r="4" fill="#fff" />
      </svg>
    `),
    iconSize: [24, 24], // Ukuran ikon
    iconAnchor: [12, 24], // Titik anchor ikon (biasanya di tengah bawah)
    popupAnchor: [0, -24], // Titik anchor untuk popup
  });


  const filterBySearch = useCallback((feature: Feature) => {
    if (!filters.search) return true;
    const searchLower = filters.search.toLowerCase();
    const name = ((feature.properties as any)?.name || '').toLowerCase();
    return name.includes(searchLower);
  }, [filters.search]);

  // Rest of the filtering functions remain the same
  const filterByCategory = useCallback((feature: Feature) => {
    if (filters.category === 'all') return true;
    return (feature.properties as any)?.category === filters.category;
  }, [filters.category]);

  const filterByArea = useCallback((feature: Feature) => {
    if (filters.area === 'all') return true;
    const areaSize = parseFloat((feature.properties as any)?.luas || 0);

    switch (filters.area) {
      case 'small': return areaSize < 10;
      case 'medium': return areaSize >= 10 && areaSize < 20;
      case 'large': return areaSize >= 20;
      default: return true;
    }
  }, [filters.area]);

  const filteredLahanData = useMemo(() => {
    if (!lahanData) return null;

    const filteredFeatures = lahanData.features.filter(feature =>
      filterBySearch(feature) &&
      filterByCategory(feature) &&
      filterByArea(feature)
    );

    return {
      type: 'FeatureCollection' as const,
      features: filteredFeatures
    };
  }, [lahanData, filterBySearch, filterByCategory, filterByArea]);

  const fetchRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson&steps=true&annotations=true`
      );

      if (response.data.routes && response.data.routes[0]) {
        const route = response.data.routes[0];
        const instructions = route.legs[0].steps.map((step: { maneuver: { type: string; modifier: string | undefined; }; name: string; distance: number; duration: number; }) => ({
          text: step.maneuver.type === 'arrive' ? 'Anda telah sampai di tujuan' :
            formatInstruction(step.maneuver.type, step.maneuver.modifier, step.name),
          distance: step.distance / 1000, // Convert to km
          duration: step.duration / 60 // Convert to minutes
        }));

        setRoute({
          coordinates: route.geometry.coordinates,
          distance: route.distance / 1000,
          duration: route.duration / 60,
          instructions: instructions
        });
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  const formatInstruction = (type: string, modifier: string | undefined, streetName: string): string => {
    const name = streetName ? ` ke ${streetName}` : '';

    switch (type) {
      case 'turn':
        switch (modifier) {
          case 'left': return `Belok kiri${name}`;
          case 'right': return `Belok kanan${name}`;
          case 'slight left': return `Belok sedikit ke kiri${name}`;
          case 'slight right': return `Belok sedikit ke kanan${name}`;
          case 'sharp left': return `Belok tajam ke kiri${name}`;
          case 'sharp right': return `Belok tajam ke kanan${name}`;
          default: return `Belok${name}`;
        }
      case 'new name': return `Lanjutkan${name}`;
      case 'depart': return `Mulai perjalanan${name}`;
      case 'arrive': return 'Anda telah sampai di tujuan';
      case 'roundabout': return `Masuk bundaran${name}`;
      case 'merge': return `Bergabung${name}`;
      case 'continue': return `Terus${name}`;
      default: return `Lanjutkan perjalanan${name}`;
    }
  };

  const handleGudangClick = (gudang: GudangData) => {
    setSelectedGudang(gudang);
    if (currentLocation) {
      fetchRoute(currentLocation, [gudang.lokasi[1], gudang.lokasi[0]]);
      setIsRouteModalOpen(true);
    }
  };

  // Get distance and direction info for selected warehouse
  const getWarehouseInfo = () => {
    if (!currentLocation || !selectedGudang) return null;

    const { distance, direction } = calculateDistanceAndBearing(
      currentLocation,
      [selectedGudang.lokasi[1], selectedGudang.lokasi[0]]
    );

    return { distance, direction };
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lahanResponse, gudangResponse, mitraResponse] = await Promise.all([
          axios.get<LahanData[]>('http://localhost:8000/api/lahan'),
          axios.get<GudangData[]>('http://localhost:8000/api/gudang'),
          axios.get<MitraData[]>('http://localhost:8000/api/mitra'),
        ]);

        const processedLahanData: FeatureCollection = {
          type: 'FeatureCollection',
          features: lahanResponse.data.map((lahan) => ({
            type: 'Feature',
            properties: {
              name: lahan.nama,
              id: lahan.id,
              luas: calculateArea(lahan.koordinat),
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
        setMitraData(mitraResponse.data);
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

  const highlightSearchText = (text: string) => {
    if (!filters.search) return text;

    const searchRegex = new RegExp(`(${filters.search})`, 'gi');
    return text.replace(searchRegex, '<mark style="background-color: #FFEB3B; padding: 0 2px; border-radius: 2px">$1</mark>');
  };

  const getPopupContent = (feature: Feature) => {
    const { name, luas } = feature.properties as any;
    return `
      <div class="p-2">
        <h3 class="font-bold text-lg mb-2">${highlightSearchText(name)}</h3>
        <p><strong>Luas:</strong> ${luas} hektar</p>
      </div>
    `;
  };

  const FilterControls = () => {

    const handleAreaChange = useCallback((value: string) => {
      setFilters(prev => ({ ...prev, area: value }));
    }, []);

    return (
      <div className="absolute top-4 right-4 z-[1000] bg-white  rounded-lg shadow-lg space-y-4 max-w-xs">

        <Select
          value={filters.area}
          onValueChange={handleAreaChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih ukuran lahan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ukuran</SelectItem>
            <SelectItem value="small">Kecil (&lt; 10 ha)</SelectItem>
            <SelectItem value="medium">Sedang (10-20 ha)</SelectItem>
            <SelectItem value="large">Besar (&gt; 20 ha)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-16 space-y-12">
        <div data-aos="fade-up" className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-4xl font-bold text-gray-900">Persebaran Kami</h2>
          </div>
          <p className="text-lg text-gray-700">
            Persebaran lahan, mitra, dan gudang Setara Commodity
          </p>
        </div>

        <div className="w-[90vw] h-[70vh] shadow-2xl rounded-lg border border-gray-200 overflow-hidden relative z-[1]">
          <div className="h-full">
            <FilterControls />
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
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              />

              <CurrentLocationMarker onLocationUpdate={setCurrentLocation} />

              {filteredLahanData && (
                <FeatureGroup>
                  <GeoJSON
                    data={filteredLahanData}
                    style={lahanStyle}
                    onEachFeature={(feature, layer) => {
                      layer.bindPopup(getPopupContent(feature));
                    }}
                  />

                  {filteredLahanData.features.map((feature, index) => (
                    <ZoomToFeature key={`label-${index}`} feature={feature} />
                  ))}
                </FeatureGroup>
              )}

              {lahanData && (
                <FeatureGroup>
                  <GeoJSON
                    data={lahanData}
                    style={lahanStyle}
                    onEachFeature={(feature, layer) => {
                      layer.bindPopup(getPopupContent(feature));
                    }}
                  />

                  {lahanData.features.map((feature, index) => (
                    <ZoomToFeature key={`label-${index}`} feature={feature} />
                  ))}
                </FeatureGroup>
              )}

              {gudangData.map((gudang) => (
                <Marker
                  key={gudang.id}
                  position={[gudang.lokasi[1], gudang.lokasi[0]]}
                  eventHandlers={{
                    click: () => handleGudangClick(gudang)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{gudang.nama}</h3>
                      {currentLocation && (
                        <Button
                          className="mt-2"
                          onClick={() => handleGudangClick(gudang)}
                        >
                          Lihat Rute
                        </Button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}4

              {mitraData.map((mitra) => (
                <Marker
                  key={`mitra-${mitra.id}`}
                  position={[mitra.lokasi[1], mitra.lokasi[0]]}
                  icon={mitraIcon}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-bold">{mitra.nama}</h3>
                      <p className="text-sm text-gray-600">Mitra Setara</p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {route && (
                <Polyline
                  positions={route.coordinates.map(coord => [coord[1], coord[0]])}
                  color="blue"
                  weight={3}
                />
              )}
            </MapContainer>
          </div>
        </div>
      </div>
      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        route={route}
        selectedGudang={selectedGudang}
        warehouseInfo={getWarehouseInfo()}
      />
    </section>
  );
};

export default Map;