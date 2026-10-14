export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>Choshux - Workers Mode</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; justify-content: center; align-items: center; background: #0f172a; color: #f8fafc; font-family: sans-serif; }
    .box { text-align: center; }
  </style>
</head>
<body>
  <div class="box">
    <h1>Welcome to Choshux (Workers Mode)</h1>
    <p>Connected to GitHub & Cloudflare Workers.</p>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};