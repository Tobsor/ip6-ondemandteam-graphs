import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  CartesianGrid,
  Legend,
  ReferenceLine,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
} from "recharts";

const OFFSET = 5;

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
  const [corPerPerson, setCorPerPerson] = useState<any[]>([]);

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

  useEffect(() => {
    fetch("/data/h4correlationsperperson.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, delimiter: ";" });
        setCorPerPerson(parsed.data.filter((row) => !!row.Name));
      });
  }, []);

  const min = data.reduce((min, d) => Math.min(min, d.Score), Infinity);
  const max = data.reduce((max, d) => Math.max(max, d.Score), -Infinity);

  return (
    <div>
      <h2>Correlation of Team Ratings</h2>
      {corPerPerson.map((person) => (
        <div key={person.Name} style={{ marginBottom: "5px" }}>
          Correlation with {person.Name}:{" "}
          {parseFloat(person.Correlation).toFixed(2) * 100}%
        </div>
      ))}
      <ScatterChart width={600} height={400}>
        <CartesianGrid />
        <XAxis
          type="number"
          dataKey="Score"
          domain={[1.5, 1.95]}
          name="Computed Score"
        />
        <YAxis
          ticks={[-1, 0, 1]}
          tickFormatter={(value) => {
            if (value === -1) return "Schlecht";
            if (value === 0) return "Mittel";
            if (value === 1) return "Gut";
            return "";
          }}
          type="number"
          dataKey="Rating"
          name="Experts Ratings"
          domain={[-1.2, 1.2]}
        />
        <ReferenceLine
          segment={[
            { x: min, y: -1 },
            { x: max, y: 1 },
          ]}
          stroke="#888"
          strokeDasharray="5 5"
        />
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
