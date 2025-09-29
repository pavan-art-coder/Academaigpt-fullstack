// const Documnet=require('../models/Document')

// const uploadDocument=async(req,res)=>{
//     try{
//         if(!req.file){
//             return res.status(400).json({message:'No file uploaded'})
//         }
//         const newDocument=await Documnet.create({
//             name:req.file.originalname,
//             path:req.file.path,
//             owner:req.user.id
//         })
//         res.status(201).json({message:'Document uploaded successfully',document:newDocument})
//     }catch(error){
//         console.error('Error uploading document:',error)
//         res.status(500).json({message:'Server error'})
//     }   
// }
// const getUserDocuments=async(req,res)=>{
//     try{
//         const documents=await Documnet.find({owner:req.user.id})
//         res.status(200).json({documents})
//     }catch(error){
//         console.error('Error fetching documents:',error)
//         res.status(500).json({message:'Server error'})
//     }
// }
// module.exports={uploadDocument,getUserDocuments}

// routes/documentRoutes.js
const Document = require('../models/Document');
const fs = require('fs/promises');
const pdf = require('pdf-parse');
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const vectorStoreCache = require('../services/langchainService'); // Our in-memory cache

// --- THIS IS OUR NEW BACKGROUND PROCESSING FUNCTION ---
const processDocumentInBackground = async (documentId, filePath) => {
    console.log(`[BACKGROUND JOB STARTED] for document ID: ${documentId}`);
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        const fullText = data.text;

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const docs = await splitter.createDocuments([fullText]);
        console.log(`[BACKGROUND] Split document into ${docs.length} chunks.`);

        const embeddings = new GoogleGenerativeAIEmbeddings();
        
        // BATCH EMBEDDING: This is much faster than one by one
        console.log(`[BACKGROUND] Creating embeddings for ${docs.length} chunks...`);
        const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
        
        vectorStoreCache.set(documentId.toString(), vectorStore);
        console.log(`[BACKGROUND] In-memory vector store created and cached.`);

        // Update the document's status in the DB to 'ready'
        await Document.findByIdAndUpdate(documentId, { status: 'ready' });
        console.log(`[BACKGROUND JOB FINISHED] Document ${documentId} is ready.`);

    } catch (error) {
        console.error(`[BACKGROUND JOB FAILED] for document ${documentId}:`, error);
        // Update the document's status to 'error'
        await Document.findByIdAndUpdate(documentId, { status: 'error' });
    } finally {
        // Clean up the temporary file from the /uploads folder
        try {
            await fs.unlink(filePath);
            console.log(`[BACKGROUND] Cleaned up temporary file: ${filePath}`);
        } catch (cleanupError) {
            console.error(`[BACKGROUND] Failed to clean up file ${filePath}:`, cleanupError);
        }
    }
};

const uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    try {
        // 1. Immediately save the initial document metadata
        const newDocument = await Document.create({
            name: req.file.originalname,
            storagePath: req.file.path,
            owner: req.user._id,
            status: 'processing', // Initial status
        });

        // 2. Respond to the user IMMEDIATELY
        res.status(202).json({ // 202 Accepted means "I've got it, and I'm working on it"
            message: 'File upload accepted! Processing in the background.',
            document: {
                _id: newDocument._id,
                name: newDocument.name,
                status: 'processing',
            }
        });

        // 3. Start the heavy processing in the background and DO NOT wait for it
        processDocumentInBackground(newDocument._id, req.file.path);

    } catch (error) {
        console.error("❌ UPLOAD CONTROLLER ERROR:", error);
        res.status(500).json({ message: 'Server error during initial file upload.' });
    }
};

const getDocuments = async (req, res) => {
    try {
        // Now we return the status of each document as well
        const documents = await Document.find({ owner: req.user.id }).select('name status createdAt');
        res.status(200).json({ documents });
    } catch (error) {
        console.error("GET DOCUMENTS ERROR:", error);
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
};

module.exports = { uploadDocument, getDocuments };