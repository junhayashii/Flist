import { useEffect, useState } from 'react'
import NoteEditor from './components/NoteEditor'
import BlockEditor from './components/BlockEditor'

function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState("")

  const fetchTasks = async () => {
    console.log("📡 タスクを取得中...")
  
    try {
      const res = await fetch("http://127.0.0.1:8000/api/tasks/")
      console.log("📦 レスポンス:", res)
  
      if (!res.ok) {
        throw new Error(`❌ API error: ${res.status}`)
      }
  
      const data = await res.json()
      console.log("✅ タスク取得成功:", data)
  
      setTasks(data)
    } catch (err) {
      console.error("❗タスク取得エラー:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const res = await fetch('http://127.0.0.1:8000/api/tasks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: newTask })
    })

    if (res.ok) {
      setNewTask("")
      fetchTasks()  // 最新タスクを取得して更新
    }
  }

  const handleToggleDone = async (task) => {
    const res = await fetch(`http://127.0.0.1:8000/api/tasks/${task.id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_done: !task.is_done })
    })
  
    if (res.ok) {
      fetchTasks()
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm("このタスクを削除しますか？")) return
  
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tasks/${taskId}/`, {
        method: "DELETE"
      })
  
      if (res.ok) {
        fetchTasks()
      } else {
        console.error("❗削除失敗")
      }
    } catch (err) {
      console.error("❗通信エラー:", err)
    }
  }

  if (loading) return <p>Loading tasks...</p>

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Tasks</h1>

      <form onSubmit={handleAddTask} className="mb-4 flex space-x-2">
        <input
          type="text"
          placeholder="Add new task..."
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      <ul>
  {tasks.map((task) => (
    <li key={task.id} className="flex items-center space-x-2 mb-1">
      <input
        type="checkbox"
        checked={task.is_done}
        onChange={() => handleToggleDone(task)}
      />
      <span className={task.is_done ? "line-through text-gray-500" : ""}>
        {task.title}
      </span>
      <button
        onClick={() => handleDeleteTask(task.id)}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        🗑
      </button>
    </li>
  ))}
</ul>
{/* <h2 className="font-bold mb-2">🧪 NoteEditor</h2>
      <NoteEditor onPostTasks={fetchTasks} /> */}
      <h2 className="font-bold mb-2">🧪 BlockEditor</h2>
      <BlockEditor />
    </div>
  )
}

export default App