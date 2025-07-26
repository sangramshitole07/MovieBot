import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function getGroqChatCompletion(
  query: string,
  context: string[]
): Promise<string> {
  // Check if API key is available
  if (!process.env.GROQ_API_KEY) {
    console.warn('GROQ_API_KEY not found, using fallback response');
    return generateFallbackResponse(query, context);
  }

  const contextText = context.join('\n\n');
  
  const prompt = `Based on the following CSV data context (ranked by relevance), please answer the user's question. Be helpful and specific, referencing the data when relevant. The context is ordered by similarity to the user's query, with the most relevant information first.

Context from CSV:
${contextText}

User Question: ${query}

Please provide a comprehensive answer based on the context provided. If the context doesn't contain relevant information, please indicate that and provide general guidance if possible.

Answer:`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that answers questions based on CSV data. The context provided is ranked by relevance using semantic similarity. Provide clear, accurate responses using the provided context, prioritizing information from the most relevant (first) entries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-70b-8192',
      temperature: 0.3,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
  } catch (error) {
    console.error('Error generating response with Groq:', error);
    console.warn('Groq API unavailable, using fallback response');
    return generateFallbackResponse(query, context);
  }
}

/**
 * Generates a fallback response when Groq API is unavailable
 */
function generateFallbackResponse(query: string, context: string[]): string {
  const hasContext = context.length > 0;
  
  if (hasContext) {
    return `I understand you're asking: "${query}"\n\nBased on the available CSV data context (${context.length} relevant entries found), I can see there is relevant information, but I'm currently unable to process it due to API connectivity issues. Please ensure your GROQ_API_KEY is valid and try again.\n\nFor now, I can confirm that your CSV data has been processed and is available for analysis once the connection is restored. The system found relevant data entries that match your query.`;
  } else {
    return `I understand you're asking: "${query}"\n\nI'm currently unable to access external AI services to provide a detailed response. This could be due to:\n\n1. Missing or invalid API keys\n2. Network connectivity issues\n3. Temporary service outages\n\nPlease check your API configuration and try again. If you've uploaded CSV data, make sure to upload it again once the services are restored.`;
  }
}