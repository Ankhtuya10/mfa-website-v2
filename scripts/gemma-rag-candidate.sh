#!/usr/bin/env bash
set -euo pipefail

MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
INPUT="${1:-source-notes/example-brand.md}"
TYPE="${2:-brand}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "Ollama is not installed or not on PATH." >&2
  exit 1
fi

if ! ollama list >/dev/null 2>&1; then
  echo "Starting Ollama server in the background..."
  ollama serve >/tmp/anoce-ollama.log 2>&1 &
  OLLAMA_PID=$!

  for _ in $(seq 1 30); do
    if ollama list >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  if ! ollama list >/dev/null 2>&1; then
    echo "Ollama did not become ready. Last log lines:" >&2
    tail -40 /tmp/anoce-ollama.log >&2 || true
    kill "$OLLAMA_PID" >/dev/null 2>&1 || true
    exit 1
  fi
fi

echo "Using Ollama model: $MODEL"
ollama pull "$MODEL"

OLLAMA_MODEL="$MODEL" npm run generate:rag-candidate -- --input "$INPUT" --type "$TYPE"
