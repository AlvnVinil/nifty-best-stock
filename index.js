export default {
  async fetch(request) {
    const targetURL = "https://www1.nseindia.com/live_market/dynaContent/live_watch/stock_watch/niftyStockWatch.json";

    try {
      const res = await fetch(targetURL, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://www1.nseindia.com/"
        }
      });

      const data = await res.text();

      return new Response(data, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Failed to proxy NSE API" }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }
}
