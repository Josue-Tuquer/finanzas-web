import { Link } from "react-router-dom";

export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7f4] px-4 py-10 text-[#18221d]">
      <div className="pointer-events-none absolute -left-32 -top-36 size-[28rem] rounded-full bg-emerald-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-44 -right-20 size-[32rem] rounded-full bg-amber-100/70 blur-3xl" />

      <section className="relative grid w-full max-w-5xl overflow-hidden border border-black/10 bg-white shadow-[0_28px_90px_-45px_rgba(24,34,29,0.4)] md:min-h-[600px] md:grid-cols-[1.03fr_0.97fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#153c2c] p-10 text-white md:flex lg:p-14">
          <div className="absolute -right-20 top-24 size-72 rounded-full border border-white/10" />
          <div className="absolute -right-9 top-36 size-52 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 size-80 rounded-full bg-emerald-400/10 blur-2xl" />
          <Link to="/" className="relative flex items-center gap-3 font-semibold tracking-tight text-white">
            <span className="grid size-10 place-items-center bg-[#c7f36b] text-[#153c2c]">
              <span className="text-xl font-black">+</span>
            </span>
            <span>Balance</span>
          </Link>

          <div className="relative max-w-sm pb-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#c7f36b]">
              Tus finanzas, claras
            </p>
            <p className="text-3xl font-medium leading-tight tracking-tight lg:text-4xl">
              Cada decisión cuenta. Lleva el control de tu dinero.
            </p>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/65">
              Organiza tus ingresos y gastos en un solo lugar y avanza hacia tus metas.
            </p>
          </div>

          <p className="relative text-xs text-white/45">Un paso más cerca de tus metas.</p>
        </aside>

        <div className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            <Link to="/" className="mb-10 inline-flex items-center gap-2 font-semibold tracking-tight md:hidden">
              <span className="grid size-8 place-items-center bg-[#153c2c] text-[#c7f36b]">+</span>
              Balance
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#55806a]">{eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#18221d]">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#68756d]">{description}</p>
            <div className="mt-8">{children}</div>
            <div className="mt-8 border-t border-black/10 pt-6 text-center text-sm text-[#68756d]">
              {footer}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
