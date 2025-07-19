export const aichat = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user;

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama3.1",
        stream: true,
        prompt: `
You are an AI language tutor.  

✅ If the user’s question is about translating a word or sentence into a specific language, reply **only with the translated text, nothing else**.  

✅ If the user’s question is about grammar, vocabulary, or practice conversation, reply with a concise and direct answer.  

🚫 If the user’s message is not about language learning, politely respond:
"Sorry, I can only help with language learning questions."

Here is the user's message: "${message}"
`.trim(),
      }),
    });

    if (!ollamaResponse.body) {
      return res.status(500).send("No response body from Ollama.");
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.trim()) continue;

        const json = JSON.parse(line);

        if (json.response) {
          res.write(json.response);
        }
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error while streaming AI response.");
  }
};
