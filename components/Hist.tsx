import { create } from 'domain';
import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import Papa from "papaparse";
import { COLORS, NAMES } from './H1TeamRatings';

const createHistogramData = (rawData, binCount = 10) => {
  if (!rawData || rawData.length === 0) return [];

  const min = Math.min(...rawData);
  const max = Math.max(...rawData);

  const binSize = (max - min) / binCount;

  const bins = [...(new Array(binCount))].map((_, i) => ({
    binStart: min + i * binSize,
    binEnd: min + (i + 1) * binSize,
    count: 0,
  }));

  rawData.forEach((value) => {
    const index = Math.min(
      Math.floor((value - min) / binSize),
      binCount - 1 // Make sure max value is included
    );
    bins[index].count += 1;
  });

  return bins.map((bin) => ({
    bin: bin.binStart,
    start: Number(bin.binStart.toFixed(2)),
    end: Number(bin.binEnd.toFixed(2)),
    count: bin.count,
  }));
};

const scores = [1.17, 1.46, 1.53, 1.54, 1.38, 1.01];

const Hist = () => {
    const [data, setData] = useState([]);
    const personData = NAMES.map((el, i) => ({
        ...el,
        score: scores[i]
    }))
    
    const histData = createHistogramData(data, 10);
    const allXLabels = histData.map(el => el.start);
    let min = 0;
    let max = 0;
    if(histData.length > 0) {
        allXLabels.push(histData[histData.length - 1].end);
        min = histData[0].start - 0.04
        max = histData[histData.length - 1].end
    };


    useEffect(() => {
        fetch("/data/data_hist.csv")
          .then((response) => response.text())
          .then((csvText) => {
            const parsed = Papa.parse(csvText, { header: false });
            setData(parsed.data.flatMap(el => el).map(el => Number(el)).filter(el => el !== 0));
          });
      }, []);
      
      return (
          <ResponsiveContainer width="50%" height={300}>
      <BarChart data={histData} fill="#42e3ffc5" barCategoryGap={1}  >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bin" type="number" domain={[min, max]} ticks={allXLabels} tick={({ x, y, payload }) => (
            <text x={x - 10} y={y + 10} textAnchor="end" fontSize={12}>
            {payload.value}
            </text>
        )}/>
        {
            personData.map(per => 
                <ReferenceLine x={per.score} stroke={per.color} />      
            )
        }
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Hist;
