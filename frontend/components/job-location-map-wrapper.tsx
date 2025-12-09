"use client";

import dynamic from "next/dynamic";

// Dynamically import the map component with SSR disabled
const JobLocationMap = dynamic(
	() => import("./job-location-map").then((mod) => ({ default: mod.JobLocationMap })),
	{
		ssr: false,
		loading: () => (
			<div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-lg">
				<div className="text-center space-y-2">
					<div className="text-lg font-medium">Loading map...</div>
					<div className="text-sm text-muted-foreground">
						Preparing visualization
					</div>
				</div>
			</div>
		)
	}
);

interface LocationData {
	location: string;
	count: number;
	lat?: number;
	lng?: number;
}

interface JobLocationMapWrapperProps {
	locations: LocationData[];
}

export function JobLocationMapWrapper({ locations }: JobLocationMapWrapperProps) {
	return <JobLocationMap locations={locations} />;
}

