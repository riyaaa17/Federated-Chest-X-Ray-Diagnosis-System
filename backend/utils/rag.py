import os
from dotenv import load_dotenv
from langchain.embeddings import HuggingFaceEmbeddings
from pinecone import Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_retrieval_chain

# Load env variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Load the HuggingFace embeddings model
model_name = "sentence-transformers/all-MiniLM-L6-v2"
embedding = HuggingFaceEmbeddings(model_name=model_name)

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)
index_name = "medical-chatbot"    
index = pc.Index(index_name)

# pinecone vector DB
docsearch = PineconeVectorStore(
    index_name=index_name,
    embedding=embedding
)

# Creates a retriver that fetches the top 3 most similar document chunks from the vector DB
retriever = docsearch.as_retriever(
    search_type="similarity", 
    search_kwargs={"k":3}
)

# Load openai model
chatModel = ChatOpenAI(model="gpt-4o")

# Defining prompt template using retrieved cotext
system_prompt = (
    "You are an Medical assistant for question-answering tasks. "
    "Use the following pieces of retrieved context to answer "
    "the question. If you don't know the answer, say that you "
    "don't know. Use three sentences maximum and keep the "
    "answer concise."
    "\n\n"
    "{context}"
)

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}")
    ]
)

# Create QA chain that generates answers from retrieved documents
question_answer_chain = create_stuff_documents_chain(chatModel, prompt)

# Build full pipeline by combining retriever and QA chain
rag_chain = create_retrieval_chain(retriever, question_answer_chain)


# Function to ask question
def ask_question(query: str):
    response = rag_chain.invoke({"input":query})
    return response["answer"]