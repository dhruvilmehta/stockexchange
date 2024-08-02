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
  // const [price, setPrice] = useState<string>();

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      'depth',
      (data: any) => {
        setBids((originalBids) => {
          const bidsAfterUpdate = [...(originalBids || [])];

          for (let i = 0; i < bidsAfterUpdate.length; i++) {
            for (let j = 0; j < data.bids.length; j++) {
              console.log(data.bids[j][1]);
              if (Number(data.bids[j][1]) === 0)
                // setPrice(bidsAfterUpdate[j][0]);
              if (bidsAfterUpdate[i][0] === data.bids[j][0]) {
                bidsAfterUpdate[i][1] = data.bids[j][1];
                if (Number(bidsAfterUpdate[i][1]) === 0) {
                  bidsAfterUpdate.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
          }
          console.log(bidsAfterUpdate, ' bids after update');

          for (let j = 0; j < data.bids.length; j++) {
            if (
              Number(data.bids[j][1]) !== 0 &&
              !bidsAfterUpdate.map((x) => x[0]).includes(data.bids[j][0])
            ) {
              bidsAfterUpdate.push(data.bids[j]);
            }
          }
          bidsAfterUpdate.sort((x, y) => Number(y[0]) - Number(x[0]));
          return bidsAfterUpdate;
        });

        setAsks((originalAsks) => {
          const asksAfterUpdate = [...(originalAsks || [])];
          for (let i = 0; i < asksAfterUpdate.length; i++) {
            for (let j = 0; j < data.asks.length; j++) {
              console.log(data.asks[j][1]);
              if (Number(data.asks[j][1]) === 0)
                // setPrice(asksAfterUpdate[j][0]);
              if (asksAfterUpdate[i][0] === data.asks[j][0]) {
                asksAfterUpdate[i][1] = data.asks[j][1];
                if (Number(asksAfterUpdate[i][1]) === 0) {
                  asksAfterUpdate.splice(i, 1);
                  i--;
                  break;
                }
              }
            }
          }
          console.log(asksAfterUpdate, ' asks after update');

          for (let j = 0; j < data.asks.length; j++) {
            if (
              Number(data.asks[j][1]) !== 0 &&
              !asksAfterUpdate.map((x) => x[0]).includes(data.asks[j][0])
            ) {
              asksAfterUpdate.push(data.asks[j]);
            }
          }
          asksAfterUpdate.sort((x, y) => Number(y[0]) - Number(x[0]));
          return asksAfterUpdate;
        });
      },
      `DEPTH-${market}`,
    );

    SignalingManager.getInstance().registerCallback(
      'trade',
      (price: string) => {
        console.log('received callback for trade');
        setPrice(price);
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

    getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => setPrice(t[0].price));

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

  console.log('Current price ', price);

  return (
    <div>
      <TableHeader />
      {asks && <AskTable asks={asks} />}
      {price && <div>{price}</div>}
      {bids && <BidTable bids={bids} />}
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}
