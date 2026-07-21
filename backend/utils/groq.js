/**
 * Call Groq Cloud API
 */
async function callGroqAPI(prompt, systemInstruction = "", jsonMode = false, fileBuffer = null, mimeType = null, temperature = 0.1) {
  const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not defined in environment variables");
  }

  let textContent = prompt;
  if (fileBuffer) {
    let extractedText = "";
    try {
      let pdfModule;
      try {
        pdfModule = require("pdf-parse");
      } catch (e) {
        // Safe to ignore if not installed
      }

      if (mimeType === "application/pdf") {
        if (typeof pdfModule === "function") {
          extractedText = (await pdfModule(fileBuffer)).text;
        } else if (pdfModule && pdfModule.PDFParse) {
          extractedText = (await (new pdfModule.PDFParse({ data: fileBuffer })).getText()).text;
        } else {
          extractedText = fileBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
        }
      } else {
        extractedText = fileBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
      }
    } catch (err) {
      console.warn("Groq PDF pre-extraction error, falling back to raw binary string:", err);
      extractedText = fileBuffer.toString("utf-8").replace(/[^\x20-\x7E\n]/g, " ");
    }
    textContent = `${prompt}\n\nResume Content:\n${extractedText}`;
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: "system", content: systemInstruction });
  }
  messages.push({ role: "user", content: textContent });

  const body = {
    model: "llama-3.3-70b-versatile", // standard high-quality reasoning and coding model in Groq Cloud
    messages,
    temperature
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API returned status ${response.status}: ${errText}`);
  }

  const data = await response.json();
  if (data && data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content;
  }
  throw new Error("Invalid response format returned by Groq API");
}

module.exports = { callGroqAPI };
