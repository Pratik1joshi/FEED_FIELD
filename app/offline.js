"use client";

export default function OfflinePage() {
  return (
    <html lang="en">
      <head>
        <title>Offline - Field Expedition Platform</title>
        <style>
          {`
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
                "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans",
                "Helvetica Neue", sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .offline-container {
              background: white;
              border-radius: 12px;
              padding: 48px 32px;
              max-width: 500px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            }
            .offline-icon {
              font-size: 64px;
              margin-bottom: 24px;
            }
            h1 {
              color: #1f2937;
              font-size: 28px;
              margin: 0 0 12px 0;
              font-weight: 600;
            }
            p {
              color: #6b7280;
              font-size: 16px;
              margin: 0 0 32px 0;
              line-height: 1.6;
            }
            .cached-content {
              background: #f3f4f6;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 24px;
              text-align: left;
            }
            .cached-content h3 {
              color: #1f2937;
              margin: 0 0 12px 0;
              font-size: 14px;
              font-weight: 600;
            }
            .cached-content ul {
              margin: 0;
              padding: 0 0 0 20px;
              color: #4b5563;
              font-size: 14px;
            }
            .cached-content li {
              margin: 8px 0;
            }
            button {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 32px;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: background 0.3s ease;
            }
            button:hover {
              background: #764ba2;
            }
            .tips {
              background: #eff6ff;
              border-left: 4px solid #3b82f6;
              padding: 16px;
              border-radius: 4px;
              text-align: left;
              margin-top: 24px;
            }
            .tips h4 {
              color: #1e40af;
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: 600;
            }
            .tips p {
              margin: 0;
              color: #1e3a8a;
              font-size: 13px;
              line-height: 1.5;
            }
          `}
        </style>
      </head>
      <body>
        <div className="offline-container">
          <div className="offline-icon">📡</div>
          <h1>You're Offline</h1>
          <p>
            It looks like you've lost your internet connection. Don't worry—you can still
            access cached content.
          </p>

          <div className="cached-content">
            <h3>✓ Available Offline:</h3>
            <ul>
              <li>Expedition details and itineraries</li>
              <li>Route maps and location information</li>
              <li>Previously viewed documents</li>
              <li>Location cards and descriptions</li>
              <li>All downloaded images</li>
            </ul>
          </div>

          <button onClick={() => window.location.href = "/"}>
            Return to Home
          </button>

          <div className="tips">
            <h4>💡 Pro Tips:</h4>
            <p>
              This app works offline! When your connection is restored, you can sync new content.
              Use the browser's back button to navigate through cached pages.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
