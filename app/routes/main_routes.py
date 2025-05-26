from flask import Blueprint, render_template, request, jsonify

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


@main_routes.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    # MOCK cevap (buraya rag_chain cevabı gelecek ileride)
    answer = f"Bu bir örnek cevaptır. Soru: {question}"

    return jsonify({"answer": answer})
