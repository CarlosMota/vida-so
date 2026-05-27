import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-sm font-semibold text-muted-foreground mb-2">404</p>
        <h1 className="text-3xl font-bold text-foreground mb-3">Página não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          O endereço acessado não existe no protótipo.
        </p>
        <Link href="/">
          <Button>Voltar ao início</Button>
        </Link>
      </div>
    </main>
  );
}
