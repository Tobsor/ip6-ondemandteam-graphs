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

const renderScatter = (data: Grouped[], title: string, avg: Grouped) => {
  const absoluteAvg =
    avg.data.reduce((total, m) => total + m.diff, 0) / avg.data.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <h2 style={{marginLeft: "70px"}}>{title}</h2>
      {avg.data.map((m) => (
        <span key={m.metric}>
          {m.metric} dif avg.: {m.diff.toFixed(4)}{" "}
        </span>
      ))}
      <span>Absolute avg.: {absoluteAvg.toFixed(4)} </span>
      <ScatterChart
        width={600}
        height={400}
        margin={{ right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid />
        <XAxis
          type="category"
          dataKey="metric"
          name="Metric"
          allowDuplicatedCategory={false}
          label={{
              value: 'Metrik',
              position: "bottom",
              offset: 0
            }}
        />
        <YAxis
          type="number"
          dataKey="diff"
          name="Difference"
          domain={[-0.2, 0.2]}
          label={{
              angle: -90,
              value: 'Differenz-Metriken im Durchschnitt',
              position: "left",
              style: { textAnchor: 'middle' }, // centers the label
              offset: 0
            }}
        />
        <Legend wrapperStyle={{bottom: 0}}  />
        {[...data, avg].map((datapoint) => (
          <Scatter
            key={datapoint.name}
            name={datapoint.name}
            data={datapoint.data}
            fill={datapoint.color}
            line={datapoint.name === "Durchschnitt"}
          />
        ))}
      </ScatterChart>
    </div>
  );
};

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
        ? Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            (values.length - 1)
          )
        : 0;

    return { name: "Durchschnitt", metric, diff: mean, variance };
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
        ? Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
            (values.length - 1)
          )
        : 0;

    return { name: "Durchschnitt", metric, variance, diff: mean };
  });

  const varAvgUncalibrated =
    metricVariances.map((m) => m.variance).reduce((a, b) => a + b, 0) /
    metricVariances.length;

  const varAvgCalibrated =
    metricVariances2.map((m) => m.variance).reduce((a, b) => a + b, 0) /
    metricVariances2.length;

  const avg = {
    name: "Durchschnitt",
    data: metricVariances,
    variance: 0,
    color: "#c0392b",
  };

  const avg2 = {
    name: "Durchschnitt",
    data: metricVariances2,
    variance: 0,
    color: "#c0392b",
  };

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
        <span>
          Std. Abweichung mit Vergleich zum Standard Fall: {varAvgUncalibrated.toFixed(4)}
        </span>
        <span>
          Std. Abweichung mit Vergleich zum Kalbrierten Fall: {varAvgCalibrated.toFixed(4)} (
          {((varAvgCalibrated / varAvgUncalibrated) * 100 - 100 || 0).toFixed(
            0
          )}
          %)
        </span>
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
            label={{
              value: 'Metrik',
              position: "bottom",
              offset: 0
            }}
          />
          <YAxis type="number" dataKey="variance" name="Variance" label={{
              angle: -90,
              value: 'Std. Abweichung: Score',
              position: "left",
              style: { textAnchor: 'middle' }, // centers the label
              offset: 0
            }} />
          <Legend wrapperStyle={{bottom: 0}} />
          <Scatter
            line
            name="Standard Vergleich"
            data={metricVariances}
            fill="#8884d8"
            shape="circle"
          />
          <Scatter
            line
            name="Kalibrierter Vergleich"
            data={metricVariances2}
            fill="#82ca9d"
            shape="circle"
          />
        </ScatterChart>
      </div>
      {renderScatter(data, "Standard Vergleich: Differenz-Metriken", avg)}
      {renderScatter(data2, "Parameterisierter Vergleich: Differenz-Metriken", avg2)}
    </div>
  );
};

export default H2GeneralDif;
