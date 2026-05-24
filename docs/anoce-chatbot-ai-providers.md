# Anoce Chatbot AI Providers

The chatbot can use a local Ollama model, Gemini, or a fallback archive summary.

## Recommended Defense Setup: Llama 3.1 With Ollama

For the local chatbot response model, use `llama3.1:8b`.

Why this is the best practical Ollama choice for this project:

- It behaved better than `qwen3:8b` and `aya:8b` in local Mongolian smoke tests.
- It avoids Qwen3's visible thinking-mode output.
- Runs on the MacBook Air M4 memory budget more safely than 14B, 30B, or larger models.
- Good defense-day balance: local, explainable, and not painfully slow.

Pull the model:

```bash
ollama pull llama3.1:8b
```

Use this in `.env.local`:

```bash
ANOCE_AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
OLLAMA_TIMEOUT_MS=120000
```

Then restart the app:

```bash
npm run dev
```

## Model Choices

- `llama3.1:8b` — recommended local chatbot model for the defense.
- `qwen3:8b` — strong general model, but local smoke testing showed bad Mongolian repetition/thinking output for this project.
- `aya:8b` — multilingual model, but local smoke testing produced poor Mongolian output here.
- `gemma4:e4b` — okay for experiments, but no longer the recommended chatbot response model.

## Alternative: Gemini API

Use Gemini when you want the smoothest cloud demo and internet/API access is reliable:

```bash
ANOCE_AI_PROVIDER=gemini
GEMINI_MODEL=gemini-3.5-flash
GEMINI_API_KEY=...
```

For defense day, the safest story is:

- Local/offline demo: `llama3.1:8b` through Ollama.
- Cloud-polished demo: Gemini, if the API key and internet are stable.

## Provider Behavior

- `ANOCE_AI_PROVIDER=ollama` uses only the local Ollama model.
- `ANOCE_AI_PROVIDER=gemini` uses only Gemini.
- `ANOCE_AI_PROVIDER=gemma` still works as an old alias for local Ollama, but avoid it for the chatbot config.
- If `ANOCE_AI_PROVIDER` is unset, the API tries Gemini first, then Ollama.
- If every model fails, the API still answers with a short summary from the RAG archive records.

## High-Quality RAG Data Workflow

The model should not invent your dataset. Use the model as a reviewer and formatter:

1. Collect sources for each brand, collection, look, and article.
2. Write a short Mongolian factual record with source confidence.
3. Ask the model to normalize the text into the project schema.
4. Manually verify facts such as founder, year, awards, collaborations, and prices.
5. Seed the verified records:

```bash
npm run seed:rag
```

6. Check defense coverage:

```bash
npm run validate:rag-demo
```

Good defense-day data is not just larger. It should be source-backed, searchable in Mongolian and English spellings, split into topic-level records, and honest when public information is limited.

## Generate RAG Candidate Data With Ollama

Create a source-notes file first, then run the candidate generator with the model you want:

```bash
OLLAMA_MODEL=llama3.1:8b npm run generate:rag-candidate -- --input source-notes/example-brand.md --type brand
```

The script writes output to:

```text
generated/rag-candidates/example-brand.json
```

Generated files are candidates, not final truth. Review `verificationNotes`, confirm source facts, then move verified content into `lib/anoceRagDataset.mn.ts` before running `npm run seed:rag`.
