import StatCard from "@/components/cards/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1">Dashboard</h1>
        <p className="mt-1 text-body text-text-secondary">
          Your portfolio overview at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Portfolio Value"
          value="$48,352.18"
          change="2.4% today"
          trend="up"
        />
        <StatCard
          title="Total Gain/Loss"
          value="+$5,219.40"
          change="12.1% all time"
          trend="up"
        />
        <StatCard
          title="Today's Change"
          value="+$312.56"
          change="0.65%"
          trend="up"
        />
        <StatCard
          title="Holdings"
          value="12"
          change="3 watchlisted"
          trend="neutral"
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Market overview */}
        <div className="stoxly-card lg:col-span-2">
          <h2 className="text-h3 mb-4">Market Overview</h2>
          <div className="flex h-48 items-center justify-center rounded-xl bg-surface text-text-secondary">
            Chart placeholder
          </div>
        </div>

        {/* Watchlist */}
        <div className="stoxly-card">
          <h2 className="text-h3 mb-4">Watchlist</h2>
          <ul className="space-y-3">
            {[
              {
                symbol: "AAPL",
                name: "Apple Inc.",
                price: "$189.84",
                change: "+1.2%",
                trend: "up" as const,
              },
              {
                symbol: "TSLA",
                name: "Tesla Inc.",
                price: "$248.50",
                change: "-0.8%",
                trend: "down" as const,
              },
              {
                symbol: "MSFT",
                name: "Microsoft",
                price: "$378.91",
                change: "+0.5%",
                trend: "up" as const,
              },
              {
                symbol: "NVDA",
                name: "NVIDIA",
                price: "$721.33",
                change: "+3.1%",
                trend: "up" as const,
              },
            ].map((stock) => (
              <li
                key={stock.symbol}
                className="flex items-center justify-between rounded-xl px-3 py-2 transition-all duration-150 ease-in-out hover:bg-surface"
              >
                <div>
                  <span className="text-sm font-medium text-text-primary">
                    {stock.symbol}
                  </span>
                  <span className="ml-2 text-small text-text-secondary">
                    {stock.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-text-primary">
                    {stock.price}
                  </span>
                  <span
                    className={`ml-2 text-small font-medium ${stock.trend === "up" ? "trend-up" : "trend-down"}`}
                  >
                    {stock.change}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="stoxly-card">
        <h2 className="text-h3 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium text-right">Shares</th>
                <th className="pb-3 font-medium text-right">Price</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-text-primary">
              {[
                {
                  id: "tx-1",
                  date: "Mar 10, 2026",
                  stock: "AAPL",
                  type: "Buy",
                  shares: 10,
                  price: "$189.84",
                  total: "$1,898.40",
                },
                {
                  id: "tx-2",
                  date: "Mar 9, 2026",
                  stock: "TSLA",
                  type: "Sell",
                  shares: 5,
                  price: "$248.50",
                  total: "$1,242.50",
                },
                {
                  id: "tx-3",
                  date: "Mar 8, 2026",
                  stock: "NVDA",
                  type: "Buy",
                  shares: 3,
                  price: "$721.33",
                  total: "$2,163.99",
                },
              ].map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-border/50 transition-all duration-150 ease-in-out hover:bg-surface"
                >
                  <td className="py-3 text-text-secondary">{tx.date}</td>
                  <td className="py-3 font-medium">{tx.stock}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-small font-medium ${tx.type === "Buy" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 text-right">{tx.shares}</td>
                  <td className="py-3 text-right">{tx.price}</td>
                  <td className="py-3 text-right font-medium">{tx.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
