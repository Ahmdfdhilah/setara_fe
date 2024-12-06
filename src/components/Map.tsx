import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngBounds } from 'leaflet';
import { Card } from './ui/card';
import { GeoJsonObject } from 'geojson';

// Data GeoJSON untuk beberapa lahan kebun (lebih kompleks)
const lahanGeoJson: GeoJsonObject = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "Kebun A", jumlahLahan: 25, mitraPetani: 60 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.4, -5.3],
            [105.45, -5.31],
            [105.46, -5.34],
            [105.42, -5.35],
            [105.4, -5.3]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kebun B", jumlahLahan: 40, mitraPetani: 80 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.5, -5.4],
            [105.55, -5.41],
            [105.58, -5.44],
            [105.52, -5.46],
            [105.5, -5.4]
          ]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Kebun C", jumlahLahan: 35, mitraPetani: 70 },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [105.6, -5.35],
            [105.62, -5.36],
            [105.65, -5.37],
            [105.63, -5.4],
            [105.6, -5.35]
          ]
        ]
      }
    }
  ]
} as GeoJsonObject;

const Map = () => {
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
        <Card className="w-[90vw] h-[70vh] shadow-2xl rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-full">
            <MapContainer
              center={[-5.35, 105.5]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
              bounds={new LatLngBounds([[-5.5, 105.3], [-5.2, 105.7]])}
              maxBounds={new LatLngBounds([[-5.5, 105.3], [-5.2, 105.7]])}
              minZoom={10}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
              />

              {/* Render GeoJSON Data */}
              <GeoJSON
                data={lahanGeoJson}
                onEachFeature={(feature, layer) => {
                  const { name, jumlahLahan, mitraPetani } = feature.properties as any;
                  layer.bindPopup(
                    `<strong>${name}</strong><br>Jumlah Lahan: ${jumlahLahan}<br>Mitra Petani: ${mitraPetani}`
                  );
                }}
              />
            </MapContainer>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Map;
