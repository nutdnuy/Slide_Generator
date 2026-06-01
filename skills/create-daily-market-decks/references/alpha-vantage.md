# Alpha Vantage Notes

Use Alpha Vantage for daily market decks when the user supplies an API key or has `ALPHAVANTAGE_API_KEY` set.

## Endpoint

Use:

```text
https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=<SYMBOL>&outputsize=compact&apikey=<KEY>
```

The response normally contains:

- `Meta Data`
- `Time Series (Daily)`
- daily fields: open, high, low, close, volume

## Handling Limits

Alpha Vantage may return:

- `Note` for rate limits
- `Information` for plan or endpoint limitations
- `Error Message` for invalid symbols or calls

When that happens:

1. Do not create a fresh deck from partial or malformed data.
2. Use cache only if the cache file exists and clearly mark `used_cache: true`.
3. Tell the user which symbols failed.

## Key Safety

- Never save API keys into scripts, manifests, cache, notes, slides, or final responses.
- Prefer `ALPHAVANTAGE_API_KEY` env var.
- If using `--api-key`, do it only for a one-off command.

## Default Symbols

For a compact US daily market deck:

- `SPY`: broad US equities
- `QQQ`: growth / Nasdaq proxy
- `TLT`: long-duration US Treasuries
- `GLD`: gold proxy

Add more only when the rate limit allows it.
