let todos = [];
let todoArr;
let state = 'all';

const request = {
  get(url) {
    return fetch(url);
  },
  post(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  put(url, payload) {
    return fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  patch(url, payload) {
    return fetch(url, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
  },
  delete(url) {
    return fetch(url, {
      method: 'DELETE'
    });
  }
};

// DOM
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $completeAll = document.getElementById('ck-complete-all');
const $clearCompleted = document.querySelector('.clear-completed');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');
const $nav = document.querySelector('.nav');
const $all = document.getElementById('all');
const $active = document.getElementById('active');

const render = () => {
  const $fragment = document.createDocumentFragment();

  todoArr = todos.filter(todo => (state === 'all' ? true : state === 'active' ? !todo.completed : todo.completed));

  $todos.textContent = '';
  todoArr.forEach(({ id, content, completed }) => {
    const $li = document.createElement('li');
    const $input = document.createElement('input');
    const $label = document.createElement('label');
    const $i = document.createElement('i');
    const $elements = [$input, $label, $i];

    $li.setAttribute('id', id);
    $li.setAttribute('class', 'todo-item');
    $input.setAttribute('id', `ck-${id}`);
    $input.setAttribute('class', 'checkbox');
    $input.setAttribute('type', 'checkbox');

    if (completed) {
      $input.setAttribute('checked', '');
      $label.style.textDecoration = 'line-through';
    } else {
      $input.removeAttribute('checked');
      $label.style.textDecoration = 'none';
    }

    $label.setAttribute('for', `ck-${id}`);
    $i.setAttribute('class', 'remove-todo far fa-times-circle');

    $label.textContent = content;

    $elements.forEach(element => $li.appendChild(element));
    $fragment.appendChild($li);
  });

  $todos.appendChild($fragment);
  $completeAll.checked = todoArr.filter(todo => todo.completed).length === todoArr.length;
  if (!todoArr.length) $completeAll.checked = false;
  $completedTodos.textContent = todos.filter(todo => todo.completed).length;
  $activeTodos.textContent = todos.filter(todo => !todo.completed).length;
};


const fetchTodos = () => {
  request.get('/todos')
    .then(response => response.json())
    .then(todoList => {
      todos = todoList;
      todos = [...todos].sort((todo1, todo2) => todo2.id - todo1.id);
      render();
    })
    .catch(error => console.error(error));
};

const addTodo = (() => {
  const createId = () => todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1;

  return content => {
    const payload = { id: createId(), content, completed: false };

    todos = [payload, ...todos];
    request.post('/todos', payload)
      .then(render())
      .catch(error => console.error(error));
  }
})();

const removeTodo = id => {
  todos = todos.filter(todo => todo.id !== id);
  request.delete(`/todos/${id}`)
    .then(render())
    .catch(error => console.error(error));
};

const toggleTodo = id => {
  let payload;

  todos = todos.map(todo => {
    if (todo.id === id) {
      payload = { completed: !todo.completed };
      return { ...todo, ...payload };
    }
    return todo;
  });
  request.patch(`/todos/${id}`, payload)
    .then(render())
    .catch(error => console.error(error));
};

const toggleAll = checked => {
  todos = todos.map(todo => ({ ...todo, completed: checked }));
  
  todos.forEach(todo => {
    request.patch(`/todos/${todo.id}`, { completed: checked })
    .then(render())
    .catch(error => console.error(error));
  });
};

const clearAllComplete = () => {
  todos = todos.filter(todo => {
    if (todo.completed) {
      request.delete(`/todos/${todo.id}`)
        .catch(error => console.error(error));
    }
    return !todo.completed;
  });
  render();
};

const changeState = event => {
  // eslint-disable-next-line max-len
  [...event.currentTarget.children].forEach(child => child.classList.toggle('active', event.target.id === child.id));
  state = event.target.id;
  render();
}

document.addEventListener('DOMContentLoaded', fetchTodos);

$inputTodo.onkeyup = e => {
  const content = e.target.value;
  
  if (e.key !== 'Enter' || !content) return;

  addTodo(content);
  e.target.value = '';
};

$todos.onclick = e => {
  const { id } = e.target.parentNode;

  if (!e.target.matches('.todos > li > .remove-todo')) return;
  removeTodo(+id);
};

$todos.onchange = e => {
  const { id } = e.target.parentNode;
  
  toggleTodo(+id);
};

$completeAll.onchange = e => {
  const { checked } = e.target;

  toggleAll(checked);
};

$clearCompleted.onclick = e => {
  if (!e.target.matches('.clear-completed > .btn')) return;

  clearAllComplete();
};

$nav.onclick = e => {
  if (!e.target.matches('.nav > li')) return;

  changeState(e);
};
