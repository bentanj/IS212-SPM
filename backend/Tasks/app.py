from flask import Flask

app = Flask(__name__)

@app.get("/api/tasks/health")
def health():
    return {"status": "ok", "service": "tasks"}

if __name__ == "__main__":
    app.run(debug=True, port=8080)