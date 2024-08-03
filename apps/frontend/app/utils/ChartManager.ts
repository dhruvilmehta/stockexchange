// import {
//   ColorType,
//   createChart as createLightWeightChart,
//   CrosshairMode,
//   ISeriesApi,
//   UTCTimestamp,
// } from "lightweight-charts";

// export class ChartManager {
//   public candleSeries: ISeriesApi<"Candlestick">;
//   private lastUpdateTime: number = 0;
//   private chart: any;
//   private currentBar: {
//     open: number | null;
//     high: number | null;
//     low: number | null;
//     close: number | null;
//   } = {
//       open: null,
//       high: null,
//       low: null,
//       close: null,
//     };

//   constructor(
//     ref: any,
//     initialData: any[],
//     layout: { background: string; color: string }
//   ) {
//     const chart = createLightWeightChart(ref, {
//       autoSize: true,
//       overlayPriceScales: {
//         ticksVisible: true,
//         borderVisible: true,
//       },
//       crosshair: {
//         mode: CrosshairMode.Normal,
//       },
//       rightPriceScale: {
//         visible: true,
//         ticksVisible: true,
//         entireTextOnly: true,
//       },
//       grid: {
//         horzLines: {
//           visible: false,
//         },
//         vertLines: {
//           visible: false,
//         },
//       },
//       layout: {
//         background: {
//           type: ColorType.Solid,
//           color: layout.background,
//         },
//         textColor: "white",
//       },
//     });
//     this.chart = chart;
//     this.candleSeries = chart.addCandlestickSeries();

//     this.candleSeries.setData(
//       initialData.map((data) => ({
//         ...data,
//         time: (data.timestamp / 1000) as UTCTimestamp,
//       }))
//     );
//   }

//   public update(updatedPrice: any) {
//     const viewportState = this.saveViewportState(); // Save viewport state before update

//     if (!this.lastUpdateTime) {
//       this.lastUpdateTime = new Date().getTime();
//     }

//     this.candleSeries.update({
//       time: (this.lastUpdateTime / 1000) as UTCTimestamp,
//       close: updatedPrice.close,
//       low: updatedPrice.low,
//       high: updatedPrice.high,
//       open: updatedPrice.open,
//     });

//     if (updatedPrice.newCandleInitiated) {
//       this.lastUpdateTime = updatedPrice.time;
//     }

//     this.restoreViewportState(viewportState); // Restore viewport state after update
//   }

//   public destroy() {
//     this.chart.remove();
//   }

//   public saveViewportState() {
//     const { left, right } = this.chart.timeScale().getVisibleRange();
//     return { left, right };
//   }

//   public restoreViewportState(viewportState: { left: number; right: number }) {
//     this.chart.timeScale().setVisibleRange(viewportState);
//   }
// }

import {
  ColorType,
  createChart as createLightWeightChart,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  Time,
  UTCTimestamp,
  Range
} from "lightweight-charts";
import { KLine } from "./types";

export class ChartManager {
  public candleSeries: ISeriesApi<"Candlestick">;
  private lastUpdateTime: number = 0;
  private chart: IChartApi;
  private currentBar: {
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
  } = {
      open: null,
      high: null,
      low: null,
      close: null,
    };

  constructor(
    ref: any,
    initialData: any[],
    layout: { background: string; color: string }
  ) {
    const chart = createLightWeightChart(ref, {
      autoSize: true,
      overlayPriceScales: {
        ticksVisible: true,
        borderVisible: true,
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        visible: true,
        ticksVisible: true,
        entireTextOnly: true,
      },
      grid: {
        horzLines: {
          visible: false,
        },
        vertLines: {
          visible: false,
        },
      },
      layout: {
        background: {
          type: ColorType.Solid,
          color: layout.background,
        },
        textColor: "white",
      },
      timeScale: {
        timeVisible: true,
        // secondsVisible: true,
        uniformDistribution: true,
        tickMarkFormatter: (time: number) => {
          const date = new Date(time * 1000); // Convert timestamp to milliseconds
          return `${date.getMonth()}/${date.getDate()}`; // Format to MM/DD
        },
      },
    });
    this.chart = chart;
    this.candleSeries = chart.addCandlestickSeries();

    this.candleSeries.setData(
      initialData.map((data) => ({
        ...data,
        time: (data.timestamp / 1000) as UTCTimestamp,
      }))
    );
    // this.setFullDateFormat(); // Apply full date format
  }

  // private setFullDateFormat() {
  //   this.chart.timeScale().applyOptions({
  //     timeVisible: true,
  //     secondsVisible: false, // Hide seconds
  //     uniformDistribution: true,
  //     ticksVisible: true,
  //   });
  //   this.chart.applyOptions()
  // }

  public update(klineData: KLine[]) {
    if (!this.lastUpdateTime) {
      this.lastUpdateTime = new Date().getTime();
    }
    console.log(this.lastUpdateTime / 1000, " last update time")

    const formattedData = klineData.map(data => ({
      // time: (this.lastUpdateTime / 1000) as UTCTimestamp, // Convert timestamp to seconds
      time: new Date(data.end).getTime()/1000 as UTCTimestamp,
      open: Number(data.open),
      high: Number(data.high),
      low: Number(data.low),
      close: Number(data.close),
    }));

    // Set the entire dataset on the series
    this.candleSeries.setData(formattedData);
  }

  public destroy() {
    this.chart.remove();
  }

  public saveViewportState() {
    const time = this.chart.timeScale().getVisibleRange();
    if (!time) return;
    return { left: time.from, right: time.to };
  }

  public restoreViewportState(viewportState: { left: Time; right: Time }) {
    const range: Range<Time> = {
      from: viewportState.left,
      to: viewportState.right
    };
    this.chart.timeScale().setVisibleRange(range);
  }
}
