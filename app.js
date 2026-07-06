const API_URL ="https://expense-tracker-backend-lrkz.onrender.com"

document.addEventListener("DOMContentLoaded",()=>{
    loadExpenses();
    loadTotals();
});

document.getElementById("clear-amount").addEventListener("click", () => {
  document.getElementById("amount").value = "";
});

document.getElementById("expense-form").addEventListener("submit", async function(e) {
    e.preventDefault(); //to prevent default reloding of page

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    await fetch(`${API_URL}/expenses`, { //sends request to Flask backend
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({amount: parseFloat(amount), category, date, note})
    });

    document.getElementById("expense-form").reset();
    loadExpenses();
    loadTotals();
});



document.querySelectorAll("#quick-amounts button").forEach(btn => {
  btn.addEventListener("click", () => {
    const amountInput = document.getElementById("amount");
    const currentValue = parseFloat(amountInput.value) || 0; //if the amount is empty
    const addValue = parseFloat(btn.dataset.value); //reads the data-value=5
    amountInput.value = currentValue + addValue;
  });
});

async function loadExpenses(){
    const response = await fetch(`${API_URL}/expenses`); // await - pauses running till fetched
    const expenses = await response.json();

    const list = document.getElementById("expense-list");
    list.innerHTML="";

    expenses.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `${expense.amount} - ${expense.category} (${expense.date}) ${expense.note}`
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}

async function deleteExpense(id) {
  await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE"
  });
  loadExpenses(); // refresh list after deleting
  loadTotals();
}

async function loadTotals() {
  const response = await fetch(`${API_URL}/expenses/totals`);
  const totals = await response.json();

  const list = document.getElementById("totals-list");
  list.innerHTML = "";

  totals.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.category}: ₹${item.total}`;
    list.appendChild(li);
  });
}