export default async function handler(req: any, res: any) {
  try {
    const targetUrl =
      req.query?.url ||
      new URL(req.url || '', 'http://localhost:3000').searchParams.get('url');

    if (!targetUrl) {
      return res.status(400).json({ error: 'Parameter url wajib diisi' });
    }

    const gasRes = await fetch(targetUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await gasRes.text();

    try {
      const json = JSON.parse(text);
      return res.status(200).json(json);
    } catch {
      return res.status(200).json({
        success: false,
        isHtml: true,
        message:
          'Google Apps Script mengembalikan halaman HTML Web App, bukan data JSON REST API.',
        snippet: text.slice(0, 300),
      });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
