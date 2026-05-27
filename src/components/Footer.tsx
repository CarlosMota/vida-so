import { Link } from "wouter";
import { ChefHat, ShoppingCart, Sparkles, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">VS</span>
              </div>
              <span className="font-bold text-xl text-white">VidaSó</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A plataforma de IA que simplifica a vida de quem mora sozinho. Chef, compras e limpeza em um só lugar.
            </p>
          </div>

          {/* Serviços */}
          <div>
            <h4 className="font-semibold text-white mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/chefs" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ChefHat className="w-4 h-4" /> Personal Chefs
                </Link>
              </li>
              <li>
                <Link href="/compras" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ShoppingCart className="w-4 h-4" /> Compras Online
                </Link>
              </li>
              <li>
                <Link href="/limpeza" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Sparkles className="w-4 h-4" /> Limpeza Residencial
                </Link>
              </li>
            </ul>
          </div>

          {/* Plataforma */}
          <div>
            <h4 className="font-semibold text-white mb-4">Plataforma</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/prestador" className="hover:text-white transition-colors">Seja um Prestador</Link></li>
              <li><Link href="/onboarding" className="hover:text-white transition-colors">Configurar Perfil</Link></li>
            </ul>
          </div>

          {/* Dados de Mercado */}
          <div>
            <h4 className="font-semibold text-white mb-4">Mercado</h4>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">12M+</p>
                <p className="text-gray-400">pessoas moram sozinhas no Brasil</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-2xl font-bold text-white">R$85bi</p>
                <p className="text-gray-400">movimentados em alimentos/ano</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 VidaSó. Todos os direitos reservados.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Feito com <Heart className="w-3 h-3 text-red-500 fill-red-500" /> para quem mora sozinho
          </p>
        </div>
      </div>
    </footer>
  );
}
