'use client';
import { MarketBar } from '@/app/components/MarketBar';
import { SwapUI } from '@/app/components/SwapUI';
import { TradeView } from '@/app/components/TradeView';
import { Depth } from '@/app/components/depth/Depth';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const { market } = useParams();
  const [price, setPrice] = useState<string>('');

  const router = useRouter();
  if (localStorage.getItem('token') === null) {
    localStorage.setItem('redirectUrl', window.location.href);
    router.push('/login');
  }

  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-1">
        <MarketBar market={market as string} />
        <div className="flex flex-row h-[920px] border-y border-slate-800">
          <div className="flex flex-col flex-1">
            <TradeView market={market as string} />
          </div>
          <div className="flex flex-col w-[250px] overflow-hidden">
            <Depth
              market={market as string}
              price={price}
              setPrice={setPrice}
            />
          </div>
        </div>
      </div>
      <div className="w-[10px] flex-col border-slate-800 border-l"></div>
      <div>
        <div className="flex flex-col w-[250px]">
          <SwapUI market={market as string} price={price} />
        </div>
      </div>
    </div>
  );
}

export const runtime = 'edge';
