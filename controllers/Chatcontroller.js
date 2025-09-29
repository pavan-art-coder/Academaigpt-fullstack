const config = require('../config');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { createStuffDocumentsChain } = require("langchain/chains/combine_documents");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

// --- FIX: Correctly import the cache and database models ---
const vectorStoreCache = require('../services/langchainService'); 
const Chat = require('../models/Chatsession');
const Document = require('../models/Document');

/**
 * Helper to create the AI model consistently.
 */
const createModel = (temperature = 0.3) => {
    const apiKey = config.googleApiKey;
    if (!apiKey) {
        throw new Error("❌ GOOGLE_API_KEY is missing. Please check your .env file.");
    }
    return new ChatGoogleGenerativeAI({
        modelName: "gemini-2.5-flash",
        apiKey: apiKey,
        temperature,
    });
};

/**
 * Fetches all chat sessions for the logged-in user.
 */
const getChatSessions = async (req, res) => {
    try {
        const chats = await Chat.find({ owner: req.user.id }).sort({ updatedAt: -1 });
        res.status(200).json({ chats });
    } catch (error) {
        console.error("❌ GET CHAT SESSIONS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch chat sessions." });
    }
};

/**
 * Creates a new chat session.
 */
const createNewChat = async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) {
            return res.status(400).json({ message: "A document ID is required to start a new chat." });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: "Document not found." });
        }
    
        const newChat = await Chat.create({
            title: `Chat about ${document.name.substring(0, 20)}...`, // Truncate long names
            document: documentId,
            owner: req.user.id,
            messages: [{ 
                sender: 'ai',
                text: `Hello! I'm ready to discuss "${document.name}".`
            }],
        });

        res.status(201).json(newChat);

    } catch (error) {
        console.error("❌ CREATE NEW CHAT ERROR:", error);
        res.status(500).json({ message: "Failed to create new chat." });
    }
};

/**
 * Handles a new message in an existing chat.
 */
const handleChatMessage = async (req, res) => {
    try {
        const { message, documentId } = req.body; // Frontend sends documentId
        if (!message || !documentId) {
            return res.status(400).json({ error: "Message and documentId are required" });
        }

        const loadedVectorStore = vectorStoreCache.get(documentId.toString());
        if (!loadedVectorStore) {
            return res.status(404).json({ error: "Document not processed or server restarted. Please re-upload." });
        }
        
        const retriever = loadedVectorStore.asRetriever();
        const docs = await retriever.getRelevantDocuments(message);

        if (message.toLowerCase().includes("who has made you")) {
            return res.status(200).json({ text: "One and Only My Boss PAVAN N JADHAV" });
        }
        
        const prompt = ChatPromptTemplate.fromTemplate(`Answer the user's question based ONLY on the following context:
        Context: {context}
        Question: {input}`);

        const model = createModel();
        const chain = await createStuffDocumentsChain({ llm: model, prompt });
        const result = await chain.invoke({ input: message, context: docs });
        
        // TODO: Save the user message and AI response to the Chat in the database.
        
        res.status(200).json({ text: result });

    } catch (error) {
        console.error("❌ Chat error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Generates a summary.
 */
const generateSummary = async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) return res.status(400).json({ error: "DocumentId is required" });

        const loadedVectorStore = vectorStoreCache.get(documentId.toString());
        if (!loadedVectorStore) {
            return res.status(404).json({ error: "Document not processed. Please re-upload." });
        }
        
        const retriever = loadedVectorStore.asRetriever(100); 
        const docs = await retriever.getRelevantDocuments("Provide a full and detailed summary of the entire document.");

        const summaryPrompt = ChatPromptTemplate.fromTemplate(`You are an expert summarizer. Create a concise, well-structured summary of the following document. Use bullet points for key topics.
        Document Content: {context}
        Your Summary:`);

        const model = createModel(0.2); 
        const chain = await createStuffDocumentsChain({ llm: model, prompt: summaryPrompt });
        const result = await chain.invoke({ context: docs });

        res.status(200).json({ content: result });

    } catch (error) {
        console.error("❌ Summary error:", error);
        res.status(500).json({ error: "Server error generating summary." });
    }
};

/**
 * Generates a quiz.
 */
const generateQuiz = async (req, res) => {
    try {
        const { documentId } = req.body;
        if (!documentId) return res.status(400).json({ error: "DocumentId is required" });

        const loadedVectorStore = vectorStoreCache.get(documentId.toString());
        if (!loadedVectorStore) {
            return res.status(404).json({ error: "Document not processed. Please re-upload." });
        }
        
        const retriever = loadedVectorStore.asRetriever(100);
        const docs = await retriever.getRelevantDocuments("Create a quiz based on the key concepts in this document.");

        const quizPrompt = ChatPromptTemplate.fromTemplate(`You are a quiz master. Create 5 multiple-choice questions (4 options each) based ONLY on the following text. Mark the correct answer for each question with an asterisk (*).
        Text: {context}
        Your 5-Question Quiz:`);

        const model = createModel(0.7); 
        const chain = await createStuffDocumentsChain({ llm: model, prompt: quizPrompt });
        const result = await chain.invoke({ context: docs });

        res.status(200).json({ content: result });

    } catch (error) {
        console.error("❌ Quiz error:", error);
        res.status(500).json({ error: "Server error generating quiz." });
    }
};

module.exports = {
    getChatSessions,
    createNewChat,
    handleChatMessage, 
    generateSummary,
    generateQuiz,
};