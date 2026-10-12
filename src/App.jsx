import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GuestRoute from "@/components/GuestRoute";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#18221d]">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
          <span className="grid size-9 place-items-center bg-[#153c2c] text-[#c7f36b]">+</span>
          Balance
        </Link>
        <Button
          className="rounded-none border border-[#dce3dd] bg-white px-4 text-[#33443a] hover:bg-[#eef3ee]"
          onClick={() => void logout()}
          variant="outline"
        >
          Cerrar sesión
        </Button>
      </header>
      <section className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#55806a]">Resumen personal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hola, {user?.name}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#68756d]">
          Tu sesión está activa. Aquí podrás consultar tus ingresos, egresos y balance mensual.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {["Ingresos", "Egresos", "Balance"].map((label) => (
            <article key={label} className="border border-black/10 bg-white p-6">
              <p className="text-sm text-[#68756d]">{label}</p>
              <p className="mt-4 text-2xl font-semibold text-[#9ba69e]">—</p>
              <p className="mt-2 text-xs text-[#9ba69e]">Disponible al conectar el resumen financiero</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
