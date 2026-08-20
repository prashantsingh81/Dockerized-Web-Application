// Nginx proxies /api/* to the backend container, so relative paths work.
const API_BASE = "/api/todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const status = document.getElementById("status");

async function fetchTodos() {
  status.textContent = "Loading...";
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch todos");
    const todos = await res.json();
    renderTodos(todos);
    status.textContent = todos.length ? "" : "No todos yet — add one above.";
  } catch (err) {
    status.textContent = "Could not reach the backend. Is it running?";
    console.error(err);
  }
}

function renderTodos(todos) {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => toggleDone(todo.id, checkbox.checked));

    const span = document.createElement("span");
    span.textContent = todo.title;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });
}

async function addTodo(title) {
  await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  fetchTodos();
}

async function toggleDone(id, done) {
  await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ done }),
  });
  fetchTodos();
}

async function deleteTodo(id) {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  fetchTodos();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  input.value = "";
  addTodo(title);
});

fetchTodos();
