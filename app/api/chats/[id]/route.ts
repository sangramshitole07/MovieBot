import { NextRequest, NextResponse } from 'next/server';
import { connect } from '@/lib/dbConfig';
import Chat from '@/models/chatModel';
import { getDataFromToken } from '@/helpers/getDataFromToken';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const chat = await Chat.findById(params.id);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    // Check if user owns this chat (skip for test mode)
    if (!isTestMode && chat.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json({ chat });
  } catch (error: any) {
    console.error('Error fetching chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { messages } = await request.json();
    
    // First check if chat exists and user owns it
    const existingChat = await Chat.findById(params.id);
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    if (!isTestMode && existingChat.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const updatedChat = await Chat.findByIdAndUpdate(
      params.id,
      { 
        messages,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      chat: updatedChat 
    });
  } catch (error: any) {
    console.error('Error updating chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // First check if chat exists and user owns it
    const existingChat = await Chat.findById(params.id);
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    
    if (!isTestMode && existingChat.userId.toString() !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deletedChat = await Chat.findByIdAndDelete(params.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Chat deleted successfully' 
    });
  } catch (error: any) {
    console.error('Error deleting chat:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}