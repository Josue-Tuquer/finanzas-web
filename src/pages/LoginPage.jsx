import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/pages/AuthLayout";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      const destination = location.state?.from?.pathname ?? "/";
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "No se pudo iniciar sesión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Qué bueno verte"
      title="Inicia sesión"
      description="Ingresa tus datos para continuar con tus finanzas."
      footer={
        <>
          ¿Aún no tienes una cuenta?{" "}
          <Link className="font-semibold text-[#245d42] hover:underline" to="/register">
            Crear cuenta
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block space-y-2 text-sm font-medium text-[#33443a]">
          Correo electrónico
          <input
            autoComplete="email"
            className="h-12 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@correo.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-[#33443a]">
          Contraseña
          <input
            autoComplete="current-password"
            className="h-12 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contraseña"
            required
            type="password"
            value={password}
          />
        </label>
        <Button
          className="h-12 w-full rounded-none bg-[#1e583c] text-sm font-semibold text-white hover:bg-[#16452f]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </AuthLayout>
  );
}
