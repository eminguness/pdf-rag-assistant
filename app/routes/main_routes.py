import os
import json
from flask import Blueprint, render_template, request, jsonify
from app.chatbot.rag_chain import get_rag_answer  # LangChain fonksiyonu

main_routes = Blueprint("main_routes", __name__)

# Ana sayfa
@main_routes.route("/")
def index():
    return render_template("index.html")

# Kayıt sayfası
@main_routes.route("/register")
def register():
    return render_template("register.html")

# Giriş sayfası
@main_routes.route("/login")
def login():
    return render_template("login.html")

# Kullanıcı giriş sonrası ana sayfası
@main_routes.route("/kullanici_girisi")
def kullanici_sayfasi():
    return render_template("kullanici_girisi.html")

# Soru-cevap endpoint'i (LLM'e gönderir)
@main_routes.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    # LangChain RAG sisteminden cevap al
    answer = get_rag_answer(question)

    return jsonify({"answer": answer})

# 👇 Geçmişi kaydet (sohbet geçmişini JSON dosyasına yazar)
@main_routes.route("/save_history", methods=["POST"])
def save_history():
    data = request.get_json()
    history_dir = os.path.join("history")
    history_path = os.path.join(history_dir, "dummy_user_history.json")

    # Klasör yoksa oluştur
    os.makedirs(history_dir, exist_ok=True)

    try:
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# 👇 Geçmişi yükle (JSON dosyasını frontend'e yollar)
@main_routes.route("/load_history", methods=["GET"])
def load_history():
    history_path = os.path.join("history", "dummy_user_history.json")

    try:
        if os.path.exists(history_path):
            with open(history_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify([])  # Dosya yoksa boş liste dön
    except Exception as e:
        return jsonify({"error": str(e)}), 500
