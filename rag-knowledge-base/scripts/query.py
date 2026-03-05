import os
import sys
import json
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def query_rag(question):
    vector_store_path = "rag-knowledge-base/vector-store"
    
    # Initialize embeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'}
    )
    
    # Load FAISS index
    if not os.path.exists(os.path.join(vector_store_path, "index.faiss")):
        return []
        
    vector_db = FAISS.load_local(vector_store_path, embeddings, allow_dangerous_deserialization=True)
    
    # Search for top 5 chunks
    docs = vector_db.similarity_search(question, k=5)
    
    results = []
    for doc in docs:
        results.append({
            "content": doc.page_content,
            "source": os.path.basename(doc.metadata.get("source", "Unknown"))
        })
        
    return results

if __name__ == "__main__":
    if len(sys.argv) > 1:
        query = sys.argv[1]
        results = query_rag(query)
        print(json.dumps(results))
