import { useState } from "react"

export default function NoteEditor({ onPostTasks }) {
  const [text, setText] = useState("")
  const [isPosting, setIsPosting] = useState(false)

  const parseLines = (input) => {
    return input.split("\n").map((line, index) => {
      if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
        const isDone = line.startsWith("- [x] ")
        const content = line.replace(/- \[[ x]\] /, "")
        return (
          <div key={index} className="flex items-center space-x-2">
            <input type="checkbox" checked={isDone} readOnly />
            <span className={isDone ? "line-through text-gray-500" : ""}>
              {content}
            </span>
          </div>
        )
      } else {
        return <p key={index}>{line}</p>
      }
    })
  }

  const extractTasks = () => {
    return text
      .split("\n")
      .filter(line => line.startsWith("- [ ] ") || line.startsWith("- [x] "))
      .map(line => {
        const isDone = line.startsWith("- [x] ")
        const title = line.replace(/- \[[ x]\] /, "").trim()
        return { title, is_done: isDone }
      })
  }

  const handlePostTasks = async () => {
    const tasks = extractTasks()
    if (tasks.length === 0) return

    setIsPosting(true)
    try {
        await Promise.all(tasks.map(task => {
            console.log("📤 送信するタスク:", task)
            return fetch("http://127.0.0.1:8000/api/tasks/", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(task)
            })
          }))

      alert("タスクを登録しました！")
      setText("") // 入力をクリア
      if (onPostTasks) {
        onPostTasks()
      }
    } catch (err) {
      alert("登録中にエラーが発生しました")
      console.error(err)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-2">🧪 Notion風エディタ（→ タスク登録）</h2>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-40 border rounded p-2 mb-4"
        placeholder="例:\n- [ ] 牛乳を買う\n今日は晴れ\n- [ ] コードを書く"
      />
      <div className="bg-gray-100 p-4 rounded space-y-2 mb-4">
        {parseLines(text)}
      </div>
      <button
        onClick={handlePostTasks}
        disabled={isPosting}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {isPosting ? "登録中..." : "✅ チェック付き行をタスクに登録"}
      </button>
    </div>
  )
}