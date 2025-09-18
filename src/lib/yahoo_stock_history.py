# main.py
import requests
from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta, date
from bs4 import BeautifulSoup

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
def get_company_name(ticker: str):
    url = f"https://finance.yahoo.com/quote/{ticker}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")

        def safe_get_text(tag, default="N/A"):
            return tag.get_text(strip=True) if tag else default

        # --- Extract company name + ticker (always in <h1>) ---
        h1_tag = soup.find("h2")
        company_name = safe_get_text(h1_tag)
        cleaned_company_name = company_name.split('Overview')[0].strip()

        return cleaned_company_name

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
    
# To run this server, use the command in your terminal:
# uvicorn main:app --reload