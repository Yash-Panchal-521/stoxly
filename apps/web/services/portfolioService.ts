import { apiClient } from "@/services/apiClient";
import type {
  Holding,
  Portfolio,
  PortfolioDetails,
  PortfolioSummary,
} from "@/types/portfolio";

function calculateSummary(portfolio: Portfolio | null, holdings: Holding[]) {
  const totalCostBasis = holdings.reduce(
    (sum, holding) => sum + holding.quantity * holding.averagePrice,
    0,
  );

  const totalMarketValue = holdings.reduce((sum, holding) => {
    const effectiveMarketPrice = holding.marketPrice ?? holding.averagePrice;

    return sum + holding.quantity * effectiveMarketPrice;
  }, 0);

  const totalReturn = totalMarketValue - totalCostBasis;

  return {
    portfolio,
    holdings,
    totalCostBasis,
    totalMarketValue,
    totalReturn,
    totalReturnPercentage:
      totalCostBasis > 0 ? (totalReturn / totalCostBasis) * 100 : 0,
  } satisfies PortfolioSummary;
}

async function getPortfolios() {
  return apiClient<Portfolio[]>("/portfolios");
}

async function getPortfolioDetails(portfolioId: string) {
  return apiClient<PortfolioDetails>(`/portfolios/${portfolioId}`);
}

async function getPortfolioHoldings(portfolioId: string) {
  return apiClient<Holding[]>(`/portfolios/${portfolioId}/holdings`);
}

async function getSummary() {
  const portfolios = await getPortfolios();
  const portfolio = portfolios.at(0) ?? null;

  if (!portfolio) {
    return calculateSummary(null, []);
  }

  const [details, holdings] = await Promise.all([
    getPortfolioDetails(portfolio.id),
    getPortfolioHoldings(portfolio.id),
  ]);

  return calculateSummary(details, holdings);
}

export const portfolioService = {
  getPortfolioDetails,
  getPortfolioHoldings,
  getPortfolios,
  getSummary,
};
