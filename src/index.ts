interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Czech National Bank (Česká národní banka, ČNB) public API MCP. Keyless.
 *
 * Base: https://api.cnb.cz/cnbapi  (no API key required, confirmed live).
 * Conventions:
 *   - CZK is the base currency. Rates are quoted as CZK per `amount` units of the
 *     foreign currency (e.g. amount=100 for HUF/JPY, amount=1 for USD/EUR).
 *   - Dates are YYYY-MM-DD; months are YYYY-MM; years are YYYY.
 *   - lang=EN (English) or lang=CZ (Czech) controls country/currency labels.
 *
 * Every tool below was verified to return clean JSON via curl before shipping.
 */


const BASE = 'https://api.cnb.cz/cnbapi';
const UA = 'pipeworx-mcp-cnb-cz/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'exchange_rates',
    description:
      'ČNB official daily exchange rates against the Czech koruna (CZK) for a given day. Returns one entry per listed currency (~30 currencies, e.g. USD, EUR, GBP, JPY) with country, currency, currencyCode, amount and rate. The rate is CZK per `amount` units of that currency. Omit `date` for the latest published rates. Verified live.',
    inputSchema: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Day in YYYY-MM-DD, e.g. "2026-05-27". Omit for the latest published rates. Weekends/holidays return the last valid working-day rates.',
        },
        lang: { type: 'string', description: 'Label language: "EN" (default) or "CZ".' },
      },
    },
  },
  {
    name: 'exchange_rates_currency_month',
    description:
      'Daily ČNB exchange rates for ONE currency across a whole month — a per-currency time series against CZK. Returns currencyCode, amount, validFor (YYYY-MM-DD) and rate for each working day in the month. Use this to chart or compare a single currency over time. Verified live.',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'ISO currency code, e.g. "USD", "EUR", "GBP" (required).' },
        yearMonth: { type: 'string', description: 'Month in YYYY-MM, e.g. "2026-05". Omit for the current month.' },
        lang: { type: 'string', description: 'Label language: "EN" (default) or "CZ".' },
      },
      required: ['currency'],
    },
  },
  {
    name: 'monthly_averages',
    description:
      'Monthly average exchange rates for ONE currency against CZK, across all available years. Returns month (e.g. "JAN"), year, currencyCode, amount and average. Useful for historical trend/year-over-year comparisons of a currency vs CZK. Verified live.',
    inputSchema: {
      type: 'object',
      properties: {
        currency: { type: 'string', description: 'ISO currency code, e.g. "USD", "EUR" (required).' },
        lang: { type: 'string', description: 'Label language: "EN" (default) or "CZ".' },
      },
      required: ['currency'],
    },
  },
  {
    name: 'pribor',
    description:
      'PRIBOR — the Prague Interbank Offered Rate (CZK money-market reference rates) for a given day. Returns one entry per tenor (period: ONE_DAY, ONE_WEEK, ONE_MONTH, THREE_MONTH, SIX_MONTH, ONE_YEAR, etc.) with the pribor rate in percent. Omit `date` for the latest. Verified live.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Day in YYYY-MM-DD, e.g. "2026-05-27". Omit for the latest. Weekends/holidays return the last valid working-day fixing.' },
      },
    },
  },
  {
    name: 'czeonia',
    description:
      'CZEONIA — the Czech Overnight Index Average (the reference rate for actual overnight CZK interbank deposits) for a given day. Returns validFor, the overnight rate (percent) and traded volume in CZK millions. Omit `date` for the latest. Verified live.',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Day in YYYY-MM-DD, e.g. "2026-05-27". Omit for the latest. Weekends/holidays return the last valid working-day value.' },
      },
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'exchange_rates': {
      const params = new URLSearchParams({ lang: lang(args) });
      const date = optStr(args, 'date');
      if (date) params.set('date', date);
      return cnbGet(`/exrates/daily?${params}`);
    }
    case 'exchange_rates_currency_month': {
      const currency = reqStr(args, 'currency', '"USD"');
      const params = new URLSearchParams({ currency, lang: lang(args) });
      const yearMonth = optStr(args, 'yearMonth');
      if (yearMonth) params.set('yearMonth', yearMonth);
      return cnbGet(`/exrates/daily-currency-month?${params}`);
    }
    case 'monthly_averages': {
      const currency = reqStr(args, 'currency', '"USD"');
      const params = new URLSearchParams({ currency, lang: lang(args) });
      return cnbGet(`/exrates/monthly-averages-currency?${params}`);
    }
    case 'pribor': {
      const params = new URLSearchParams();
      const date = optStr(args, 'date');
      if (date) params.set('date', date);
      const qs = params.toString();
      return cnbGet(`/pribor/daily${qs ? `?${qs}` : ''}`);
    }
    case 'czeonia': {
      const params = new URLSearchParams();
      const date = optStr(args, 'date');
      if (date) params.set('date', date);
      const qs = params.toString();
      return cnbGet(`/czeonia/daily${qs ? `?${qs}` : ''}`);
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function cnbGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`CNB: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function lang(args: Record<string, unknown>): string {
  const v = args.lang;
  return typeof v === 'string' && v.trim().toUpperCase() === 'CZ' ? 'CZ' : 'EN';
}

function optStr(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === 'string' && v.trim() ? v.trim() : undefined;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v.trim();
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
