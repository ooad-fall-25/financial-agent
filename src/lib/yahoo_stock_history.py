# main.py
import requests
from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta, date
from bs4 import BeautifulSoup
import time
import random
from typing import List, Dict
from enum import Enum
# Create an instance of the FastAPI class
app = FastAPI()

# Define the API endpoint
@app.get("/stock/{ticker}")
def get_stock_data(ticker: str, time_range: str = "1d", interval: str = "1m"):
    """
    Fetches the last 10 days of stock data for a given ticker from Yahoo Finance.
    """
    
    valid_ranges = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"]
    if time_range not in valid_ranges:
        raise HTTPException(status_code=400, detail="Invalid range parameter.")
    

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    
    params = {
        "range": time_range,
        "interval": interval,
    }

    headers = {
        # Using a robust User-Agent is key
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status() 
        data = response.json()

        # Check if the expected data is in the response
        result = data.get('chart', {}).get('result', [None])[0]
        if not result or 'timestamp' not in result:
            raise HTTPException(status_code=404, detail=f"No data found for ticker {ticker}")

        # --- Data Extraction and Formatting in Python ---
        timestamps = result['timestamp']
        indicators = result['indicators']['quote'][0]
        
        formatted_data = []
        for i in range(len(timestamps)):
            
            if (indicators['open'][i] is None or
                indicators['close'][i] is None or
                indicators['close'][i - 1] is None):
                continue
        
            if indicators['open'][i] is None:
                continue # Jumps to the next iteration of the loop
            
            dt_object = datetime.utcfromtimestamp(timestamps[i])
            date_str = ""
            if interval in ["1m", "2m", "5m", "15m", "30m", "1h"]:
                # Format for intraday includes time: "Sep 12, 09:30 AM"
                date_str = dt_object.strftime('%b %d, %I:%M %p')
            else:
                # Format for daily is just the date: "2025 September 12"
                date_str = dt_object.strftime('%Y %B %d')

            daily_change = indicators['close'][i] - indicators['close'][i-1]
            previous_close = indicators['close'][i-1]
            percentage_change = (daily_change / previous_close) * 100
            formatted_data.append({
                "daily_change": daily_change,
                "previous_close": previous_close,
                "percentage_change": percentage_change,
                "timestamp": timestamps[i],
                "date": date_str,
                "open": indicators['open'][i],
                "close": indicators['close'][i],
                "high": indicators['high'][i],
                "low": indicators['low'][i],
                "volume": indicators['volume'][i],
            })
            
        return formatted_data

    except requests.exceptions.HTTPError as http_err:
        # If Yahoo returns a 404 or other error, forward it
        raise HTTPException(status_code=http_err.response.status_code, detail=f"Error fetching data from Yahoo Finance for {ticker}")
    except Exception as e:
        # For any other errors (network, parsing, etc.)
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/company_name/{ticker}")
@app.get("/stock/{ticker}")
def get_company_name(ticker: str, industry=False):

    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        result = response.json().get('chart', {}).get('result', [None])[0]

        meta = result['meta']
        company_name = meta.get('longName', ticker)
        if industry:
            return company_name.split('Overview')[1].strip()
        else:
            return company_name.split('Overview')[0].strip()


    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred for ticker {ticker}: {http_err}")
        return None
    except Exception as e:
        print(f"An error occurred while scraping {ticker}: {e}")
        return None


@app.get("/stock-performance/{ticker}")
def get_stock_performance(ticker: str):
    """
    Fetches 5 years of historical data for a ticker and the S&P 500 benchmark (^GSPC)
    and calculates the YTD, 1-Year, 3-Year, and 5-Year performance returns.
    """
    benchmark_ticker = "^GSPC"
    
    # Helper function to fetch long-term data for a single ticker
    def fetch_long_term_data(symbol):
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        params = {"range": "5y", "interval": "1d"} # Fetch 5 years of daily data
        headers = {"User-Agent": "Mozilla/5.0"}
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        result = data.get('chart', {}).get('result', [None])[0]
        if not result or 'timestamp' not in result:
            raise HTTPException(status_code=404, detail=f"No 5-year data found for {symbol}")
        
        # Return a clean list of (timestamp, close_price) tuples
        return list(zip(result['timestamp'], result['indicators']['quote'][0]['close']))

    # Helper function to calculate return between two prices
    def calculate_return(start_price, end_price):
        if start_price is None or end_price is None or start_price == 0:
            return 0.0
        return ((end_price - start_price) / start_price) * 100

    try:
        # Fetch data for both the stock and the benchmark
        stock_data = fetch_long_term_data(ticker)
        benchmark_data = fetch_long_term_data(benchmark_ticker)

        # Get the most recent price for both
        latest_stock_price = stock_data[-1][1]
        latest_benchmark_price = benchmark_data[-1][1]

        # Find the prices at the required historical points
        def find_price_on_or_before(target_date, data):
            for ts, price in reversed(data):
                if date.fromtimestamp(ts) <= target_date:
                    return price
            return None

        today = date.today()
        ytd_start_date = date(today.year, 1, 1)
        year_ago = date(today.year - 1, today.month, today.day)
        three_years_ago = date(today.year - 3, today.month, today.day)
        
        # The 5-year price is just the first data point we have
        five_year_stock_price = stock_data[0][1]
        five_year_benchmark_price = benchmark_data[0][1]

        # Calculate returns
        performance_data = [
            {
                "period": "YTD Return",
                "stock_return": calculate_return(find_price_on_or_before(ytd_start_date, stock_data), latest_stock_price),
                "benchmark_return": calculate_return(find_price_on_or_before(ytd_start_date, benchmark_data), latest_benchmark_price)
            },
            {
                "period": "1-Year Return",
                "stock_return": calculate_return(find_price_on_or_before(year_ago, stock_data), latest_stock_price),
                "benchmark_return": calculate_return(find_price_on_or_before(year_ago, benchmark_data), latest_benchmark_price)
            },
            {
                "period": "3-Year Return",
                "stock_return": calculate_return(find_price_on_or_before(three_years_ago, stock_data), latest_stock_price),
                "benchmark_return": calculate_return(find_price_on_or_before(three_years_ago, benchmark_data), latest_benchmark_price)
            },
            {
                "period": "5-Year Return",
                "stock_return": calculate_return(five_year_stock_price, latest_stock_price),
                "benchmark_return": calculate_return(five_year_benchmark_price, latest_benchmark_price)
            }
        ]

        return performance_data

    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(status_code=http_err.response.status_code, detail=f"Error from Yahoo Finance for {ticker}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/stock-competitors/{ticker}")
def get_stock_competitors(ticker: str) -> List[Dict]:
    """
    Finds a list of similar stocks and fetches their data individually
    from a reliable API endpoint that does not require a crumb.
    """
    session = requests.Session()
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        # --- Step 1: Get the list of recommended competitor tickers ---
        recommendations_url = f"https://query1.finance.yahoo.com/v6/finance/recommendationsbysymbol/{ticker}"
        response_recs = session.get(recommendations_url, headers=headers, timeout=10)
        response_recs.raise_for_status()

        competitor_list = response_recs.json().get('finance', {}).get('result', [{}])[0].get('recommendedSymbols', [])
        if not competitor_list:
            return []

        # Limit to the top 5 for performance
        competitor_tickers = [rec['symbol'] for rec in competitor_list[:5]]

        # --- Step 2: Loop through tickers and fetch details one-by-one from the chart API ---
        formatted_competitors = []
        for comp_ticker in competitor_tickers:
            try:
                # Add a small, random delay to avoid being rate-limited
                time.sleep(random.uniform(0.2, 0.5))

                quote_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{comp_ticker}"
                quote_response = session.get(quote_url, headers=headers, timeout=10)
                quote_response.raise_for_status()

                result = quote_response.json().get('chart', {}).get('result', [None])[0]
                if not result or 'meta' not in result:
                    continue  # Skip if the response is malformed

                meta = result['meta']
                price = meta.get('regularMarketPrice', 0)
                prev_close = meta.get('chartPreviousClose', price)
                change_percent = ((price - prev_close) / prev_close * 100) if prev_close else 0

                formatted_competitors.append({
                    "ticker": comp_ticker,
                    "companyName": meta.get('shortName', comp_ticker),  # Use shortName from meta
                    "price": f"{price:.2f}",
                    "changePercent": f"{change_percent:+.2f}%",
                    "industry": meta.get('instrumentType', 'N/A')
                })

            except Exception as e:
                # If a single ticker fails, print a log and continue with the others
                print(f"Warning: Could not fetch details for '{comp_ticker}'. Reason: {e}")
                continue
        return formatted_competitors

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch competitor list: {str(e)}")


# Place this helper function in main.py
def format_time_ago(timestamp: int) -> str:
    """Converts a Unix timestamp into a 'time ago' string like '6h ago' or '1d ago'."""
    if not timestamp:
        return ""
    
    dt_object = datetime.fromtimestamp(timestamp)
    now = datetime.now()
    delta = now - dt_object

    if delta.days > 0:
        return f"{delta.days}d ago"
    elif (hours := delta.seconds // 3600) > 0:
        return f"{hours}h ago"
    elif (minutes := delta.seconds // 60) > 0:
        return f"{minutes}m ago"
    else:
        return "Just now"


@app.get("/stock-news/{ticker}")
def get_stock_news(ticker: str, count: int = 10):
    """
    Fetches recent news for a given stock ticker from the Yahoo Finance search API.
    """
    session = requests.Session()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    # This is the API endpoint Yahoo's frontend uses
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {"q": ticker, "newsCount": count}

    try:
        response = session.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        articles = data.get('news', [])
        if not articles:
            return []

        # Format the data into a clean structure for our frontend
        formatted_news = []
        for article in articles:
            # Safely get the thumbnail URL (it's often the highest resolution one)
            thumbnail_url = None
            if resolutions := article.get('thumbnail', {}).get('resolutions'):
                thumbnail_url = resolutions[-1]['url']

            formatted_news.append({
                "uuid": article.get('uuid'),
                "title": article.get('title'),
                "publisher": article.get('publisher'),
                "link": article.get('link'),
                "time_ago": format_time_ago(article.get('providerPublishTime')),
                "thumbnail_url": thumbnail_url
            })

        return formatted_news

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")


@app.get("/search-symbols/{query}")
def search_symbols(query: str, limit: int = 6):
    """
    Searches for stock symbols and returns a list of matching quotes.
    """
    session = requests.Session()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    # This is the dedicated search API endpoint
    url = "https://query1.finance.yahoo.com/v1/finance/search"
    params = {"q": query, "quotesCount": limit, "newsCount": 0} # We don't need news here

    try:
        response = session.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        quotes = data.get('quotes', [])
        if not quotes:
            return []

        # Format the data into a clean structure for our frontend
        formatted_results = []
        for quote in quotes:
            # We only want to show actual stocks, not ETFs, futures, etc.
            if quote.get('quoteType') == 'EQUITY':
                formatted_results.append({
                    "ticker": quote.get('symbol'),
                    "companyName": quote.get('longname', quote.get('shortname', '--')),
                    "assetType": quote.get('quoteType', '--'),
                    "exchange": quote.get('exchange', '--')
                })

        return formatted_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")
    


# Use an Enum to define and validate the allowed screener types
class ScreenerType(str, Enum):
    MOST_ACTIVE = "most_actives"
    TOP_GAINERS = "day_gainers"
    TOP_LOSERS = "day_losers"
    # You can add more screeners here as you discover their IDs
    FIFTY_TWO_WK_GAINERS = "recent_52_week_highs" 
    FIFTY_TWO_WK_LOSERS = "recent_52_week_lows"

@app.get("/market-discovery/{screener_type}")
def get_market_screener(screener_type: ScreenerType, count: int = 10) -> List[Dict]:
    """
    Fetches a list of stocks from a predefined Yahoo Finance screener.
    This powers the main discovery table for Most Active, Gainers, Losers, etc.
    """
    session = requests.Session()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    # The screener API endpoint
    url = "https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved"
    params = {
        "scrIds": screener_type.value,
        "count": count,
        "start": 0
    }

    try:
        response = session.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        quotes = data.get('finance', {}).get('result', [{}])[0].get('quotes', [])
        if not quotes:
            return []

        # Format the data into the structure needed by your frontend table
        formatted_results = []
        for quote in quotes:
            # Helper to safely get nested values
            def get_val(key, default=None):
                val = quote.get(key)
                # Yahoo sometimes returns empty dicts {} instead of numbers
                return val if isinstance(val, (int, float)) else default

            formatted_results.append({
                "ticker": quote.get('symbol'),
                "companyName": quote.get('longName', quote.get('shortName')),
                "price": get_val('regularMarketPrice'),
                "change": get_val('regularMarketChange'),
                "changePercent": get_val('regularMarketChangePercent'),
                "volume": get_val('regularMarketVolume'),
                "avgVolume3Month": get_val('averageDailyVolume3Month'),
                "marketCap": get_val('marketCap'),
                "peRatio": get_val('trailingPE'),
                "fiftyTwoWeekChangePercent": get_val('fiftyTwoWeekChangePercent')
            })

        return formatted_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")
    


@app.get("/market-trending")
def get_trending_tickers(count: int = 6) -> List[Dict]:
    """
    Fetches the current "Trending Tickers" from Yahoo Finance.
    This is perfect for the horizontal scroller at the top of the page.
    """
    session = requests.Session()
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

    try:
        # --- Step 1: Get the list of trending tickers ---
        trending_url = "https://query1.finance.yahoo.com/v1/finance/trending/US"
        trending_response = session.get(trending_url, headers=headers, timeout=10)
        trending_response.raise_for_status()

        quotes = trending_response.json().get('finance', {}).get('result', [{}])[0].get('quotes', [])
        if not quotes:
            return []


        # Extract just the ticker symbols, limited by the count
        trending_tickers = [q['symbol'] for q in quotes[:count]]

        # --- Step 2: Batch fetch the quote details for these tickers ---
        if not trending_tickers:
            return []
        formatted_results = []
        for ticker in trending_tickers:
            quote_url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
            quote_response = session.get(quote_url, headers=headers, timeout=10)
            quote_response.raise_for_status()

            results = quote_response.json().get('chart', {}).get('result', [None])[0]
            if not results:
                return []

            meta = results['meta']
            price = meta.get('regularMarketPrice', 0)
            prev_close = meta.get('chartPreviousClose', price)
            change_percent = ((price - prev_close) / prev_close * 100) if prev_close else 0
        # --- Step 3: Format the results for the frontend cards ---
            formatted_results.append({
                "ticker": ticker,
                "companyName": meta.get('shortName', ticker),  # Use shortName from meta
                "price": price,
                "changePercent": change_percent,
            })

        return formatted_results

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")
    
    
# To run this server, use the command in your terminal:
# uvicorn main:app --reload