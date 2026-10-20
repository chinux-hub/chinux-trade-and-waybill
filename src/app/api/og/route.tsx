import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title') || 'Wholesale Product';
    const price = searchParams.get('price') || '';
    const category = searchParams.get('category') || 'Wholesale Inventory';
    const businessName = searchParams.get('shop') || 'Verified Wholesale Trader';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: '#0a0f1d',
            padding: '60px',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* Top Brand Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: '50px',
                padding: '8px 24px',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                }}
              />
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 900,
                  color: '#10b981',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </span>
            </div>

            <div
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#94a3b8',
              }}
            >
              {businessName}
            </div>
          </div>

          {/* Center Product Title & Price */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '900px',
            }}
          >
            <div
              style={{
                fontSize: '56px',
                fontWeight: 900,
                color: '#ffffff',
                lineHeight: 1.15,
              }}
            >
              {title}
            </div>

            {price && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '44px',
                    fontWeight: 900,
                    color: '#34d399',
                  }}
                >
                  {price}
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    color: '#94a3b8',
                  }}
                >
                  / carton wholesale
                </span>
              </div>
            )}
          </div>

          {/* Bottom Security / Dispatch Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '2px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '24px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#cbd5e1',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              🚚 Nationwide Waybill • 🔐 4-Digit Pickup PIN
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#10b981',
                fontSize: '20px',
                fontWeight: 900,
              }}
            >
              CHINUX WHOLESALE OS
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
