# Aura Finance: An AI-Powered Data Extraction and News Aggregation Agent

### Introduction
In today’s rapidly evolving financial markets, investors and researchers are confronted with an overwhelming volume of news and financial data. Manual filtering and organization are both time-consuming and prone to omissions of critical information. To address this challenge, we are developing the Aura Finance, an intelligent agent that automates the collection, filtering, and analysis of financial data and news from a multitude of sources. This powerful tool is designed to provide users with structured, actionable insights, thereby supporting informed investment decision-making and academic research.

### Core Features
Our platform is designed to deliver a comprehensive suite of tools for financial analysis:

*   **AI-Powered Financial Agent:** At the heart of our project is an autonomous agent that can understand and execute complex user queries. It can plan tasks, invoke external tools, and deliver requested financial data or news in a conversational manner.
*   **Real-time and Historical Market Data:** Integrate with various financial data APIs to provide up-to-the-minute and historical data for stocks, funds, and cryptocurrencies, including prices, trading volume, and performance metrics.
*   **Comprehensive News Aggregation:** Automatically retrieve financial news from multiple reputable sources. The agent provides analytical summaries and allows for customized queries based on specific companies or industries.
*   **Intuitive User Interface:** A clean and user-friendly interface to display dialogues, statistical results, and data visualizations. The UI also provides transparency into the agent's task-planning process, allowing users to understand its workflow.
*   **Personalized Experience:** Users can create accounts, customize settings, and view their query history.

### Screenshots
Here are some glimpses of the Aura Finance in action:
- **Real-time and Historical Market Data**
  ![Real-time and Historical Market Data Screenshot](./public/market-data-screenshot.png)
  ![Company Stock Chart Screenshot](./public/company-stock-chart-screenshot.png)
  ![Company Performance Screenshot](./public/company-performance-screenshot.png)

- **Comprehensive News Aggregation** 
  ![Comprehensive News Aggregation Screenshot](./public/news-aggregation-screenshot.png)

- **AI-Powered Financial Agent** 
  ![AI-Powered Financial Agent Screenshot](./public/ai-agent-screenshot.png)

### Key Technologies
*   **Frontend & Backend:** Next.js, React, TypeScript
*   **AI & Machine Learning:** OpenAI
*   **Data Sources:** Alpaca, FinnHub, Polygon
*   **Authentication:** Clerk

### Getting Started

To get a local copy up and running, follow these simple steps.


**Installation**

1.  Clone the repo
    ```sh
    git clone https://github.com/your_repository_link.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```
3.  Set up your environment variables. Create a `.env.local` file in the root and add the necessary API keys and configuration.
    ```
    # Example
    FINANCIAL_DATA_API_KEY=your_api_key
    NEWS_API_KEY=your_api_key
    ```
4.  Run the development server:
    ```sh
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Project Roadmap

We are continuously working to enhance the capabilities of the Aura Finance. Our future development plans include:

*   **Advanced AI Agent Capabilities:**
    *   Implementing a "thought process" visualization to show how the AI plans and executes tasks.
    *   Enabling streaming responses for a more interactive and real-time feel.
    *   Expanding the set of tools available to the AI agent for more comprehensive analysis.
*   **Enhanced Data Analysis:**
    *   Allowing users to upload personal financial reports (PDF, Excel) for intelligent data extraction and analysis.
    *   Adding more sophisticated data visualization options.
*   **Personalization and Collaboration:**
    *   Introducing user-specific dashboards and watchlists.
    *   Adding features for team collaboration and sharing of insights.
*   **Multi-language Support:**
    *   Incorporating news sources in multiple languages with automated translation.


