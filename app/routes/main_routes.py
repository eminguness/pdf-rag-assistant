import os
import json
from flask import Blueprint, render_template, request, jsonify
from datetime import datetime
from app.chatbot.rag_chain import get_rag_answer
from app.masking2 import mask_entities

main_routes = Blueprint("main_routes", __name__)

# Belge.json yolunu belirt (tek JSON nesnesi olmalı)
BELGE_JSON_PATH = os.path.join("maskeleme", "belge.json")
BELGE_TXT_PATH = os.path.join("maskeleme", "belge.txt")

# Global maske-isim eşlemesi
with open(BELGE_JSON_PATH, encoding="utf-8") as f:
    mask_to_real_global = json.load(f)

def unmask_answer(answer, extra_metadata=None):
    """Cevaptaki tüm maskeleri gerçek isimlerle değiştirir."""
    combined_metadata = {**mask_to_real_global, **(extra_metadata or {})}

    for mask, real in combined_metadata.items():
        patterns_to_replace = [
            f"<{mask}>",
            f"<{mask.lower()}>",
            mask,
            mask.lower()
        ]
        for p in patterns_to_replace:
            answer = answer.replace(p, real)

    return answer

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

@main_routes.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    # 1. Soru maskelenir (global metadata dahil)
    masked_question, metadata = mask_entities(question, global_metadata=mask_to_real_global)

    # 2. Dosya yolları belirlenir
    history_dir = os.path.join("history")
    os.makedirs(history_dir, exist_ok=True)

    path_masked = os.path.join(history_dir, "soru.txt")
    path_metadata = os.path.join(history_dir, "soru.json")
    path_history = os.path.join(history_dir, "dummy_user_history.json")
    path_answer_masked = os.path.join(history_dir, "cevap.txt")

    # 3. Maskelenmiş metin ve metadata dosyaya yazılır
    with open(path_masked, "w", encoding="utf-8") as f:
        f.write(masked_question)
    with open(path_metadata, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)

    # 4. RAG ile cevap alınır
    answer = get_rag_answer(path_masked)

    # 4.5: Maskeli cevabı cevap.txt olarak kaydet
    with open(path_answer_masked, "w", encoding="utf-8") as f:
        f.write(answer)

    # 4.6: Belge içeriğinde maskelenen kişi/kavram var mı kontrolü
    try:
        with open(BELGE_TXT_PATH, encoding="utf-8") as f:
            belge_content = f.read().lower()
    except Exception as e:
        return jsonify({"answer": f"Belge kaynağı okunamadı: {str(e)}"})

    # Metadata'daki maskeleri belge.txt içinde ararız
    mask_not_in_belge = []
    for mask in metadata.keys():
        if f"<{mask.lower()}>" not in belge_content:
            mask_not_in_belge.append(mask)

    if mask_not_in_belge:
        eksikler = ", ".join([metadata[m] for m in mask_not_in_belge])
        return jsonify({
            "answer": f"{eksikler} hakkında yeterli bilgiye ulaşılamadı. Lütfen farklı bir soru deneyin."
        })

    # 5. Maskeler gerçek isimlerle değiştirilir
    final_answer = unmask_answer(answer, metadata)

    # 6. Kullanıcı geçmişi güncellenir
    history_data = []
    if os.path.exists(path_history):
        try:
            with open(path_history, "r", encoding="utf-8") as f:
                history_data = json.load(f)
        except json.JSONDecodeError:
            history_data = []

    new_entry = {
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "original_question": question,
        "masked_question": masked_question,
        "answer": final_answer
    }

    history_data.append(new_entry)

    with open(path_history, "w", encoding="utf-8") as f:
        json.dump(history_data, f, ensure_ascii=False, indent=2)

    return jsonify({"answer": final_answer})

@main_routes.route("/save_history", methods=["POST"])
def save_history():
    data = request.get_json()
    history_dir = os.path.join("history")
    history_path = os.path.join(history_dir, "dummy_user_history.json")
    os.makedirs(history_dir, exist_ok=True)

    try:
        with open(history_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@main_routes.route("/load_history", methods=["GET"])
def load_history():
    history_path = os.path.join("history", "dummy_user_history.json")

    try:
        if os.path.exists(history_path):
            with open(history_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data)
        else:
            return jsonify([])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
