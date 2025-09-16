import { restClient } from '@polygon.io/client-js';


const getRestClient = () => {
        const rest = restClient(process.env.POLYGON_API_KEY || "", process.env.POLYGON_URL);
        return rest;
}

export const getStockNews = async () => {
    const restClient = getRestClient();
    const response = await restClient.listNews();

    return response; 

}

