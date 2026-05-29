export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, score, verdict, city, rooms, findings = [], isDeepScan = false, deepRoom = '' } = req.body;

    const scoreColor = score < 50 ? '#C4614F' : score < 70 ? '#E6B450' : '#7FB84E';
    const scoreBg = score < 50 ? 'rgba(196,97,79,.15)' : score < 70 ? 'rgba(230,180,80,.15)' : 'rgba(127,184,78,.15)';
    const scoreBar = Math.round((score / 100) * 100);

    const findingsHtml = findings.slice(0, 4).map(f => {
      const sColor = f.severity === 'Critical' ? '#C4614F' : f.severity === 'Moderate' ? '#E6B450' : '#7FB84E';
      const sBg = f.severity === 'Critical' ? 'rgba(196,97,79,.12)' : f.severity === 'Moderate' ? 'rgba(230,180,80,.12)' : 'rgba(127,184,78,.12)';
      return `
      <div style="background:#171A1C;border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:18px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:8px;height:8px;border-radius:50%;background:${sColor};flex-shrink:0"></div>
          <div style="font-size:14px;font-weight:700;color:#ECEEF0;flex:1">${f.title || ''}</div>
          <div style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:6px;background:${sBg};color:${sColor}">${f.severity || ''}</div>
        </div>
        <p style="margin:0 0 12px;font-size:13px;color:rgba(236,238,240,.55);line-height:1.5">${f.why || ''}</p>
        <div style="display:flex;gap:8px;align-items:center">
          <div style="flex:1;background:rgba(196,97,79,.1);border:1px solid rgba(196,97,79,.2);border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:18px;margin-bottom:4px">${f.yourProduct?.icon || '📦'}</div>
            <div style="font-size:12px;font-weight:600;color:#ECEEF0">${f.yourProduct?.name || ''}</div>
            <div style="font-size:10px;color:#C4614F;margin-top:2px">${f.yourProduct?.verdict || 'Risky'}</div>
          </div>
          <div style="color:rgba(236,238,240,.3);font-size:16px">→</div>
          <div style="flex:1;background:rgba(127,184,78,.1);border:1px solid rgba(127,184,78,.2);border-radius:8px;padding:10px;text-align:center">
            <div style="font-size:18px;margin-bottom:4px">${f.swap?.icon || '✅'}</div>
            <div style="font-size:12px;font-weight:600;color:#ECEEF0">${f.swap?.name || ''}</div>
            <div style="font-size:10px;color:#7FB84E;margin-top:2px">${f.swap?.price || ''}</div>
          </div>
        </div>
      </div>`;
    }).join('');

    const subject = isDeepScan
      ? `Your ${deepRoom} Deep Scan Results — Score updated`
      : `Your Homethy Score: ${score}/100 — ${verdict}`;

    const headline = isDeepScan
      ? `${deepRoom} Deep Scan Complete`
      : 'Your Home Health Score';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="dark">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0B0D0E;font-family:-apple-system,BlinkMacSystemFont,'Inter',sans-serif;color:#ECEEF0;-webkit-font-smoothing:antialiased">
  <div style="max-width:580px;margin:0 auto;padding:32px 16px 48px">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px">
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 20px">
        <tr>
          <td style="background:#7FB84E;width:34px;height:34px;border-radius:9px;text-align:center;vertical-align:middle;font-size:18px">🏠</td>
          <td style="padding-left:8px;font-size:22px;font-weight:800;vertical-align:middle">
            <span style="color:#ECEEF0">home</span><span style="color:#7FB84E">thy</span>
          </td>
        </tr>
      </table>
      <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#ECEEF0">${headline}</h1>
      <p style="margin:0;font-size:14px;color:rgba(236,238,240,.5)">${city}${rooms ? ' · ' + rooms : ''}</p>
    </div>

    <!-- Score Card -->
    <div style="background:#111416;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:32px;text-align:center;margin-bottom:16px">
      <div style="font-size:80px;font-weight:900;color:${scoreColor};line-height:1;letter-spacing:-2px">${score}</div>
      <div style="font-size:13px;color:rgba(236,238,240,.35);margin:4px 0 16px">out of 100</div>
      
      <!-- Score bar -->
      <div style="background:rgba(255,255,255,.06);border-radius:99px;height:6px;margin:0 auto 16px;max-width:200px">
        <div style="background:${scoreColor};width:${scoreBar}%;height:6px;border-radius:99px"></div>
      </div>

      <div style="display:inline-block;padding:7px 18px;border-radius:99px;font-size:13px;font-weight:700;background:${scoreBg};color:${scoreColor}">${verdict}</div>
    </div>

    ${findings.length > 0 ? `
    <!-- Findings -->
    <div style="margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:rgba(236,238,240,.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:12px;padding-left:2px">
        ${isDeepScan ? 'Deep Scan Findings' : 'Key Findings'}
      </div>
      ${findingsHtml}
    </div>` : ''}

    <!-- CTA -->
    <div style="background:#111416;border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:24px;text-align:center;margin-bottom:16px">
      <p style="margin:0 0 16px;font-size:14px;color:rgba(236,238,240,.55);line-height:1.6">
        ${isDeepScan ? 'Your Deep Scan results have been added to your full report.' : 'Your full report with all findings, product swaps, and personalized recommendations is ready.'}
      </p>
      <a href="https://homethy-one.vercel.app" style="display:block;background:#7FB84E;color:#0B0D0E;text-decoration:none;text-align:center;padding:15px 24px;border-radius:11px;font-weight:800;font-size:15px">
        View Full Results →
      </a>
    </div>

    <!-- Footer -->
    <p style="text-align:center;font-size:12px;color:rgba(236,238,240,.25);margin:0;line-height:1.6">
      Good health starts at home.<br>
      <a href="https://homethy-one.vercel.app" style="color:rgba(236,238,240,.25);text-decoration:none">homethy-one.vercel.app</a>
    </p>

  </div>
</body>
</html>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (process.env.RESEND_API_KEY || process.env.resend_api_key),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: 'Homethy <onboarding@resend.dev>', to: email, subject, html })
    });

    const data = await response.json();
    if (data.statusCode >= 400) return res.status(400).json({ error: data.message });
    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
