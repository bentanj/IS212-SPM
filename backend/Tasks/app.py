from flask import Flask

app = Flask(__name__)

@app.get("/api/tasks/health")
def health():
    return {"status": "ok", "service": "tasks"}

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)