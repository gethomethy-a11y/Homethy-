export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { email, score, verdict, city, rooms } = req.body;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + (process.env.RESEND_API_KEY || process.env.resend_api_key),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Homethy <results@gethomethy.com>',
        to: email,
        subject: 'Your Homethy Home Health Results — Score: ' + score + '/100',
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0B0D0E;font-family:Inter,system-ui,sans-serif;color:#ECEEF0">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px">
    
    <div style="text-align:center;margin-bottom:32px">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
        <div style="width:32px;height:32px;background:#7FB84E;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">🏠</div>
        <span style="font-size:20px;font-weight:700"><span style="color:#ECEEF0">home</span><span style="color:#7FB84E">thy</span></span>
      </div>
      <h1 style="margin:0 0 8px;font-size:28px;font-weight:800">Your Home Health Score</h1>
      <p style="margin:0;color:rgba(236,238,240,.6);font-size:15px">${city} · ${rooms}</p>
    </div>

    <div style="background:#111416;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:28px;text-align:center;margin-bottom:20px">
      <div style="font-size:72px;font-weight:900;color:#7FB84E;line-height:1">${score}</div>
      <div style="font-size:13px;color:rgba(236,238,240,.4);margin-bottom:12px">out of 100</div>
      <div style="display:inline-block;padding:6px 16px;border-radius:99px;font-size:13px;font-weight:700;background:${score < 50 ? 'rgba(196,97,79,.15)' : score < 70 ? 'rgba(230,180,80,.15)' : 'rgba(127,184,78,.15)'};color:${score < 50 ? '#C4614F' : score < 70 ? '#E6B450' : '#7FB84E'}">${verdict}</div>
    </div>

    <div style="background:#111416;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:24px;margin-bottom:20px">
      <p style="margin:0 0 16px;font-size:14px;color:rgba(236,238,240,.6)">Your full results including all findings and product swaps are available in the app.</p>
      <a href="https://homethy-one.vercel.app" style="display:block;background:#7FB84E;color:#0B0D0E;text-decoration:none;text-align:center;padding:14px;border-radius:10px;font-weight:700;font-size:15px">View Full Results →</a>
    </div>

    <p style="text-align:center;font-size:12px;color:rgba(236,238,240,.3);margin:0">
      Good health starts at home · <a href="https://homethy-one.vercel.app" style="color:rgba(236,238,240,.3)">homethy</a>
    </p>
  </div>
</body>
</html>`
      })
    });

    const data = await response.json();

    if (data.statusCode && data.statusCode >= 400) {
      return res.status(400).json({ error: data.message || 'Email failed' });
    }

    return res.status(200).json({ success: true, id: data.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
