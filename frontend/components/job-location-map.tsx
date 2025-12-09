"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LocationData {
	location: string;
	count: number;
	lat?: number;
	lng?: number;
}

interface JobLocationMapProps {
	locations: LocationData[];
}

// Component to fit bounds when data changes
function FitBounds({ locations }: { locations: LocationData[] }) {
	const map = useMap();

	useEffect(() => {
		if (locations.length > 0) {
			const validLocations = locations.filter(l => l.lat !== undefined && l.lng !== undefined);
			if (validLocations.length > 0) {
				const bounds = validLocations.map(l => [l.lat!, l.lng!] as [number, number]);
				map.fitBounds(bounds, { padding: [50, 50] });
			}
		}
	}, [locations, map]);

	return null;
}

export function JobLocationMap({ locations }: JobLocationMapProps) {
	const [geoLocations, setGeoLocations] = useState<LocationData[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function geocodeLocations() {
			setIsLoading(true);
			const locationsWithCoords: LocationData[] = [];
			
			// Process top 50 locations only to avoid rate limiting
			const topLocations = locations.slice(0, 50);
			
			for (const location of topLocations) {
				try {
					// Use Nominatim (OpenStreetMap) for geocoding
					const response = await fetch(
						`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.location)}&limit=1`,
						{
							headers: {
								'User-Agent': 'Lead Explorer Dashboard'
							}
						}
					);
					
					if (response.ok) {
						const data = await response.json();
						if (data && data.length > 0) {
							locationsWithCoords.push({
								...location,
								lat: parseFloat(data[0].lat),
								lng: parseFloat(data[0].lon),
							});
						}
					}
					
					// Rate limiting: wait 1 second between requests to respect Nominatim usage policy
					await new Promise(resolve => setTimeout(resolve, 1000));
				} catch (error) {
					console.error(`Failed to geocode ${location.location}:`, error);
				}
			}
			
			setGeoLocations(locationsWithCoords);
			setIsLoading(false);
		}

		if (locations.length > 0) {
			geocodeLocations();
		}
	}, [locations]);

	if (isLoading) {
		return (
			<div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-lg">
				<div className="text-center space-y-2">
					<div className="text-lg font-medium">Loading map...</div>
					<div className="text-sm text-muted-foreground">
						Geocoding locations (this may take a moment)
					</div>
				</div>
			</div>
		);
	}

	if (geoLocations.length === 0) {
		return (
			<div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-lg">
				<div className="text-center space-y-2">
					<div className="text-lg font-medium">No locations to display</div>
					<div className="text-sm text-muted-foreground">
						Could not geocode any job locations
					</div>
				</div>
			</div>
		);
	}

	// Calculate the center as average of all locations
	const centerLat = geoLocations.reduce((sum, loc) => sum + (loc.lat || 0), 0) / geoLocations.length;
	const centerLng = geoLocations.reduce((sum, loc) => sum + (loc.lng || 0), 0) / geoLocations.length;

	return (
		<div className="w-full h-[500px] rounded-lg overflow-hidden border">
			<MapContainer
				center={[centerLat, centerLng]}
				zoom={4}
				style={{ height: "100%", width: "100%" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<FitBounds locations={geoLocations} />
				{geoLocations.map((location, index) => (
					location.lat !== undefined && location.lng !== undefined && (
						<CircleMarker
							key={index}
							center={[location.lat, location.lng]}
							radius={Math.min(8 + Math.log(location.count) * 3, 20)}
							fillOpacity={0.6}
							color="#2563eb"
							fillColor="#3b82f6"
						>
							<Popup>
								<div className="font-medium">{location.location}</div>
								<div className="text-sm text-muted-foreground">
									{location.count} job{location.count !== 1 ? 's' : ''}
								</div>
							</Popup>
						</CircleMarker>
					)
				))}
			</MapContainer>
		</div>
	);
}

