import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import AuthLayout from "@/pages/AuthLayout";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "No se pudo crear la cuenta. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Empieza hoy"
      title="Crea tu cuenta"
      description="Regístrate para organizar tus ingresos y egresos."
      footer={
        <>
          ¿Ya tienes una cuenta?{" "}
          <Link className="font-semibold text-[#245d42] hover:underline" to="/login">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p role="alert" className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block space-y-2 text-sm font-medium text-[#33443a]">
          Nombre
          <input
            autoComplete="name"
            className="h-11 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
            name="name"
            onChange={(event) => setName(event.target.value)}
            placeholder="Tu nombre"
            required
            type="text"
            value={name}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-[#33443a]">
          Correo electrónico
          <input
            autoComplete="email"
            className="h-11 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
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
            autoComplete="new-password"
            className="h-11 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
            minLength={8}
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Al menos 8 caracteres"
            required
            type="password"
            value={password}
          />
        </label>
        <label className="block space-y-2 text-sm font-medium text-[#33443a]">
          Confirmar contraseña
          <input
            autoComplete="new-password"
            className="h-11 w-full border border-[#dce3dd] bg-white px-3 text-sm outline-none transition placeholder:text-[#a2aca5] focus:border-[#397b57] focus:ring-2 focus:ring-[#397b57]/15"
            minLength={8}
            name="password_confirmation"
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            placeholder="Repite tu contraseña"
            required
            type="password"
            value={passwordConfirmation}
          />
        </label>
        <Button
          className="h-12 w-full rounded-none bg-[#1e583c] text-sm font-semibold text-white hover:bg-[#16452f]"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthLayout>
  );
}
