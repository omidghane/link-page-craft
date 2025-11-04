// ...existing code...
import { useState } from "react";

const Test = () => {
  const [tasks, setTasks] = useState(["Learn React"]);

  function addTask() {
    setTasks((prev) => [...prev, "Build AI project"]);
  }

  return (
    <div>
      {tasks.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      <button onClick={addTask}>Add</button>
    </div>
  );
};

export default Test;
// ...existing code...