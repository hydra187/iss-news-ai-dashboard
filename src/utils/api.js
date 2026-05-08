// Calculate distance using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const fetchISSLocation = async () => {
  try {
    const response = await fetch(`/api/iss`);
    const data = await response.json();
    return {
      lat: parseFloat(data.iss_position.latitude),
      lon: parseFloat(data.iss_position.longitude),
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error("Error fetching ISS location:", error);
    throw error;
  }
};

export const fetchAstronauts = async () => {
  try {
    const response = await fetch(`/api/astros`);
    const data = await response.json();
    return {
      count: data.number,
      people: data.people
    };
  } catch (error) {
    console.error("Error fetching astronauts:", error);
    throw error;
  }
};

export const fetchLocationName = async (lat, lon) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
    if (!response.ok) return "Ocean / Unknown Area";
    const data = await response.json();
    if (data.error) return "Ocean / Unknown Area";
    
    return data.address.city || data.address.town || data.address.village || data.address.country || "Unknown Area";
  } catch (error) {
    return "Ocean / Unknown Area";
  }
};

export const fetchNews = async (category = 'general') => {
  try {
    // Route through our own serverless function to avoid CORS issues on Vercel
    const url = `/api/news?category=${category}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.articles) {
      return data.articles.map(article => ({
        ...article,
        urlToImage: article.image
      }));
    } else {
      throw new Error(data.errors?.[0] || data.error || 'Failed to fetch news');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
