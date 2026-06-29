from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
from flask_cors import CORS
import os

app=Flask(__name__) #application object
CORS(app)

DATABASE_URL = os.environ.get("DATABASE_URL")

def get_db_connection():
    conn = psycopg2.connect(DATABASE_URL) 
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id SERIAL PRIMARY KEY,
            amount REAL NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            note TEXT
        )
    """)
    conn.commit()
    cursor.close()
    conn.close()

init_db()


@app.route("/") #when URL s visited the function below this is run
def home():
    return "Hello Expense Tracker!"

@app.route("/expenses", methods=["POST"]) 
def add_expense():
    data = request.get_json() #reads the json data
    amount = data["amount"]
    category = data["category"].strip().upper()
    date = data["date"]
    note = data.get("note","") #setting it to empty string if null

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO expenses (amount, category, date, note) VALUES (%s, %s, %s, %s)",
        (amount, category, date, note)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Expense Added Succesfully"}), 201

@app.route("/expenses", methods=["GET"])
def get_expenses():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT * FROM expenses")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    expenses = [dict(row) for row in rows]
    return jsonify(expenses)

@app.route("/expenses/<int:expense_id>", methods=["DELETE"]) #<int:expense_id> is URL parameter, eg: /expenses/2
def delete_expense(expense_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM EXPENSES WHERE id = %s", (expense_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Expense deleted"}), 200

@app.route("/expenses/totals", methods = ["GET"])
def get_totals():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("SELECT CATEGORY, SUM(amount) as total FROM expenses GROUP BY category")
    rows=cursor.fetchall()
    cursor.close()
    conn.close()

    totals=[dict(row) for row in rows]
    return jsonify(totals)

@app.route("/expenses/<int:expense_id>", methods=["PUT"]) #to update a db
def update_expense(expense_id):
    data=request.get_json()
    amount=data["amount"]
    category=data["category"].strip().upper()
    date=data["date"]
    note=data.get("note","")

    conn = get_db_connection()
    cursor=conn.cursor
    cursor.execute(
        "UPDATE expenses SET amount = %s, category = %s, date=%s, note=%s WHERE id=%s",
        (amount,category,date,note,expense_id)
    )
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Expense updated"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT",5000))
    app.run(host="0.0.0.0",port=port)


    
