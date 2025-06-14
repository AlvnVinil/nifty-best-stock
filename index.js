export default {
  async fetch(request) {
    async function fetchNiftyStocks() {
      const res = await fetch("https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/niftyStockWatch.json", {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www1.nseindia.com/"
        }
      });

      const data = await res.json();
      return data.data.map(item => ({
        name: item.symbol,
        symbol: item.symbol + ".NS"
      }));
    }

    async function fetchGrowth(stock) {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=1mo`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        const prices = json.chart.result[0].indicators.adjclose[0].adjclose;
        const start = prices[0];
        const end = prices.at(-1);
        const growth = ((end - start) / start) * 100;
        return { ...stock, start, end, growth };
      } catch {
        return null;
      }
    }

    let stocks;
    try {
      stocks = await fetchNiftyStocks();
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to fetch NIFTY 50 list." }), { status: 500 });
    }

    const growths = await Promise.all(stocks.map(fetchGrowth));
    const valid = growths.filter(Boolean);
    const best = valid.sort((a, b) => b.growth - a.growth)[0];

    return new Response(JSON.stringify({
      best_stock: {
        name: best.name,
        symbol: best.symbol,
        start_price: best.start.toFixed(2),
        end_price: best.end.toFixed(2),
        growth: best.growth.toFixed(2) + "%"
      }
    }, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
}
