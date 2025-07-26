RAG Chatbot with Next.js, Pinecone, Groq, and Hugging Face
This project develops a Retrieval-Augmented Generation (RAG) based chatbot designed to analyze data from CSV files (e.g., IMDb movie datasets) and provide intelligent answers based on the ingested information. Users can upload their own CSV files, which are then processed, embedded, and stored in a vector database for efficient retrieval.

Features
CSV Data Ingestion: Upload CSV files to populate the knowledge base.

Text Embedding: Utilizes Hugging Face's sentence-transformers/all-MiniLM-L6-v2 for generating high-quality text embeddings.

Vector Database Integration: Stores and retrieves text embeddings efficiently using Pinecone.

LLM Inference: Leverages the Groq API for fast and accurate large language model responses.

Retrieval-Augmented Generation (RAG): Enhances LLM responses by retrieving relevant context from the vector database.

User Management: Handles user authentication, profiles, and chat history using MongoDB.

Interactive Chat UI: Built with Next.js for a responsive and intuitive user experience.

Tech Stack
Front-end Framework: Next.js

Vector Database: Pinecone

LLM API: Groq

Embeddings: Hugging Face (via sentence-transformers/all-MiniLM-L6-v2)

Database: MongoDB

Optional: Langchain (for RAG pipeline streamlining)

Prerequisites
Before you begin, ensure you have the following installed:

Node.js (LTS version recommended)

npm or Yarn (Node.js package manager)

Git

You will also need API keys and accounts for the following services:

Pinecone API Key & Environment: Sign up at Pinecone to get your API key and environment name.

Groq API Key: Obtain your API key from Groq.

Hugging Face Access Token: While sentence-transformers models often work without one for local inference, you might need a Hugging Face token if you hit rate limits or use specific models requiring authentication. You can get one from your Hugging Face profile settings.

MongoDB Connection String: A MongoDB Atlas URI or a local MongoDB instance connection string.

Installation
Follow these steps to set up and run the project locally:

1. Clone the Repository
First, clone the project repository to your local machine:

git clone <your-repository-url>
cd <your-project-folder>

Replace <your-repository-url> with the actual URL of your Git repository and <your-project-folder> with the name of the cloned directory.

2. Set Up Environment Variables
Create a .env.local file in the root directory of your project (where package.json is located) and add the following environment variables. Replace the placeholder values with your actual API keys and connection strings.

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=your_pinecone_index_name # e.g., "movie-data"

# Groq
GROQ_API_KEY=your_groq_api_key

# Hugging Face (Optional, but good practice for authentication)
HF_ACCESS_TOKEN=your_huggingface_access_token

# MongoDB
MONGODB_URI=your_mongodb_connection_string # e.g., mongodb://localhost:27017/chatbot_db or your Atlas URI

# NextAuth.js (for authentication, if used)
NEXTAUTH_SECRET=your_nextauth_secret_long_random_string # Generate a strong random string
NEXTAUTH_URL=http://localhost:3000

Note: For NEXTAUTH_SECRET, you can generate a random string using a tool or a command like openssl rand -base64 32 in your terminal.

3. Install Dependencies
Navigate to the project root directory in your terminal and install the Node.js dependencies:

npm install
# or
yarn install

4. Run the Development Server
Once the dependencies are installed, you can start the Next.js development server:

npm run dev
# or
yarn dev

The application will now be running on http://localhost:3000. Open this URL in your web browser to access the chatbot.

Usage
Register/Login: If user authentication is implemented, register a new account or log in.

Upload CSV: Navigate to the CSV upload section (this will be part of your UI). Upload your desired CSV file (e.g., IMDb movie data). The backend will process this file, embed its content, and store it in your Pinecone index.

Start Chatting: Once the data is processed, you can start asking questions related to the content of your uploaded CSV file in the chat interface. The chatbot will retrieve relevant information and generate responses.