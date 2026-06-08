from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)

model = pickle.load(open("model.pkl", "rb"))

@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    description = data.get("description", "").strip()

    if len(description) < 5:
        return jsonify({"error": "Invalid input"}), 400

    prediction = int(model.predict([description])[0])
    return jsonify({"score": prediction})

@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"})

if __name__ == "__main__":
    app.run(port=6000)