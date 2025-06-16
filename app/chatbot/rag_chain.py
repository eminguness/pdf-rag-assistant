from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_chroma import Chroma
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import AzureChatOpenAI
import os
from pathlib import Path

# Ortam değişkenlerini yükle
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env")

# Azure OpenAI yapılandırması
AZURE_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")

# Azure LLM nesnesi
llm = AzureChatOpenAI(
    model="o4-mini-2",
    api_key=AZURE_API_KEY,
    azure_endpoint=AZURE_ENDPOINT,
    api_version="2024-12-01-preview",
    temperature=1
)

# Maskeleme klasöründeki belge.txt yolunu değişkene al
BELGE_TXT_PATH = Path(__file__).resolve().parent.parent.parent / "maskeleme" / "belge.txt"

def get_rag_answer(masked_question_file_path: str) -> str:
    try:
        # 1. Maskelenmiş dosyayı oku
        with open(masked_question_file_path, "r", encoding="utf-8") as f:
            question = f.read()

        # 2. Maskeleme belgesini yükle
        loader = TextLoader(str(BELGE_TXT_PATH))
        docs = loader.load()

        # 3. Belgeleri formatla
        def format_docs(docs):
            return "\n\n".join(doc.page_content for doc in docs)

        # 4. Metni parçala
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # 5. Embedding modeli ve vektör veritabanı
        embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        vectorstore = Chroma.from_documents(documents=splits, embedding=embedding_model)
        retriever = vectorstore.as_retriever()

        # 6. Prompt zinciri
        prompt = hub.pull("rlm/rag-prompt")

        # 7. RAG zinciri
        rag_chain = (
            {"context": retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | llm
            | StrOutputParser()
        )

        # 8. Soru ile zinciri çalıştır
        result = rag_chain.invoke(question)
        return result

    except Exception as e:
        return f"Hata oluştu: {str(e)}"
