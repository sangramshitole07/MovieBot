import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import Chat from '@/models/chatModel';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET() {
  try {
    await connect();
    
    // Get all chats for the authenticated user, sorted by most recent
    const chats = await Chat.find()
      .sort({ updatedAt: -1 })
      .select('_id title createdAt updatedAt messages');
    
    return NextResponse.json({ chats });
  } catch (error: any) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connect();
    
    // Get user ID from token, or use test user ID if in test mode
    let userId;
    const url = new URL(request.url);
    const isTestMode = url.searchParams.get('test') === 'true';
    
    if (isTestMode) {
      userId = 'test-user-id';
    } else {
      try {
        userId = await getDataFromToken(request);
      } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }
    
    const { title, messages } = await request.json();
    
    const newChat = new Chat({
      title,
      messages,
      userId,
    });
    
    const savedChat = await newChat.save();
    
    return NextResponse.json({ 
      success: true, 
      chat: savedChat 
    });
  } catch (error: any) {
    console.error('Error creating chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}