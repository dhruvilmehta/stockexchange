import { TradeType } from './depth/Depth';

const containerStyle: React.CSSProperties = {
  width: '100%',
  maxHeight: '400px', // Adjust the height as needed
  overflowY: 'auto', // Enables vertical scrolling
//   border: '1px solid #ddd', // Optional: for table border
//   borderRadius: '8px', // Optional: for rounded corners
};

const tableStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  backgroundColor: '#333', // Adjust header background
  padding: '10px',
  color: '#fff', // Text color
  fontWeight: 'bold',
};

const bodyStyle: React.CSSProperties = {
  overflowY: 'auto',
};

const rowStyle: React.CSSProperties = {
//   padding: '10px',
//   borderBottom: '1px solid #ddd', // Optional: row border
};

const evenRowStyle: React.CSSProperties = {
//   backgroundColor: '#f9f9f9', // Optional: alternate row background
};

export function TradesTable({ trades }: { trades: TradeType[] }) {
  return (
    <div style={containerStyle}>
      <div style={tableStyle}>
        {/* <div style={headerStyle} className="flex justify-around">
          <div className="text-white-500">Price</div>
          <div className="text-white-500">Quantity</div>
        </div> */}
        <div style={bodyStyle}>
          {trades.map((trade, index) => (
            <div
              key={index}
              style={
                index % 2 === 0 ? rowStyle : { ...rowStyle, ...evenRowStyle }
              }
              className="flex justify-around"
            >
              <div className="text-white-500">{trade.price}</div>
              <div className="text-white-500">{trade.quantity}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
