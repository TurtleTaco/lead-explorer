"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface EmployeeDistributionProps {
	data: { range: string; count: number }[];
}

interface IndustryDistributionProps {
	data: { industry: string; count: number }[];
}

const COLORS = [
	"#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
	"#06b6d4", "#6366f1", "#f43f5e", "#84cc16", "#a855f7",
	"#14b8a6", "#f97316", "#eab308", "#22c55e", "#ef4444",
	"#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899", "#3b82f6"
];

export function EmployeeDistributionChart({ data }: EmployeeDistributionProps) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Company Size Distribution</CardTitle>
					<CardDescription>Number of jobs by company employee count</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[300px] flex items-center justify-center text-muted-foreground">
						No data available
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>Company Size Distribution</CardTitle>
				<CardDescription>Number of jobs by company employee count</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={data}>
						<CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
						<XAxis 
							dataKey="range" 
							className="text-xs"
							tick={{ fill: 'hsl(var(--foreground))' }}
						/>
						<YAxis 
							className="text-xs"
							tick={{ fill: 'hsl(var(--foreground))' }}
						/>
						<Tooltip 
							contentStyle={{
								backgroundColor: 'hsl(var(--popover))',
								border: '1px solid hsl(var(--border))',
								borderRadius: '6px',
								color: 'hsl(var(--popover-foreground))'
							}}
						/>
						<Bar 
							dataKey="count" 
							fill="#3b82f6"
							radius={[4, 4, 0, 0]}
						/>
					</BarChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

export function IndustryDistributionChart({ data }: IndustryDistributionProps) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Industry Distribution</CardTitle>
					<CardDescription>Top industries across all jobs</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="h-[400px] flex items-center justify-center text-muted-foreground">
						No data available
					</div>
				</CardContent>
			</Card>
		);
	}

	// Take top 10 for better visualization
	const topData = data.slice(0, 10);

	// Custom label renderer - only show for segments > 5%
	const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, industry }: any) => {
		// Only show label if percentage is greater than 5%
		if (percent < 0.05) {
			return null;
		}

		const RADIAN = Math.PI / 180;
		const radius = outerRadius + 25;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		// Truncate long industry names
		const displayName = industry.length > 25 ? industry.substring(0, 25) + '...' : industry;

		return (
			<text
				x={x}
				y={y}
				fill="hsl(var(--foreground))"
				textAnchor={x > cx ? 'start' : 'end'}
				dominantBaseline="central"
				className="text-xs font-medium"
			>
				{`${displayName} (${(percent * 100).toFixed(1)}%)`}
			</text>
		);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Industry Distribution</CardTitle>
				<CardDescription>Top {topData.length} industries across all jobs (labels shown for segments &gt; 5%)</CardDescription>
			</CardHeader>
			<CardContent>
				<ResponsiveContainer width="100%" height={500}>
					<PieChart>
						<Pie
							data={topData}
							dataKey="count"
							nameKey="industry"
							cx="50%"
							cy="50%"
							outerRadius={140}
							label={renderLabel}
							labelLine={(props: any) => {
								// Only show label line if percentage is > 5%
								const { percent } = props;
								if (percent < 0.05) return null;
								return <line {...props} stroke="hsl(var(--muted-foreground))" />;
							}}
						>
							{topData.map((entry, index) => (
								<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
							))}
						</Pie>
						<Tooltip 
							contentStyle={{
								backgroundColor: 'hsl(var(--popover))',
								border: '1px solid hsl(var(--border))',
								borderRadius: '6px',
								color: 'hsl(var(--popover-foreground))'
							}}
							formatter={(value: number, name: string) => [
								`${value} jobs`,
								name
							]}
						/>
					</PieChart>
				</ResponsiveContainer>
			</CardContent>
		</Card>
	);
}

interface TopLocationsListProps {
	data: { location: string; count: number }[];
	limit?: number;
}

export function TopLocationsList({ data, limit = 10 }: TopLocationsListProps) {
	if (!data || data.length === 0) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Top Locations</CardTitle>
					<CardDescription>Most common job locations</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center h-[200px] text-muted-foreground">
						No data available
					</div>
				</CardContent>
			</Card>
		);
	}

	const topLocations = data.slice(0, limit);
	const total = data.reduce((sum, item) => sum + item.count, 0);

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Locations</CardTitle>
				<CardDescription>Most common job locations</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-3">
					{topLocations.map((location, index) => {
						const percentage = ((location.count / total) * 100).toFixed(1);
						return (
							<div key={index} className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span className="font-medium">{location.location}</span>
									<span className="text-muted-foreground">
										{location.count} ({percentage}%)
									</span>
								</div>
								<div className="w-full bg-muted rounded-full h-2">
									<div
										className="bg-primary rounded-full h-2 transition-all"
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}

