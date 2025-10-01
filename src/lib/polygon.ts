import { restClient } from "@polygon.io/client-js";

const getRestClient = () => {
  const rest = restClient(
    process.env.POLYGON_API_KEY || "",
    process.env.POLYGON_URL
  );
  return rest;
};

export const getStockNews = async (limit?: number) => {
  const rest = getRestClient();
  const response = await rest.listNews(
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    limit
  );
  return response;
};

export const getPolygonCompanyNews = async (input: string, limit?: number) => {
  const restClient = getRestClient();
  const response = await restClient.listNews(
    input,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    limit
  );
  return response;
};
