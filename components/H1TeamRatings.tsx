import React, { useEffect, useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts";
import Papa from "papaparse";

export const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ff7300",
  "#b8860b",
  "#0088FE",
  "#FFBB28",
  "#00C49F",
  "#FF8042",
];

export const NAMES = [
  { name: "Joelle", color: COLORS[0] },
  { name: "Sandra", color: COLORS[1] },
  { name: "Kelvin", color: COLORS[2] },
  { name: "Stefan", color: COLORS[3] },
  { name: "Daniel", color: COLORS[4] },
  { name: "Manuel", color: COLORS[5] },
];

// Offset amount in px (tweak as needed)
const OFFSET = 10;

const ticks = ["schlecht", "mittel", "gut"];

function addGlobalOffsets(rows: any[]): any[] {
  const clusters: Record<string, any[]> = {};

  // Group by "spot" (team-rating)
  rows.forEach((d) => {
    const key = `${d.team}-${d.rating}`;
    (clusters[key] ??= []).push(d);
  });

  // Distribute each cluster around a circle (or keep center if only 1)
  Object.values(clusters).forEach((arr) => {
    const n = arr.length;
    if (n === 1) {
      arr[0].cxOffset = 0;
      arr[0].cyOffset = 0;
      return;
    }
    arr.forEach((d, i) => {
      const angle = (2 * Math.PI * i) / n;
      d.cxOffset = Math.cos(angle) * OFFSET;
      d.cyOffset = Math.sin(angle) * OFFSET;
    });
  });

  return rows;
}

const H1TeamRatings: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/h1blindrating.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        // Transform the data so each rating is a separate entry
        const transformedData: any[] = [];
        (parsed.data as any[]).forEach((row, i) => {
          const name = row.Name;
          Object.keys(row).forEach((key) => {
            if (key !== "Name" && row[key]) {
              const rating = ticks.findIndex(
                (tick) => tick === row[key].trim().toLowerCase()
              );
              transformedData.push({
                Name: name,
                team: key,
                rating,
              });
            }
          });
        });
        setData(addGlobalOffsets(transformedData));
      });
  }, []);

  return (
    <ResponsiveContainer width="50%" height={300}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="category"
          dataKey="team"
          name="Team"
          interval={0} // Always show all ticks
          allowDuplicatedCategory={false}
          domain={[-0.3, 2.3]} // Add offset so points are not on the axis
        />
        <YAxis
          type="number"
          dataKey="rating"
          name="Rating"
          ticks={[0, 1, 2]}
          interval={0} // Always show all ticks
          domain={[-0.3, 2.3]} // Add offset so points are not on the axis
          tickFormatter={(value) => {
            if (value === 0) return "Schlecht";
            if (value === 1) return "Mittel";
            if (value === 2) return "Gut";
            return value;
          }}
        />
        <Legend />
        {NAMES.map((person) => (
          <Scatter
            key={person.name}
            name={person.name}
            data={data.filter((d) => d.Name === person.name)}
            fill={person.color}
            shape={(props: any) => {
              const {
                cx,
                cy,
                cxOffset = 0,
                cyOffset = 0,
                fill,
                ...rest
              } = props;

              return (
                <circle
                  cx={cx + cxOffset}
                  cy={cy + cyOffset}
                  r={5}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={1}
                  {...rest}
                />
              );
            }}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
};

export default H1TeamRatings;
