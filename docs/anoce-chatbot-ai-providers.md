# Anoce Chatbot AI Providers

The chatbot can use Gemini, Ollama, or a fallback archive summary.

## Local Open Model With Ollama

Install Ollama, then pull a multilingual instruct model:

```bash
ollama pull qwen2.5:7b-instruct
ollama serve
```

Add these values to `.env.local`:

```bash
ANOCE_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:7b-instruct
```

Restart `npm run dev` after editing `.env.local`.

## Provider Behavior

- `ANOCE_AI_PROVIDER=ollama` uses only the local Ollama model.
- `ANOCE_AI_PROVIDER=gemini` uses only Gemini.
- If `ANOCE_AI_PROVIDER` is unset, the API tries Gemini first, then Ollama.
- If every model fails, the API still answers with a short summary from the RAG archive records.

`qwen2.5:7b-instruct` is a practical default for Mongolian and English RAG answers on a laptop. If it is too slow, try a smaller local model and set `OLLAMA_MODEL` to that name.
