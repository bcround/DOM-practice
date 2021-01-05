let todos = [];
let todoArr;
const xhr = new XMLHttpRequest();

// DOM nodes
const $todosList = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $completeAll = document.getElementById('ck-complete-all');
const $clearCompleted = document.querySelector('.clear-completed');
const $countCompleted = document.querySelector('.completed-todos');
const $countActive = document.querySelector('.active-todos');
const $nav = document.querySelector('.nav');
const $all = document.getElementById('all');
const $active = document.getElementById('active');

const render = () => {
  const $fragment = document.createDocumentFragment();

  if ($all.classList.contains('active')) todoArr = todos;
  else if ($active.classList.contains('active')) todoArr = todos.filter(todo => !todo.completed);
  else todoArr = todos.filter(todo => todo.completed);

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
  // todos = [
  //   { id: 1, content: 'HTML', completed: true },
  //   { id: 2, content: 'CSS', completed: false },
  //   { id: 3, content: 'Javascript', completed: true }
  // ];
  // const xhr = new XMLHttpRequest();

  xhr.open('GET', '/todos');
  xhr.send();
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      todos = JSON.parse(xhr.response);
      todos = [...todos].sort((todo1, todo2) => todo2.id - todo1.id);
      render();
    }
  };
};

const addTodo = (() => {
  const createId = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

  return content => {
    todos = [{ id: createId(), content, completed: false }, ...todos];

    const post = url => {
      // const xhr = new XMLHttpRequest();
    
      xhr.open('POST', url);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(todos[0]));
  
      xhr.onload = () => {
        if (xhr.status === 200) {
          console.log(xhr.response);
        }
      }
    };
  
    post('/todos');
    render();
  };
})();

const removeTodo = id => {
  todos = todos.filter(todo => todo.id !== id);

  const remove = url => {
    // const xhr = new XMLHttpRequest();
  
    xhr.open('DELETE', url);
    xhr.send();

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.response);
      }
    }
  };

  remove(`/todos/${id}`);
  render();
};

const toggleTodo = id => {
  todos = todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  
  const toggle = (url, index) => {
    // const xhr = new XMLHttpRequest();
  
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(todos[index]));

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.response);
      }
    }
  };

  todos.forEach((todo, index) => {
    if (todo.id === id) toggle(`/todos/${id}`, index);
  });
  render();
};

const toggleAll = checked => {
  // eslint-disable-next-line max-len
  todos = todos.map(todo => (checked ? { ...todo, completed: true } : { ...todo, completed: false }));

  const togAll = (url, index) => {
    // const xhr = new XMLHttpRequest();
  
    xhr.open('PUT', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(todos[index]));

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.response);
      }
    }
  };

  todos.forEach((todo, index) => {
    togAll(`/todos/${todo.id}`, index);
  });
  render();
};

const clearAllCompleted = () => {
  const clearAll = url => {
    // const xhr = new XMLHttpRequest();
  
    xhr.open('DELETE', url);
    xhr.send();

    xhr.onload = () => {
      if (xhr.status === 200) {
        console.log(xhr.response);
      }
    }
  };
  todos.forEach(todo => {
    if (todo.completed) clearAll(`/todos/${todo.id}`);
  });

  todos = todos.filter(todo => !todo.completed);


  render();
};

const changeState = event => {
  [...event.currentTarget.children].forEach(child => child.classList.remove('active'));
  event.target.classList.toggle('active');
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
