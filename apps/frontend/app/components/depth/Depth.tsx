'use client';

import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import {
  getDepth,
  getKlines,
  getTicker,
  getTrades,
} from '../../utils/httpClient';
import { BidTable } from './BidTable';
import { AskTable } from './AskTable';
import { SignalingManager } from '../../utils/SignalingManager';
import { TradesTable } from '../TradesTable';

export type TradeType = {
  price: string;
  quantity: string;
};

export function Depth({
  market,
  price,
  setPrice,
}: {
  market: string;
  price: string;
  setPrice: Dispatch<SetStateAction<string>>;
}) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [selectedOption, setSelectedOption] = useState('Orderbook');
  const [trades, setTrades] = useState<TradeType[]>([]);
  // const [price, setPrice] = useState<string>();

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      'depth',
      (data: { bids: [string, string][]; asks: [string, string][] }) => {
        //     setBids((originalBids) => {
        //       const bidsAfterUpdate = [...(originalBids || [])];

        //       for (let i = 0; i < bidsAfterUpdate.length; i++) {
        //         for (let j = 0; j < data.bids.length; j++) {
        //           if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
        //             bidsAfterUpdate[i][1] = data.bids[j][1];
        //             if (Number(bidsAfterUpdate[i][1]) === 0) {
        //               bidsAfterUpdate.splice(i, 1);
        //               i--;
        //               break;
        //             }
        //           }
        //         }
        //       }

        //       for (let j = 0; j < data.bids.length; j++) {
        //         if (
        //           Number(data.bids[j][1]) !== 0 &&
        //           !bidsAfterUpdate.map((x) => x[0]).includes(data.bids[j][0])
        //         ) {
        //           bidsAfterUpdate.push(data.bids[j]);
        //         }
        //       }
        //       bidsAfterUpdate.sort((x, y) => Number(y[0]) - Number(x[0]));
        //       return bidsAfterUpdate;
        //     });

        //     setAsks((originalAsks) => {
        //       const asksAfterUpdate = [...(originalAsks || [])];
        //       for (let i = 0; i < asksAfterUpdate.length; i++) {
        //         for (let j = 0; j < data.asks.length; j++) {
        //           // if (Number(data.asks[j][1]) === 0)
        //           if (asksAfterUpdate[i][0] === data.asks[j][0]) {
        //             // setPrice(asksAfterUpdate[j][0]);
        //             asksAfterUpdate[i][1] = data.asks[j][1];
        //             if (Number(asksAfterUpdate[i][1]) === 0) {
        //               asksAfterUpdate.splice(i, 1);
        //               i--;
        //               break;
        //             }
        //           }
        //         }
        //       }

        //       for (let j = 0; j < data.asks.length; j++) {
        //         if (
        //           Number(data.asks[j][1]) !== 0 &&
        //           !asksAfterUpdate.map((x) => x[0]).includes(data.asks[j][0])
        //         ) {
        //           asksAfterUpdate.push(data.asks[j]);
        //         }
        //       }
        //       asksAfterUpdate.sort((x, y) => Number(y[0]) - Number(x[0]));
        //       return asksAfterUpdate;
        //     });
        //   },
        //   `DEPTH-${market}`,
        // );
        setBids((originalBids: [string, string][] = []) => {
          const bidsMap: Record<string, string> = {};

          // Convert originalBids array to a map for faster lookup and update
          originalBids.forEach(([price, quantity]) => {
            bidsMap[price] = quantity;
          });

          // Update or remove bids based on new data
          data.bids.forEach(([price, quantity]: [string, string]) => {
            if (Number(quantity) === 0) {
              delete bidsMap[price];
            } else {
              bidsMap[price] = quantity;
            }
          });

          // Convert map back to sorted array
          const bidsAfterUpdate: [string, string][] = Object.entries(bidsMap)
            .map(([price, quantity]): [string, string] => [price, quantity])
            .sort((a, b) => Number(b[0]) - Number(a[0]));

          return bidsAfterUpdate;
        });

        setAsks((originalAsks: [string, string][] = []) => {
          const asksMap: Record<string, string> = {};

          // Convert originalAsks array to a map for faster lookup and update
          originalAsks.forEach(([price, quantity]) => {
            asksMap[price] = quantity;
          });

          // Update or remove asks based on new data
          data.asks.forEach(([price, quantity]: [string, string]) => {
            if (Number(quantity) === 0) {
              delete asksMap[price];
            } else {
              asksMap[price] = quantity;
            }
          });

          // Convert map back to sorted array
          const asksAfterUpdate: [string, string][] = Object.entries(asksMap)
            .map(([price, quantity]): [string, string] => [price, quantity])
            .sort((a, b) => Number(b[0]) - Number(a[0]));

          return asksAfterUpdate;
        });
      },
      `DEPTH-${market}`,
    );

    SignalingManager.getInstance().registerCallback(
      'trade',
      (price: string, quantity: string) => {
        setPrice(price);
        setTrades((prev) => [{ price, quantity }, ...prev]);
      },
      `TRADE-${market}`,
    );

    SignalingManager.getInstance().sendMessage({
      method: 'SUBSCRIBE',
      params: [`depth@${market}`, `trade@${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.bids);
      setAsks(d.asks.reverse());
    });

    // getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => t[0] !== undefined && setPrice(t[0].price));

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: 'UNSUBSCRIBE',
        params: [`depth@${market}`, `trade@${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        'depth',
        `DEPTH-${market}`,
      );
    };
  }, []);

  return (
    <div>
      <div className="text-white-500 animate-pulse">
        Dummy trades are going on. You can place your buy/sell orders here
      </div>
      <div className="flex justify-between bg-gray-900">
        <div
          className={`flex flex-col flex-1 cursor-pointer justify-center border-b-2 p-4 ${
            selectedOption === 'Orderbook'
              ? 'border-b-gray-500 bg-gray-900'
              : 'border-b-gray-900 hover:border-b-gray-900 hover:bg-gray-800'
          }`}
          onClick={() => setSelectedOption('Orderbook')}
        >
          <p
            className={`text-center text-sm font-semibold ${selectedOption === 'trades' ? 'text-white' : 'text-gray-400'}`}
          >
            Orderbook
          </p>
        </div>
        <div className="border-r border-gray-700"></div> {/* Divider line */}
        <div
          className={`flex flex-col flex-1 cursor-pointer justify-center border-b-2 p-4 ${
            selectedOption === 'trades'
              ? 'border-b-gray-500 bg-gray-900'
              : 'border-b-gray-900 hover:border-b-gray-900 hover:bg-gray-800'
          }`}
          onClick={() => setSelectedOption('trades')}
        >
          <p
            className={`text-center text-sm font-semibold ${selectedOption === 'trades' ? 'text-white' : 'text-gray-400'}`}
          >
            Trades
          </p>
        </div>
      </div>

      {selectedOption === 'Orderbook' ? (
        <>
          <TableHeader type="orderbook" />
          {asks && <AskTable asks={asks} />}
          {price && <div>{price}</div>}
          {bids && <BidTable bids={bids} />}
        </>
      ) : (
        <>
          <TableHeader type="trades" />
          <TradesTable trades={trades} />
        </>
      )}
    </div>
  );
}

function TableHeader({ type }: { type: 'orderbook' | 'trades' }) {
  return (
    <div
      className={`flex ${type === 'orderbook' ? 'justify-between' : 'justify-around'} text-xs`}
    >
      <div className="text-white">Price</div>
      {type === 'orderbook' && <div className="text-slate-500">Size</div>}
      <div className="text-slate-500">
        {type === 'orderbook' ? 'Total' : 'Quantity'}
      </div>
    </div>
  );
}
