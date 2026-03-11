import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import type {
  CreatePortfolioRequest,
  PortfolioResponse,
  UpdatePortfolioRequest,
} from "@/types/portfolio";

const BASE_PATH = "/portfolios";

export async function createPortfolio(
  data: CreatePortfolioRequest,
): Promise<PortfolioResponse> {
  return apiPost<PortfolioResponse>(BASE_PATH, data);
}

export async function getUserPortfolios(): Promise<PortfolioResponse[]> {
  return apiGet<PortfolioResponse[]>(BASE_PATH);
}

export async function getPortfolio(id: string): Promise<PortfolioResponse> {
  return apiGet<PortfolioResponse>(`${BASE_PATH}/${id}`);
}

export async function updatePortfolio(
  id: string,
  data: UpdatePortfolioRequest,
): Promise<PortfolioResponse> {
  return apiPatch<PortfolioResponse>(`${BASE_PATH}/${id}`, data);
}

export async function deletePortfolio(id: string): Promise<void> {
  return apiDelete(`${BASE_PATH}/${id}`);
}
