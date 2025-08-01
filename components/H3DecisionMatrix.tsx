import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import CustomLegend, { COLOR_MAP } from "./CustomLegend";

const H3DecisionMatrix = () => {
  const [data, setData] = useState<any[]>([]);
  const [metricsCoverage, setMetricsCoverage] = useState<any[]>([]);

  useEffect(() => {
    fetch("/data/h3decisionmatrix.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        console.log("Parsed Decision Matrix Data:", parsed.data);
        const transformedData: any[] = parsed.data.map((row: any) => {
          const metric = row.Metrik;
          const persons = Object.keys(row).filter(
            (key) => key !== "Metrik" && key !== "InAlg"
          );
          const totalWeight = persons.reduce(
            (sum, person) => sum + (parseFloat(row[person]) || 0),
            0
          );
          return {
            metric,
            totalWeight,
            inAlg: row.InAlg,
          };
        });

        setData(
          transformedData
            .filter((d) => d.metric !== "")
            .sort((a, b) => b.totalWeight - a.totalWeight)
        );
      });
  }, []);

  useEffect(() => {
    fetch("/data/h3metricscoverage.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true, delimiter: ";" });

        setMetricsCoverage(parsed.data);
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
      <ResponsiveContainer width="50%" height={400}>
        <BarChart data={data} layout="vertical" barSize={30}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="metric" type="category" width={200} interval={0} />
          <Bar dataKey="totalWeight" isAnimationActive={false}>
            {data.map((entry, index) => {
              const fill = COLOR_MAP[entry.inAlg] || "#95a5a6";
              return <Cell key={`cell-${index}`} fill={fill} />;
            })}
          </Bar>
          <Legend content={<CustomLegend />} />
        </BarChart>
      </ResponsiveContainer>
      <ResponsiveContainer width="50%" height={300}>
        <LineChart data={metricsCoverage}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Name" type="category" width={200} interval={0} />
          <YAxis
            type="number"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Line
            dataKey="Coverage"
            stroke="#3498db"
            dot={{ r: 5 }}
            isAnimationActive={false}
            label={({ value, x, y }) => (
              <text
                x={x}
                y={y - 10}
                fill="#3498db"
                fontSize={12}
                alignmentBaseline="middle"
              >
                {`${value}%`}
              </text>
            )}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default H3DecisionMatrix;
