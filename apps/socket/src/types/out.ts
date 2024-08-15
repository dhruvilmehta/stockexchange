

export type TickerUpdateMessage = {
    type: "ticker",
    data: {
        c?: string,//current
        h?: string,//high
        l?: string,//low
        v?: string,//Volume
        V?: string,//Quote Volume
        s?: string,//Symbol
        id: number,//ID
        e: "ticker"//Event Type
    }
}

export type DepthUpdateMessage = {
    type: "depth",
    data: {
        b?: [string, string][],//Bid Prices and Quantities
        a?: [string, string][],//Ask Prices and Quantities
        id: number,//ID
        e: "depth"//Event Type
    }
}



export type OutgoingMessage = TickerUpdateMessage | DepthUpdateMessage;