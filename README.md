# Real-Time ISS & News AI Dashboard

A modern real-time dashboard that tracks the International Space Station, displays live space/science/technology news, and includes an AI chatbot that answers only from the dashboard data.

## Live Demo

🔗 https://iss-news-ai-dashboard.vercel.app/

## GitHub Repository

🔗 https://github.com/hydra187/iss-news-ai-dashboard

## Features

- Real-time ISS location tracking
- Interactive Leaflet map
- ISS trajectory path
- ISS speed calculation using Haversine formula
- People in space section
- Latest news dashboard
- Search and sort news articles
- News distribution chart
- ISS speed line chart
- AI chatbot using dashboard context
- Dark and light mode
- LocalStorage caching
- Responsive UI
- Error handling and loading states

## Tech Stack

- React
- Vite
- JavaScript
- CSS
- Leaflet / React Leaflet
- Chart.js / React Chart.js
- Hugging Face Inference API
- News API
- Open Notify API
- Vercel

## APIs Used

### ISS Location API

Used to fetch the current location of the International Space Station.

### Astronauts API

Used to fetch the number of people currently in space.

### News API

Used to fetch latest news articles related to science and technology.

### Hugging Face API

Used to power the chatbot with an instruction-following LLM.

## AI Model Used

I used `mistralai/Mistral-7B-Instruct-v0.2` because it is an instruction-tuned model that works well for chatbot-style responses. It can follow strict prompts and answer based only on the provided dashboard data, which makes it suitable for this project.

## Project Highlights

This project combines real-time API data, maps, data visualization, local caching, and AI integration in one dashboard. The chatbot is designed to avoid general internet answers and respond only using the current ISS and news data available inside the app.

## Environment Variables

Create a `.env` file in the root folder:

```env
VITE_NEWS_API_KEY=your_news_api_key
VITE_AI_TOKEN=your_huggingface_token
