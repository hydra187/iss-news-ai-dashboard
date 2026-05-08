import { HfInference } from "@huggingface/inference";

const getHf = () => {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    throw new Error("Missing Hugging Face API Token (VITE_AI_TOKEN)");
  }
  return new HfInference(token);
};

export const generateChatResponse = async (userMessage, dashboardData, chatHistory) => {
  try {
    const hf = getHf();
    
    // Construct the context prompt
    const systemPrompt = `You are a helpful AI assistant for a real-time dashboard. 
RULES:
1. You can ONLY answer questions based on the provided dashboard data below.
2. If the user asks something not related to the dashboard data, politely decline and say you only have knowledge about the dashboard.
3. No internet knowledge, no guessing.

DASHBOARD DATA:
- ISS Current Location: Lat ${dashboardData.iss?.lat || 'unknown'}, Lon ${dashboardData.iss?.lon || 'unknown'}
- ISS Current Speed: ${dashboardData.iss?.speed ? dashboardData.iss.speed.toFixed(2) + ' km/h' : 'unknown'}
- ISS Nearest Location: ${dashboardData.iss?.locationName || 'unknown'}
- Astronauts in Space: ${dashboardData.iss?.peopleCount || 0} (${(dashboardData.iss?.peopleNames || []).join(', ')})
- News Articles Summary: There are ${dashboardData.news?.length || 0} articles currently loaded.
${(dashboardData.news || []).map((n, i) => `  ${i+1}. ${n.title} (Source: ${n.source?.name || 'Unknown'})`).join('\n')}
`;

    // Map history to the format expected by chatCompletion
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    chatHistory.forEach(msg => {
      // Don't duplicate the first assistant greeting as a prompt issue
      if (msg.role === 'assistant' || msg.role === 'user') {
         messages.push({ role: msg.role, content: msg.content });
      }
    });

    messages.push({ role: "user", content: userMessage });

    const response = await hf.chatCompletion({
      model: 'Qwen/Qwen2.5-72B-Instruct',
      messages: messages,
      max_tokens: 150,
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Chatbot error:", error);
    throw error;
  }
};
