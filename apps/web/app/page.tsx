export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          MVP em desenvolvimento
        </span>
        <h1 className="text-4xl font-bold tracking-tight">MotoFinance</h1>
        <p className="text-base text-fg/70">
          Controle financeiro para entregadores. Saiba quanto você realmente ganha.
        </p>
      </div>

      <div className="w-full rounded-2xl border border-fg/10 p-6">
        <p className="text-sm text-fg/70">
          Aplicativo em construção. Cadastre-se na lista de espera para receber acesso ao beta
          fechado.
        </p>
      </div>

      <footer className="text-xs text-fg/40">
        © {new Date().getFullYear()} MotoFinance — Desenvolvido no Brasil
      </footer>
    </main>
  );
}
