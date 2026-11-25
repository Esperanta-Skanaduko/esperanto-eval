# esperanto-eval

A benchmark of **Esperanto grammar and word-building** for language models, with a harness that runs any model.

577 questions in eight tasks, each with one correct answer that follows from a rule of the language: the table of correlatives, the accusative, agreement, affixes, verb forms and number words. The items are **generated from a seed**, so the published set can be re-derived and audited, and fresh sets can be made any time. 

**Browse the items and see results:** https://esperantaskanaduko.com/open-source/esperanto-eval/

> **Status: v0.1, not yet reviewed by native speakers.** The answer keys come from standard rules and are checked by code, but no fluent speaker has gone through them yet. Please help: [docs/REVIEW.md](docs/REVIEW.md).

## First results

| Model | Overall | Correlatives (write) | Correlatives (meaning) | Accusative | Grammaticality | Word-building | Verb forms | Numbers (write) | Numbers (read) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `gold` (checks the scorer, not a model) | 100.0% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| `qwen3-vl:2b-instruct` (local, via Ollama) | **29.0%** | 0.0% | 60.0% | 19.0% | 74.0% | 26.4% | 21.0% | 4.0% | 28.0% |
| `random` (picks a random option; cannot answer the rest) | 9.5% | 0.0% | 23.3% | 0.0% | 53.0% | 0.0% | 0.0% | 0.0% | 0.0% |
| `copy-input` (repeats the input unchanged) | 0.0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% | 0% |

One small model so far, so this table shows the harness working, not a ranking. With 45 to 100 items per task, each task accuracy has a wide 95% interval (for example `grammaticality` 74.0%, 64.6% to 81.6%, against 50% by chance). Full tables with intervals are in [`results/`](results/). **Add your model:** run it (below) and open a pull request with the file from `results/`.

## Run it

Node 20 or newer, no dependencies.

```bash
# Any server that speaks the OpenAI chat protocol: Ollama, llama.cpp, vLLM, LM Studio, OpenAI...
npx esperanto-eval run --provider openai --base-url http://localhost:11434/v1 --model llama3 --name llama3

# Any command that reads a prompt on stdin and prints a reply
npx esperanto-eval run --provider command --cmd "ollama run llama3" --name llama3

# Hosted API with a key in the environment
npx esperanto-eval run --provider openai --base-url https://api.openai.com/v1 --model gpt-4o-mini --api-key-env OPENAI_API_KEY --name gpt-4o-mini

# Try it cheaply first: 5 items per task
npx esperanto-eval run ... --limit 5
```

Results are written to `results/<name>.json` with every raw reply, so you can re-score later (`esperanto-eval rescore results/NAME.json`) if the scoring rules change. A failed request counts as wrong and is recorded, so one error never stops a long run.

Other commands: `baselines` (the references above), `generate --seed N --out FILE` (fresh items from the same rules), `verify` (re-derive the shipped items and compare byte for byte), `review-sheet` (the spreadsheet for native-speaker review), `report FILE`.

From a clone, use `node bin/esperanto-eval.mjs` in place of `npx esperanto-eval`.

## The tasks

| Task | Items | What it tests |
| --- | ---: | --- |
| `correlative-write` | 45 | All 45 correlatives (`kiam`, `ĉies`, `nenie`...), written from an English meaning |
| `correlative-meaning` | 60 | The same table, read, with tempting wrong options that share a prefix or a suffix |
| `accusative` | 100 | Add `-n` / `-jn` to the object and its adjective, in SVO and OVS order, without marking the subject or a noun after a preposition |
| `grammaticality` | 100 | Pick the correct sentence of a pair that differs by one error (five kinds of error, equally often) |
| `word-building` | 72 | Root + affix to the standard derived word (`lerni` + `-ejo`) |
| `conjugation` | 100 | Tenses, conditional, imperative and the six participles |
| `number-write` | 50 | 0-9999 as Esperanto words |
| `number-read` | 50 | Esperanto number words as digits |

How items are made, how replies are scored, and the limits (it measures rule application, not fluency; the vocabulary is small; a frozen set can leak into training data) are in [docs/METHOD.md](docs/METHOD.md). The scoring is strict and the same for every model; the raw replies are kept so you can audit it.

For translation quality rather than grammar, see [Open Machine Translation for Esperanto](https://arxiv.org/abs/2603.29345) (de Gibert and de Gibert, 2026), which evaluates open translation systems for Esperanto.

## Development

```bash
npm test      # 31 tests: generators, independent key checks, scoring, providers, CLI
npm run verify
```

## License

[MIT](LICENSE). Part of [Esperanta Skanaduko](https://esperantaskanaduko.com).
