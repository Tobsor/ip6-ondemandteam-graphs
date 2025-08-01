import React, { useEffect, useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import Papa from "papaparse";
import { NAMES } from "./H1TeamRatings";

interface DataPoint {
  name: string;
  metric: string;
  diff: number;
}

interface Grouped {
  name: string;
  data: DataPoint[];
  variance: number;
  color: string;
}

const difMetrics = ["BRI", "FDI", "TRI", "Total"];

function groupByNameWithVariance(data: DataPoint[]): Grouped[] {
  const groups = Array.from(new Set(data.map((d) => d.name))).map((name) => {
    const groupData = data.filter((d) => d.name === name);
    const diffs = groupData.filter((d) => difMetrics.includes(d.metric));
    const variance = groupData
      .filter((d) => !difMetrics.includes(d.metric))
      .map((d) => d.diff);

    const average =
      variance.length > 0
        ? variance.reduce((sum, val) => sum + val, 0) / variance.length
        : 0;
    return {
      name,
      data: diffs,
      variance: average,
      color: NAMES.find((n) => n.name === name)?.color || "#8884d8",
    };
  });

  return groups.sort(
    (a, b) =>
      NAMES.findIndex((n) => n.name === a.name) -
      NAMES.findIndex((n) => n.name === b.name)
  );
}

const renderScatter = (data: Grouped[], title: string) => (
  <div>
    <h2>{title}</h2>
    <ScatterChart
      width={600}
      height={400}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
    >
      <CartesianGrid />
      <XAxis
        type="category"
        dataKey="metric"
        name="Metric"
        tickFormatter={(v) => `Metric ${v}`}
        allowDuplicatedCategory={false}
      />
      <YAxis
        type="number"
        dataKey="diff"
        name="Difference"
        domain={[-0.2, 0.2]}
      />
      <Tooltip
        cursor={{ strokeDasharray: "3 3" }}
        formatter={(value: any, name: string, props: any) => [
          `${value}%`,
          name === "metric" ? "Metric" : "Difference",
        ]}
        labelFormatter={(label) => `Metric ${label}`}
      />
      <Legend />
      {data.map((datapoint) => (
        <Scatter
          key={datapoint.name}
          name={datapoint.name}
          data={datapoint.data}
          fill={datapoint.color}
        />
      ))}
    </ScatterChart>
  </div>
);

const H2GeneralDif: React.FC = () => {
  const [data, setData] = useState<Grouped[]>([]);
  const [data2, setData2] = useState<Grouped[]>([]);

  useEffect(() => {
    fetch("/data/h2uncalibrated.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        // Transform the data so each rating is a separate entry
        const transformedData: any[] = [];
        (parsed.data as any[]).forEach((row, i) => {
          const name = row.Name;
          Object.keys(row).forEach((key) => {
            if (key !== "Name" && row[key]) {
              transformedData.push({
                name,
                metric: key,
                diff: Number(row[key]),
              });
            }
          });
        });
        setData(groupByNameWithVariance(transformedData));
      });
  }, []);

  useEffect(() => {
    fetch("/data/h2calibrated.csv")
      .then((response) => response.text())
      .then((csvText) => {
        const parsed = Papa.parse(csvText, { header: true });
        // Transform the data so each rating is a separate entry
        const transformedData: any[] = [];
        (parsed.data as any[]).forEach((row, i) => {
          const name = row.Name;
          Object.keys(row).forEach((key) => {
            if (key !== "Name" && row[key]) {
              transformedData.push({
                name,
                metric: key,
                diff: Number(row[key]),
              });
            }
          });
        });
        setData2(groupByNameWithVariance(transformedData));
      });
  }, []);

  const metricVariances = difMetrics.map((metric) => {
    const values = data
      .flatMap((group) => group.data)
      .filter((d) => d.metric === metric)
      .map((d) => d.diff);

    const mean =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;

    const variance =
      values.length > 1
        ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          (values.length - 1)
        : 0;

    return { metric, variance };
  });

  const metricVariances2 = difMetrics.map((metric) => {
    const values = data2
      .flatMap((group) => group.data)
      .filter((d) => d.metric === metric)
      .map((d) => d.diff);

    const mean =
      values.length > 0
        ? values.reduce((sum, val) => sum + val, 0) / values.length
        : 0;

    const variance =
      values.length > 1
        ? values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
          (values.length - 1)
        : 0;

    return { metric, variance };
  });

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
      <ScatterChart
        width={400}
        height={300}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid />
        <XAxis
          type="category"
          dataKey="metric"
          name="Metric"
          allowDuplicatedCategory={false}
        />
        <YAxis type="number" dataKey="variance" name="Variance" />
        <Tooltip
          formatter={(value: any, name: string) => [
            value.toFixed(2),
            name.charAt(0).toUpperCase() + name.slice(1),
          ]}
          labelFormatter={(label) => `Metric ${label}`}
        />
        <Legend />
        <Scatter
          line
          name="Uncalibrated Variance"
          data={metricVariances}
          fill="#8884d8"
          shape="circle"
        />
        <Scatter
          line
          name="Calibrated Variance"
          data={metricVariances2}
          fill="#82ca9d"
          shape="circle"
        />
      </ScatterChart>
      {renderScatter(data, "Uncalibrated")}
      {renderScatter(data2, "Calibrated")}
    </div>
  );
};

export default H2GeneralDif;
