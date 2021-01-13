let todos = [];
let todoArr;
let state = 'all';

// DOM nodes
const $todosList = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $completeAll = document.getElementById('ck-complete-all');
const $clearCompleted = document.querySelector('.clear-completed');
const $countCompleted = document.querySelector('.completed-todos');
const $countActive = document.querySelector('.active-todos');
const $nav = document.querySelector('.nav');

const render = () => {
  const $fragment = document.createDocumentFragment();

  // eslint-disable-next-line max-len
  todoArr = todos.filter(todo => (state === 'all' ? true : state === 'active' ? !todo.completed : todo.completed));

  $todosList.textContent = '';
  todoArr.forEach(({ id, content, completed }) => {
    const $li = document.createElement('li');
    const $input = document.createElement('input');
    const $label = document.createElement('label');
    const $i = document.createElement('i');

    $li.setAttribute('id', id);
    $li.setAttribute('class', 'todo-item');
    $input.setAttribute('id', `ck-${id}`);
    $input.setAttribute('class', 'checkbox');
    $input.setAttribute('type', 'checkbox');
    if (completed) {
      $input.setAttribute('checked', 'checked');
      $label.style.textDecoration = 'line-through';
    } else {
      $input.removeAttribute('checked');
    }
    $label.setAttribute('for', `ck-${id}`);
    $label.textContent = content;
    $i.setAttribute('class', 'remove-todo far fa-times-circle');

    $li.appendChild($input);
    $li.appendChild($label);
    $li.appendChild($i);
    $fragment.appendChild($li);
  });

  $completeAll.checked = todoArr.filter(todo => todo.completed).length === todoArr.length;

  $countCompleted.textContent = todos.filter(todo => todo.completed).length;
  $countActive.textContent = todos.filter(todo => !todo.completed).length;
  $todosList.appendChild($fragment);
};

const fetchTodos = () => {
  // Assume that we fetched data from the server.
  todos = [
    { id: 1, content: 'HTML', completed: true },
    { id: 2, content: 'CSS', completed: false },
    { id: 3, content: 'Javascript', completed: true }
  ];

  todos = [...todos].sort((todo1, todo2) => todo2.id - todo1.id);

  render();
};

const addTodo = (() => {
  const createId = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

  return content => {
    todos = [{ id: createId(), content, completed: false }, ...todos];
    render();
  };
})();

const removeTodo = id => {
  todos = todos.filter(todo => todo.id !== id);
  render();
};

const toggleTodo = id => {
  todos = todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  render();
};

const toggleAll = checked => {
  // eslint-disable-next-line max-len
  todos = todos.map(todo => (checked ? { ...todo, completed: true } : { ...todo, completed: false }));
  render();
};

const clearAllCompleted = () => {
  todos = todos.filter(todo => !todo.completed);
  render();
};

const changeState = event => {
  // eslint-disable-next-line max-len
  [...event.currentTarget.children].forEach(child => child.classList.toggle('active', event.target.id === child.id));
  state = event.target.id;
  render();
};

document.addEventListener('DOMContentLoaded', fetchTodos);

$inputTodo.onkeyup = e => {
  const content = e.target.value;
  if ((e.key !== 'Enter') || (content === '')) return;

  addTodo(content);
  e.target.value = '';
};

$todosList.onclick = e => {
  const { id } = e.target.parentNode;
  if (!e.target.matches('.todos > li > .remove-todo')) return;

  removeTodo(+id);
};

$todosList.onchange = e => {
  const { id } = e.target.parentNode;

  toggleTodo(+id);
};

$completeAll.onchange = e => {
  const { checked } = e.target;

  toggleAll(checked);
};

$clearCompleted.onclick = e => {
  if (!e.target.matches('.clear-completed > .btn')) return;

  clearAllCompleted();
};

$nav.onclick = e => {
  if (!e.target.matches('.nav > li')) return;
  changeState(e);
};
