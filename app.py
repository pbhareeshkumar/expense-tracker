from flask import Flask, request, jsonify
import sqlite3
from flask_cors import CORS

app=Flask(__name__) #application object
CORS(app)

def get_db_connection():
    conn = sqlite3.connect("expenses.db")
    conn.row_factory = sqlite3.Row #makes them behave like dictionaries 
    return conn

@app.route("/") #when URL s visited the function below this is run
def home():
    return "Hello Expense Tracker!"

@app.route("/expenses", methods=["POST"]) 
def add_expense():
    data = request.get_json() #reads the json data
    amount = data["amount"]
    category = data["category"]
    date = data["date"]
    note = data.get("note","") #setting it to empty string if null

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (amount, category, date, note) VALUES (?, ?, ?, ?)",
        (amount, category, date, note)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": "Expense Added Succesfully"}), 201

@app.route("/expenses", methods=["GET"])
def get_expenses():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM expenses")
    rows = cursor.fetchall()
    conn.close()

    expenses = [dict(row) for row in rows]
    return jsonify(expenses)

@app.route("/expenses/<int:expense_id>", methods=["DELETE"]) #<int:expense_id> is URL parameter, eg: /expenses/2
def delete_expense(expense_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM EXPENSES WHERE id = ?", (expense_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Expense deleted"}), 200

@app.route("/expenses/totals", methods = ["GET"])
def get_totals():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT CATEGORY, SUM(amount) as total FROM expenses GROUP BY category")
    rows=cursor.fetchall()
    conn.close()

    totals=[dict(row) for row in rows]
    return jsonify(totals)

if __name__ == "__main__":
    app.run(debug=True) #actually starts the server, and auto restarts


    
