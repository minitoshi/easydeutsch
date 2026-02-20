import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Black stripe */}
        <div style={{ flex: 1, background: '#1a1a1a', display: 'flex' }} />
        {/* Red stripe */}
        <div style={{ flex: 1, background: '#DD0000', display: 'flex' }} />
        {/* Gold stripe */}
        <div style={{ flex: 1, background: '#FFCE00', display: 'flex' }} />
      </div>
    ),
    { width: 32, height: 32 }
  );
}
