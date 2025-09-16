import axios from 'axios';

// EXPORT DATA  
export const DEFAULT_INTERVAL = '60min';
export const SUPPORTED_OUTPUT_SIZES = ['compact', 'full'];

class AlphaVantageAPI {
    private apiKey: string;
    private baseURL: string = 'https://www.alphavantage.co/query';

    constructor(apiKey: string) {
        if (!apiKey) {
            throw new Error('Alpha Vantage API key is required.');
        }
        this.apiKey = apiKey;
    }

    private async fetchData<T>(params: { [key: string]: string }): Promise<T> {
        try {
            const response = await axios.get<T>(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    ...params,
                },
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Alpha Vantage API Error:', error.response?.data || error.message);
                throw new Error(`Failed to fetch data from Alpha Vantage: ${error.response?.data || error.message}`);
            } else {
                console.error('Unexpected Error:', error);
                throw new Error('An unexpected error occurred while fetching data.');
            }
        }
    }

    public async getIntradayTimeSeries(
        symbol: string,
        interval: '1min' | '5min' | '15min' | '30min' | '60min' = DEFAULT_INTERVAL,
        outputsize: 'compact' | 'full' = 'compact',
        adjusted: 'true' | 'false' = 'true'
    ): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for intraday time series.');
        if (!SUPPORTED_OUTPUT_SIZES.includes(outputsize)) {
            throw new Error(`Invalid outputsize: ${outputsize}. Must be one of ${SUPPORTED_OUTPUT_SIZES.join(', ')}`);
        }

        const params = {
            function: 'TIME_SERIES_INTRADAY',
            symbol,
            interval,
            outputsize,
            adjusted,
        };
        return this.fetchData(params);
    }

    public async getDailyTimeSeries(
        symbol: string,
        outputsize: 'compact' | 'full' = 'compact'
    ): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for daily time series.');

        const params = {
            function: 'TIME_SERIES_DAILY',
            symbol,
            outputsize,
        };
        return this.fetchData(params);
    }

    public async getDailyAdjustedTimeSeries(
        symbol: string,
        outputsize: 'compact' | 'full' = 'compact'
    ): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for daily adjusted time series.');

        const params = {
            function: 'TIME_SERIES_DAILY_ADJUSTED',
            symbol,
            outputsize,
        };
        return this.fetchData(params);
    }

    public async getWeeklyTimeSeries(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for weekly time series.');

        const params = {
            function: 'TIME_SERIES_WEEKLY',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getWeeklyAdjustedTimeSeries(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for weekly adjusted time series.');

        const params = {
            function: 'TIME_SERIES_WEEKLY_ADJUSTED',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getMonthlyTimeSeries(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for monthly time series.');

        const params = {
            function: 'TIME_SERIES_MONTHLY',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getMonthlyAdjustedTimeSeries(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for monthly adjusted time series.');

        const params = {
            function: 'TIME_SERIES_MONTHLY_ADJUSTED',
            symbol,
        };
        return this.fetchData(params);
    }

    // SEARCH ENDPOINT
    public async searchSymbol(keywords: string): Promise<any> {
        if (!keywords) throw new Error('Keywords are required for symbol search.');

        const params = {
            function: 'SYMBOL_SEARCH',
            keywords,
        };
        return this.fetchData(params);
    }

    // FUNDAMENTAL DATA
    public async getCompanyOverview(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for company overview.');

        const params = {
            function: 'OVERVIEW',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getIncomeStatement(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for income statement.');

        const params = {
            function: 'INCOME_STATEMENT',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getBalanceSheet(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for balance sheet.');

        const params = {
            function: 'BALANCE_SHEET',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getCashFlow(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for cash flow.');

        const params = {
            function: 'CASH_FLOW',
            symbol,
        };
        return this.fetchData(params);
    }

    public async getEarnings(symbol: string): Promise<any> {
        if (!symbol) throw new Error('Symbol is required for earnings.');

        const params = {
            function: 'EARNINGS',
            symbol,
        };
        return this.fetchData(params);
    }

    // ECONOMIC INDICATORS
    public async getRealGDP(interval: 'quarterly' | 'annual'): Promise<any> {
        if (!interval) throw new Error('Interval is required for Real GDP.');

        const params = {
            function: 'REAL_GDP',
            interval,
        };
        return this.fetchData(params);
    }

    public async getInflation(): Promise<any> {
        const params = {
            function: 'INFLATION',
        };
        return this.fetchData(params);
    }

    public async getCPI(interval: 'monthly' | 'semiannual'): Promise<any> {
        if (!interval) throw new Error('Interval is required for CPI.');

        const params = {
            function: 'CPI',
            interval,
        };
        return this.fetchData(params);
    }

    public async getRetailSales(): Promise<any> {
        const params = {
            function: 'RETAIL_SALES',
        };
        return this.fetchData(params);
    }
}

export default AlphaVantageAPI;