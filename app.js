const API_URL = CONFIG.API_URL;

document.addEventListener("DOMContentLoaded",()=>{
    loadExpenses();
    loadTotals();
    loadTotalExpense();
    loadBudget();
    renderQuickCategories();

    const today=new Date().toISOString().split("T")[0]; //splits the string at T and takes the first part
    document.getElementById("date").value=today;
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
    const today=new Date().toISOString().split("T")[0];
    document.getElementById("date").value = today;
    loadExpenses();
    loadTotals();
    loadBudget();
    loadTotalExpense();
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
  const heading = document.getElementById("expenses-heading");
  list.innerHTML="";

  heading.style.display = expenses.length ===0? "none" : " block"

  expenses.forEach(expense => {
    const li = document.createElement("li");
    li.textContent = `${expense.amount} - ${expense.category} (${expense.date}) ${expense.note}`;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(expense));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteExpense(expense.id));

    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });


};

let pendingDeleteId = null; // variable that remembers which expense is being deleted

function deleteExpense(id){
  pendingDeleteId = id;
  document.getElementById("confirm-modal").classList.remove("hidden"); //removes the popup
}

document.getElementById("confirm-yes").addEventListener("click", async() => {
  await fetch(`${API_URL}/expenses/${pendingDeleteId}`, {
    method: "DELETE"
  });
  document.getElementById("confirm-modal").classList.add("hidden");
  loadExpenses();
  loadTotals();
  loadBudget();
  loadTotalExpense();
});

document.getElementById("confirm-no").addEventListener("click", () => {
  document.getElementById("confirm-modal").classList.add("hidden");
});


async function loadTotals() {
  const response = await fetch(`${API_URL}/expenses/totals`);
  const totals = await response.json();

  const list = document.getElementById("totals-list");
  const heading = document.getElementById("totals-heading");
  list.innerHTML = "";

  heading.style.display = totals.length ===0? "none" : "block";

  totals.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.category}: ₹${item.total}`;
    list.appendChild(li);
  });
}

let pendingEditId = null;

function openEditModal(expense) {
  pendingEditId = expense.id;
  document.getElementById("edit-amount").value = expense.amount;
  document.getElementById("edit-category").value = expense.category;
  document.getElementById("edit-date").value = expense.date;
  document.getElementById("edit-note").value = expense.note;
  document.getElementById("edit-modal").classList.remove("hidden");
}

document.getElementById("edit-save").addEventListener("click", async () => {
  const amount = document.getElementById("edit-amount").value;
  const category = document.getElementById("edit-category").value;
  const date = document.getElementById("edit-date").value;
  const note = document.getElementById("edit-note").value;

  await fetch(`${API_URL}/expenses/${pendingEditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount: parseFloat(amount), category, date, note })
  });

  document.getElementById("edit-modal").classList.add("hidden");
  loadExpenses();
  loadTotals();
  loadBudget();
  loadTotalExpense();
});

document.getElementById("edit-cancel").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

async function loadTotalExpense(){
  const response = await fetch(`${API_URL}/expenses/total`);
  const data = await response.json();
  document.getElementById("total-expense").textContent= `Total: ${data.total}`;
}

function getDefaultCategories(){
  const stored = localStorage.getItem("defaultCategories"); //stores in browser
  return stored ? JSON.parse(stored) : []; 
}

function saveDefaultCategories(categories){
  localStorage.setItem("defaultCategories", JSON.stringify(categories)); //local stores only as plain text
}

let categoryEditMode=false;

function renderQuickCategories(){
  const container = document.getElementById("quick-categories");
  container.innerHTML = "";

  const categories = getDefaultCategories();

  categories.forEach(cat => {
    if(categoryEditMode){
      const wrapper = document.createElement("div");
      wrapper.classList.add("category-delete-wrapper");

      const nameSpan = document.createElement("span");
      nameSpan.textContent = cat;
      nameSpan.classList.add("category-delete-name");

      const xSpan = document.createElement("span");
      xSpan.textContent = "X";
      xSpan.classList.add("category-delete-x");

      wrapper.appendChild(nameSpan);
      wrapper.appendChild(xSpan);

      wrapper.addEventListener("click", () => {
        const updated = categories.filter(c => c !== cat);
        saveDefaultCategories(updated);
        categoryEditMode = false;
        renderQuickCategories();
      });

      container.appendChild(wrapper);

    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        document.getElementById("category").value = cat;
      });
      container.appendChild(btn);
    }
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent ="+";
  addBtn.classList.add("add-category-btn");

  addBtn.addEventListener("click",()=>{
    document.getElementById("category-modal").classList.remove("hidden");
  });
  container.appendChild(addBtn);

  const editToggleBtn = document.createElement("button");
  editToggleBtn.type ="button";
  editToggleBtn.textContent="✏️";
  editToggleBtn.addEventListener("click", () =>{
    categoryEditMode = !categoryEditMode;
    renderQuickCategories();
  });
  container.appendChild(editToggleBtn);
}

document.getElementById("category-save").addEventListener("click", () =>{
  const input = document.getElementById("new-category-input");
  const value = input.value.trim().toUpperCase();
  if(!value) return;

  const categories = getDefaultCategories();
  if (!categories.includes(value)){ //to prevent adding same category
    categories.push(value);
    saveDefaultCategories(categories);
    renderQuickCategories();
  }

  input.value="";
  document.getElementById("category-modal").classList.add("hidden");
});

document.getElementById("category-cancel").addEventListener("click",()=>{
  document.getElementById("new-category-input").value="";
  document.getElementById("category-modal").classList.add("hidden");
});

function getCurrentMonth(){
  return new Date().toISOString().split("T")[0].slice(0,7);
}

async function loadBudget(){
  const month = getCurrentMonth();

  const budgetRes= await fetch(`${API_URL}/budget/${month}`);
  const budgetData = await budgetRes.json();

  const totaltRes= await fetch(`${API_URL}/expenses/total`);
  const totalData = await totaltRes.json();

  const budget = budgetData.amount;
  const spent = totalData.total;
  const remaining = budget - spent;

  const display = document.getElementById("budget-display");

  if(budget===0){ 
    display.textContent="No budget for this month";
    display.style.color="#999";
  }else if (remaining <0){
    display.textContent = `Budget: ₹${budget} | Over by ₹${Math.abs(remaining)}`;
    display.style.color = "#ff3b30"; // red
  }else{
    display.textContent = `Budget: ₹${budget} | Remaining: ₹${remaining}`;
    display.style.color = remaining < budget * 0.2 ? "#ff9500" : "#34c759";
  }

}

document.getElementById("set-budget-btn").addEventListener("click", ()=>{
  document.getElementById("budget-modal").classList.remove("hidden");
});

document.getElementById("budget-save").addEventListener("click", async () =>{
  const amount = parseFloat(document.getElementById("budget-input").value);

  if (!amount || amount <= 0) return;

  const month = getCurrentMonth();

  await fetch(`${API_URL}/budget/${month}`,{
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({amount})
  });

  document.getElementById("budget-modal").classList.add("hidden");
  document.getElementById("budget-input").value = "";
  loadBudget();
});

document.getElementById("budget-cancel").addEventListener("click", () => {
  document.getElementById("budget-input").value = "";
  document.getElementById("budget-modal").classList.add("hidden");
});