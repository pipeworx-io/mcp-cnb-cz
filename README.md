# mcp-cnb-cz

Czech National Bank (Česká národní banka, ČNB) public API MCP. Keyless.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Cnb Cz data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
