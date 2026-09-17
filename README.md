# mcp-cnb-cz

Czech National Bank (Česká národní banka, ČNB) public API MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `cnb_exchange_rates` | ČNB official daily exchange rates against the Czech koruna (CZK) for a given day. Returns one entry per listed currency (~30 currencies, e.g. USD, EUR, GBP, JPY) with country, currency, currencyCode, amount and rate. The rate is CZK per `amount` units of that currency. Omit `date` for the latest published rates. Verified live. |
| `cnb_exchange_rates_currency_month` | Daily ČNB exchange rates for ONE currency across a whole month — a per-currency time series against CZK. Returns currencyCode, amount, validFor (YYYY-MM-DD) and rate for each working day in the month. Use this to chart or compare a single currency over time. Verified live. |
| `cnb_monthly_averages` | Monthly average exchange rates for ONE currency against CZK, across all available years. Returns month (e.g. "JAN"), year, currencyCode, amount and average. Useful for historical trend/year-over-year comparisons of a currency vs CZK. Verified live. |
| `cnb_pribor` | PRIBOR — the Prague Interbank Offered Rate (CZK money-market reference rates) for a given day. Returns one entry per tenor (period: ONE_DAY, ONE_WEEK, ONE_MONTH, THREE_MONTH, SIX_MONTH, ONE_YEAR, etc.) with the pribor rate in percent. Omit `date` for the latest. Verified live. |
| `cnb_czeonia` | CZEONIA — the Czech Overnight Index Average (the reference rate for actual overnight CZK interbank deposits) for a given day. Returns validFor, the overnight rate (percent) and traded volume in CZK millions. Omit `date` for the latest. Verified live. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "cnb-cz": {
      "url": "https://gateway.pipeworx.io/cnb-cz/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/cnb-cz/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Cnb Cz data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/cnb_exchange_rates \
  -H 'Content-Type: application/json' \
  -d '{"date":"2026-05-27","lang":"EN"}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/cnb_exchange_rates`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.
