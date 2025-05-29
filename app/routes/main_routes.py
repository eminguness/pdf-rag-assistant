from flask import Blueprint, render_template, request, jsonify
from app.chatbot.rag_chain import get_rag_answer  # LangChain tarafındaki fonksiyonu import ediyoruz

main_routes = Blueprint("main_routes", __name__)

@main_routes.route("/")
def index():
    return render_template("index.html")

@main_routes.route("/register")
def register():
    return render_template("register.html")

@main_routes.route("/login")
def login():
    return render_template("login.html")

@main_routes.route("/kullanici_girisi")
def kullanici_sayfasi():
    return render_template("kullanici_girisi.html")

# Kullanıcının sorusunu LLM'e gönder ve cevabı dön
@main_routes.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    # RAG sisteminden cevap al
    answer = get_rag_answer(question)

    return jsonify({"answer": answer})