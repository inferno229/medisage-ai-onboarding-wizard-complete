import os
import sys
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def ingest_docs():
    # Folder paths
    books_path = "rag-knowledge-base/books"
    vector_store_path = "rag-knowledge-base/vector-store"
    
    # Load all PDFs from subdirectories
    loader = DirectoryLoader(books_path, glob="./**/*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    
    # Split documents into chunks
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100
    )
    texts = text_splitter.split_documents(documents)
    
    # Initialize embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    
    # Create and save FAISS index
    vector_db = FAISS.from_documents(texts, embeddings)
    vector_db.save_local(vector_store_path)
    print(f"Ingested {len(texts)} chunks into {vector_store_path}")

if __name__ == "__main__":
    ingest_docs()
