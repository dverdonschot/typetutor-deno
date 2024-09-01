import { h } from 'preact';
import { useState } from 'preact/hooks';

interface Todo {
  text: string;
}

export function TodoList() {
  const [text, setText] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    if (text.trim()) {
      setTodos([...todos, { text: text.trim() }]);
      setText('');
    }
  };

  const removeTodo = (todo: Todo) => {
    setTodos(todos.filter(t => t !== todo));
  };

  const handleInput = (event: h.JSX.TargetedEvent<HTMLInputElement, Event>) => {
    setText(event.currentTarget.value);
  };

  return (
    <>
      <input value={text} onInput={handleInput} />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map((todo, index) => (
          <li key={index}>
            {todo.text}{' '}
            <button onClick={() => removeTodo(todo)}>❌</button>
          </li>
        ))}
      </ul>
    </>
  );
}

