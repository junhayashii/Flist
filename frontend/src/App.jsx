import { useEffect, useState } from 'react'

function App() {
  const [msg, setMsg] = useState("...loading")

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/ping/")
      .then(res => res.json())
      .then(data => setMsg(data.message))
  }, [])

  return <h1>Response from API: {msg}</h1>
}

export default App