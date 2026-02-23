// Recupera as transações do localStorage ou inicia array vazio
const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Formatador de moeda (BRL)
const formatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  signDisplay: "always",
});

// Elementos do DOM
const list = document.getElementById("transactionList");
const form = document.getElementById("transactionForm");
const balance = document.getElementById("balance");
const income = document.getElementById("income");
const expense = document.getElementById("expense");
const dateInput = document.getElementById("date");

// Define data atual como padrão
dateInput.defaultValue = new Date().toISOString().split("T")[0];

// Evento de envio do formulário
form.addEventListener("submit", addTransaction);

// Formata moeda e remove sinal quando for zero
function formatCurrency(value) {
  if (value === 0) {
    return formatter.format(0).replace(/^[+-]/, "");
  }
  return formatter.format(value);
}

// Cria item da lista
function createItem({ id, name, amount, date, type }) {
  const sign = type === "income" ? 1 : -1;

  const li = document.createElement("li");

  li.innerHTML = `
    <div class="name">
      <h4>${name}</h4>
      <p>${new Date(date).toLocaleDateString("pt-BR")}</p>
    </div>

    <div class="amount ${type}">
      <span>${formatCurrency(amount * sign)}</span>
    </div>
  `;

  li.addEventListener("click", (e) => {
    e.stopPropagation();
    if (confirm("Deseja deletar esta transação?")) {
      deleteTransaction(id);
    }
  });

  return li;
}

// Atualiza totais
function updateTotal() {
  const incomeTotal = transactions
    .filter((trx) => trx.type === "income")
    .reduce((total, trx) => total + trx.amount, 0);

  const expenseTotal = transactions
    .filter((trx) => trx.type === "expense")
    .reduce((total, trx) => total + trx.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  balance.textContent = formatCurrency(balanceTotal).replace(/^\+/, "");
  income.textContent = formatCurrency(incomeTotal);
  expense.textContent = formatCurrency(expenseTotal * -1);
}

// Renderiza lista completa
function renderList() {
  list.innerHTML = "";

  transactions.forEach((transaction) => {
    const li = createItem(transaction);
    list.appendChild(li);
  });
}

// Deleta transação
function deleteTransaction(id) {
  const index = transactions.findIndex((trx) => trx.id === id);

  if (index > -1) {
    transactions.splice(index, 1);
    saveTransactions();
    renderList();
    updateTotal();
  }
}

// Adiciona nova transação
function addTransaction(e) {
  e.preventDefault();

  const formData = new FormData(form);

  const uniqueId =
    Date.now().toString(36) + Math.random().toString(36).substring(2);

  const newTransaction = {
    id: uniqueId,
    name: formData.get("name"),
    amount: parseFloat(formData.get("amount")),
    date: formData.get("date"),
    type: formData.get("type") === "on" ? "expense" : "income",
  };

  if (
    !newTransaction.name ||
    isNaN(newTransaction.amount) ||
    !newTransaction.date
  ) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  transactions.push(newTransaction);
  saveTransactions();
  renderList();
  updateTotal();
  form.reset();
  dateInput.defaultValue = new Date().toISOString().split("T")[0];
}

// Salva no localStorage
function saveTransactions() {
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Inicialização
renderList();
updateTotal();
