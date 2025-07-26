import { NextRequest, NextResponse } from 'next/server';
import { generateEmbeddings, generateSimilarityScores } from '@/lib/huggingface';

const HF_API_URL = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/sentence-similarity";

export async function GET() {
  try {
    console.log('🧪 Testing Hugging Face sentence similarity API connection...');
    
    // Check if API key exists
    const apiKey = process.env.HF_API_KEY || process.env.HF_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ 
        success: false,
        error: 'HF_API_KEY or HF_TOKEN not found in environment variables',
        details: 'Please check your .env.local file and ensure HF_API_KEY or HF_TOKEN is set'
      }, { status: 400 });
    }

    console.log('✅ HF_API_KEY/HF_TOKEN found in environment');
    console.log('🔑 API Key preview:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);

    // Test both direct API call and our wrapper functions
    const testTexts = [
      'Hello, this is a test message for Hugging Face API',
      'This is another test sentence for comparison',
      'CSV data analysis and processing'
    ];
    const queryText = 'Test message for API validation';
    
    console.log('📤 Testing direct Hugging Face sentence similarity API...');
    const startTime = Date.now();
    
    // Test direct API call first
    const directResponse = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: {
          source_sentence: queryText,
          sentences: testTexts
        }
      }),
    });
    
    if (!directResponse.ok) {
      const errorText = await directResponse.text();
      throw new Error(`Direct API call failed (${directResponse.status}): ${errorText}`);
    }
    
    const directResult = await directResponse.json();
    
    // Test our wrapper functions
    const wrapperEmbeddings = await generateEmbeddings(testTexts);
    const similarityScores = await generateSimilarityScores(queryText, testTexts);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (Array.isArray(directResult) && directResult.length > 0 && wrapperEmbeddings && wrapperEmbeddings.length > 0) {
      console.log('✅ Hugging Face sentence similarity API test successful!');
      return NextResponse.json({
        success: true,
        message: 'Hugging Face sentence similarity API is working correctly!',
        details: {
          apiKeyStatus: 'Valid',
          endpoint: HF_API_URL,
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          responseTime: `${responseTime}ms`,
          embeddingDimensions: wrapperEmbeddings[0]?.length || 0,
          testTexts: testTexts,
          queryText: queryText,
          directSimilarityScores: directResult,
          wrapperSimilarityScores: similarityScores,
          wrapperEmbeddingPreview: wrapperEmbeddings[0].slice(0, 5).map(n => n.toFixed(4)),
          apiVersion: 'Hugging Face sentence similarity endpoint'
        }
      });
    } else {
      console.log('❌ Hugging Face sentence similarity API returned empty or invalid results');
      return NextResponse.json({
        success: false,
        error: 'Invalid response from Hugging Face sentence similarity API',
        details: 'API returned empty or malformed results'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Hugging Face sentence similarity API test failed:', error);
    
    // Parse different types of errors
    let errorMessage = 'Unknown error occurred';
    let errorDetails = error.message;
    let statusCode = 500;

    if (error.message.includes('Invalid HF_API_KEY') || error.message.includes('Invalid HF_TOKEN')) {
      errorMessage = 'Invalid Hugging Face API Key';
      errorDetails = 'The provided HF_API_KEY/HF_TOKEN is not valid. Please check your API key in .env.local';
      statusCode = 401;
    } else if (error.message.includes('Access denied')) {
      errorMessage = 'Access Denied';
      errorDetails = 'Your API key does not have permission to access this model';
      statusCode = 403;
    } else if (error.message.includes('fetch failed') || error.message.includes('Network error')) {
      errorMessage = 'Network Connection Error';
      errorDetails = 'Unable to connect to Hugging Face sentence similarity API. Check your internet connection.';
      statusCode = 503;
    } else if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = 'Rate Limit Exceeded';
      errorDetails = 'Too many requests to Hugging Face sentence similarity API. Please wait and try again.';
      statusCode = 429;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      rawError: error.message,
      endpoint: HF_API_URL
    }, { status: statusCode });
  }
}