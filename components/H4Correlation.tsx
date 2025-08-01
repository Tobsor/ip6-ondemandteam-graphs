import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  CartesianGrid,
  Legend,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

const OFFSET = 10;

function addGlobalOffsets(rows: any[]): any[] {
  const clusters: Record<string, any[]> = {};

  rows.forEach((d) => {
    const key = `${d.Score}-${d.Rating}`;
    (clusters[key] ??= []).push(d);
  });

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

const H4Correlation = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/h4correlations.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, delimiter: ";" });
        const preprocessedData = parsed.data
          .filter((row) => !!row.Team)
          .map((row: any) => ({
            Team: Number(row.Team),
            Score: Number(row.Score),
            Rating: Number(row.Rating),
          }));

        setData(addGlobalOffsets(preprocessedData));
      });
  }, []);

  return (
    <div>
      <ScatterChart width={600} height={400}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="Score"
          domain={[1.4, 2]}
          name="Computed Score"
        />
        <YAxis type="number" dataKey="Rating" name="Experts Ratings" />
        <Legend />
        {[...new Array(4)].map((_val, idx) => (
          <Scatter
            key={idx}
            name={`Team ${idx + 1}`}
            data={data.filter((d) => d.Team === idx + 1)}
            fill={
              ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE"][idx % 5]
            }
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
    </div>
  );
};

export default H4Correlation;
