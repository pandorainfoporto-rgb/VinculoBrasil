/**
 * PropertyMap Component
 *
 * Interactive map component using Leaflet/OpenStreetMap
 * for displaying property locations on landing page and app.
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Building2, Bed, Bath, Square, Car, Crown, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icon for properties
const createPropertyIcon = (isPromoted: boolean = false, isSelected: boolean = false) => {
  const color = isSelected ? '#2563eb' : isPromoted ? '#f59e0b' : '#22c55e';

  return L.divIcon({
    className: 'custom-property-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg style="transform: rotate(45deg);" width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export interface MapProperty {
  id: string;
  title: string;
  description?: string | null;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  parkingSpaces: number | null;
  rentValue: number;
  condoFee: number;
  isPromoted: boolean;
  images?: Array<{ url: string }>;
}

interface PropertyMapProps {
  properties: MapProperty[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onPropertySelect?: (property: MapProperty) => void;
  onPropertyInterest?: (property: MapProperty) => void;
  selectedPropertyId?: string | null;
  className?: string;
}

// Component to update map view when center/zoom changes
function MapController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [map, center.lat, center.lng, zoom]);

  return null;
}

export function PropertyMap({
  properties,
  center = { lat: -15.7801, lng: -47.9292 }, // Centro do Brasil
  zoom = 10,
  height = '400px',
  onPropertySelect,
  onPropertyInterest,
  selectedPropertyId,
  className = '',
}: PropertyMapProps) {
  const [mapReady, setMapReady] = useState(false);

  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    p => p.latitude != null && p.longitude != null
  );

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-200 shadow-lg ${className}`} style={{ height }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        scrollWheelZoom={true}
        whenReady={() => setMapReady(true)}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Map Controller for dynamic updates */}
        <MapController center={center} zoom={zoom} />

        {/* Property Markers */}
        {validProperties.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            icon={createPropertyIcon(property.isPromoted, selectedPropertyId === property.id)}
            eventHandlers={{
              click: () => onPropertySelect?.(property),
            }}
          >
            <Popup maxWidth={300} minWidth={250}>
              <div className="p-2">
                {/* Property Image or Placeholder */}
                <div className="relative h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 overflow-hidden">
                  {property.images?.[0]?.url ? (
                    <img
                      src={property.images[0].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                  {property.isPromoted && (
                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="h-3 w-3" />
                      Destaque
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                  {property.title || `${property.street}, ${property.number}`}
                </h3>
                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {property.neighborhood}, {property.city}
                </p>

                {/* Features */}
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  {property.bedrooms != null && (
                    <span className="flex items-center gap-0.5">
                      <Bed className="h-3 w-3" /> {property.bedrooms}
                    </span>
                  )}
                  {property.bathrooms != null && (
                    <span className="flex items-center gap-0.5">
                      <Bath className="h-3 w-3" /> {property.bathrooms}
                    </span>
                  )}
                  {property.area != null && (
                    <span className="flex items-center gap-0.5">
                      <Square className="h-3 w-3" /> {property.area}m²
                    </span>
                  )}
                  {(property.parkingSpaces ?? 0) > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Car className="h-3 w-3" /> {property.parkingSpaces}
                    </span>
                  )}
                </div>

                {/* Price and CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-lg font-bold text-blue-600">
                      R$ {property.rentValue.toLocaleString('pt-BR')}
                    </p>
                    {property.condoFee > 0 && (
                      <p className="text-xs text-gray-500">
                        + R$ {property.condoFee.toLocaleString('pt-BR')} cond.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onPropertyInterest?.(property)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors"
                  >
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Carregando mapa...</p>
          </div>
        </div>
      )}

      {/* No Properties Message */}
      {mapReady && validProperties.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 text-center shadow-lg">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">Nenhum imóvel com localização</p>
            <p className="text-sm text-gray-500">Selecione outra região</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertyMap;
