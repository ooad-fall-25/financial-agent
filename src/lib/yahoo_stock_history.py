# main.py
import requests
from fastapi import FastAPI, HTTPException
from datetime import datetime, timedelta

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
            
            formatted_data.append({
                "timestamp": timestamps[i],
                "date": datetime.utcfromtimestamp(timestamps[i]).strftime('%Y %B %d'),
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


# To run this server, use the command in your terminal:
# uvicorn main:app --reload