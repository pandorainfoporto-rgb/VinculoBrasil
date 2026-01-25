import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-blue-600">Vínculo Brasil</h1>
            <p className="text-gray-500 mt-2">Plataforma de Recebíveis Imobiliários</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
