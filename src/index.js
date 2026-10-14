export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // AIチャットのAPIエンドポイント
    if (url.pathname === "/api/chat" && request.method === "POST") {
      try {
        const { message } = await request.json();
        const apiKey = env.GOOGLE_API_KEY;

        if (!apiKey) {
          throw new Error("CloudflareにAPIキーが設定されていません。");
        }

        // Gemini APIへリクエスト（より安定した書き方）
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(geminiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: message }] }]
          })
        });

        const data = await response.json();
        
        // APIからエラーが返ってきた場合の詳細をキャッチ
        if (data.error) {
          throw new Error(`Google API エラー: ${data.error.message || JSON.stringify(data.error)}`);
        }

        // 応答テキストの抽出
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!reply) {
          throw new Error(`AIからの応答が空でした。詳細: ${JSON.stringify(data)}`);
        }

        return new Response(JSON.stringify({ reply: reply }), {
          headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
        
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json;charset=UTF-8" } });
      }
    }

    // --- 以下、フロントエンドの画面UI ---
    const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Choshux - AI Assistant</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #0f172a; color: #f8fafc; font-family: sans-serif; }
    .card { width: 90%; max-width: 500px; background: #1e293b; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.3); }
    h1 { font-size: 1.5rem; margin-top: 0; color: #38bdf8; text-align: center; }
    #chat-box { min-height: 80px; max-height: 300px; overflow-y: auto; background: #0f172a; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; }
    .input-row { display: flex; gap: 0.5rem; }
    input { flex: 1; padding: 0.75rem; border-radius: 6px; border: 1px solid #334155; background: #0f172a; color: #fff; outline: none; }
    button { padding: 0.75rem 1.2rem; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
    button:disabled { background: #475569; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Choshux AI Console</h1>
    <div id="chat-box">こんにちは！Geminiです。何か質問を入力してみてください。</div>
    <div class="input-row">
      <input type="text" id="prompt" placeholder="こんにちは、と入力...">
      <button id="send-btn" onclick="sendMessage()">送信</button>
    </div>
  </div>

  <script>
    async function sendMessage() {
      const input = document.getElementById('prompt');
      const box = document.getElementById('chat-box');
      const btn = document.getElementById('send-btn');
      const text = input.value.trim();
      if (!text) return;

      box.innerText = "思考中...";
      btn.disabled = true;
      input.value = "";

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        
        // 成功でもエラーでも画面に結果を出す
        box.innerText = data.reply || data.error || "予期せぬエラー";
      } catch (e) {
        box.innerText = "通信エラーが発生しました: " + e.message;
      } finally {
        btn.disabled = false;
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=UTF-8" }
    });
  }
};