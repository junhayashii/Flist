import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginSuccess() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-80 text-center">
        <h2 className="text-2xl font-bold mb-6">ログイン成功</h2>
        <p className="mb-4">{user ? `${user.email} でログインしました` : "ログイン済み"}</p>
        <Link to="/" className="block mb-2 text-blue-500 hover:underline">ダッシュボードへ</Link>
        <Link to="/logout" className="block text-red-500 hover:underline">ログアウト</Link>
      </div>
    </div>
  );
} 