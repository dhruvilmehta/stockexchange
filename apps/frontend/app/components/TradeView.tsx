import React, { useEffect, useRef, useState } from 'react';
import { ChartManager } from '../utils/ChartManager';
import { getKlines } from '../utils/httpClient';
import { KLine } from '../utils/types';
import { UTCTimestamp } from 'lightweight-charts';

export function TradeView({ market }: { market: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager>(null);
  const [intervalTime, setIntervalTime] = useState<string>('1 minute');

  const intervalToMilliseconds = (interval: string): number => {
    const [value, unit] = interval.split(' ');
    switch (unit) {
      case 'minute':
        return parseInt(value) * 60 * 1000;
      case 'minutes':
        return parseInt(value) * 60 * 1000;
      case 'hour':
        return parseInt(value) * 60 * 60 * 1000;
      default:
        return 60 * 1000; // default to 1 minute
    }
  };

  const fetchData = async () => {
    let klineData: KLine[] = [];
    try {
      klineData = await getKlines(
        market,
        intervalTime,
        Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000),
        Math.floor(new Date().getTime() / 1000),
      );
    } catch (e) {}

    if (chartManagerRef.current) {
      const chartManager = chartManagerRef.current;
      // console.log("Chart updated")
      chartManager.update(klineData);
    } else {
      const chartManager = new ChartManager(
        chartRef.current,
        klineData
          .map((x) => ({
            close: parseFloat(x.close),
            high: parseFloat(x.high),
            low: parseFloat(x.low),
            open: parseFloat(x.open),
            timestamp: new Date(x.end),
          }))
          .sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)),
        {
          background: '#0e0f14',
          color: 'white',
        },
      );
      //@ts-ignore
      chartManagerRef.current = chartManager;
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    fetchData();
    const time = intervalToMilliseconds(intervalTime);
    intervalId = setInterval(fetchData, time);

    return () => clearInterval(intervalId);
  }, [market, intervalTime]);

  return (
    <>
      <div>
        <select
          value={intervalTime}
          onChange={(e) => setIntervalTime(e.target.value)}
          style={{
            backgroundColor: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '5px 10px',
            outline: 'none',
            appearance: 'none',
          }}
        >
          <option value="1 minute">1 Minute</option>
          <option value="5 minutes">5 Minutes</option>
          <option value="10 minutes">10 Minutes</option>
          <option value="15 minutes">15 Minutes</option>
          <option value="1 hour">1 Hour</option>
        </select>
      </div>
      <div
        ref={chartRef}
        style={{ height: '520px', width: '100%', marginTop: 4 }}
      ></div>
    </>
  );
}
