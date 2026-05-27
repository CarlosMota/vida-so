import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChefHat,
  ShoppingCart,
  Sparkles,
  Star,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Brain,
  Shield,
  Smartphone,
} from "lucide-react";

const stats = [
  { value: "12M+", label: "Pessoas moram sozinhas no Brasil", icon: Users },
  { value: "R$85bi", label: "Movimentados em alimentos/ano", icon: TrendingUp },
  { value: "23,4%", label: "Crescimento do mercado até 2030", icon: TrendingUp },
  { value: "4h/sem", label: "Tempo médio economizado", icon: Clock },
];

const services = [
  {
    icon: ChefHat,
    title: "Personal Chef",
    description: "Nossa IA analisa seus gostos e restrições alimentares para recomendar o chef perfeito para você. Receba refeições preparadas na sua casa.",
    color: "from-purple-500 to-purple-700",
    href: "/chefs",
    features: ["Matching por IA", "Cardápio personalizado", "Chefs verificados", "Agendamento flexível"],
  },
  {
    icon: ShoppingCart,
    title: "Compras Inteligentes",
    description: "Crie listas de compras e deixe a IA sugerir itens baseados no seu histórico. Escolha o horário de entrega que preferir.",
    color: "from-orange-400 to-orange-600",
    href: "/compras",
    features: ["Sugestões por IA", "Entrega agendada", "Histórico de listas", "Estimativa de preços"],
  },
  {
    icon: Sparkles,
    title: "Limpeza Residencial",
    description: "Encontre profissionais de limpeza verificados e avaliados na sua região. Escolha o tipo de serviço e agende com facilidade.",
    color: "from-teal-500 to-teal-700",
    href: "/limpeza",
    features: ["Profissionais verificados", "3 tipos de serviço", "Avaliações reais", "Agendamento online"],
  },
];

const steps = [
  { step: "01", title: "Crie seu perfil", description: "Responda um questionário rápido sobre seus gostos, restrições e orçamento." },
  { step: "02", title: "Receba recomendações", description: "Nossa IA analisa seu perfil e sugere os melhores profissionais para você." },
  { step: "03", title: "Agende e relaxe", description: "Escolha o horário ideal e acompanhe tudo pelo dashboard." },
];

const testimonials = [
  {
    name: "Mariana Costa",
    role: "Analista de TI, São Paulo",
    text: "Finalmente encontrei uma solução que entende minha rotina. A IA recomendou um chef que faz exatamente o que eu gosto. Economizo 5h por semana!",
    rating: 5,
  },
  {
    name: "Pedro Alves",
    role: "Engenheiro, Rio de Janeiro",
    text: "As listas de compras com sugestões de IA são incríveis. Nunca mais esqueci de comprar nada importante. A entrega sempre no horário que escolho.",
    rating: 5,
  },
  {
    name: "Juliana Mendes",
    role: "Médica, Belo Horizonte",
    text: "Com minha agenda corrida, ter uma plataforma que integra chef, compras e limpeza é um sonho realizado. Recomendo para todo mundo que mora sozinho.",
    rating: 5,
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-orange-50 pt-16 pb-24">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-200 rounded-full blur-3xl" />
        </div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-100 text-purple-700 border-purple-200 px-4 py-1.5 text-sm font-medium">
              <Brain className="w-3.5 h-3.5 mr-1.5" />
              Plataforma com Inteligência Artificial
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Viver sozinho{" "}
              <span className="gradient-brand-text">nunca foi</span>
              {" "}tão fácil
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Chef pessoal, compras inteligentes e limpeza profissional — tudo em um só lugar, personalizado pela IA para a sua rotina.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="gradient-brand text-white border-0 btn-scale px-8 text-base gap-2">
                    Acessar Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="gradient-brand text-white border-0 btn-scale px-8 text-base gap-2">
                    Começar grátis <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              )}
              <Link href="/chefs">
                <Button size="lg" variant="outline" className="px-8 text-base gap-2 btn-scale">
                  Ver Personal Chefs <ChefHat className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" /> Profissionais verificados</span>
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-blue-500" /> Pagamento seguro</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Avaliações reais</span>
              <span className="flex items-center gap-1.5"><Smartphone className="w-4 h-4 text-purple-500" /> Gestão pelo app</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-brand-text">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-orange-100 text-orange-700 border-orange-200">Nossos Serviços</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa, integrado</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Três serviços essenciais para quem mora sozinho, conectados por IA para uma experiência verdadeiramente personalizada.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <Card key={i} className="card-hover border-0 shadow-md overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${service.color}`} />
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{service.description}</p>
                  <ul className="space-y-1.5 mb-6">
                    {service.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={service.href}>
                    <Button variant="outline" className="w-full gap-2 btn-scale">
                      Explorar <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">Como Funciona</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simples como deve ser</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-purple-200 to-orange-200" />
                )}
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 text-white font-bold text-xl shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Research */}
      <section className="py-20 bg-gradient-to-br from-purple-900 to-gray-900 text-white">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-white/10 text-white border-white/20">Pesquisa de Mercado</Badge>
            <h2 className="text-4xl font-bold mb-4">Por que o VidaSó existe</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">
              Dados que comprovam a necessidade e o potencial desta plataforma no mercado brasileiro.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Domicílios Unipessoais", value: "15,9%", desc: "dos domicílios brasileiros têm apenas um morador — 12 milhões de pessoas", source: "IBGE 2022" },
              { title: "Solidão Global", value: "24%", desc: "da população mundial se declara solitária, impulsionando a economia da solidão", source: "Gallup 2023" },
              { title: "Crescimento do Mercado", value: "+23,4%", desc: "de crescimento esperado no mercado de serviços domésticos até 2030", source: "Grand View Research" },
              { title: "Gastos com Alimentação", value: "R$85bi", desc: "movimentados anualmente por pessoas que moram sozinhas em alimentos e bebidas", source: "ABRAS 2023" },
              { title: "Falta de Tempo", value: "68%", desc: "dos moradores solo relatam dificuldade em conciliar trabalho e tarefas domésticas", source: "Pesquisa VidaSó" },
              { title: "Lacuna de Mercado", value: "0", desc: "plataformas integram chef + compras + limpeza com IA personalizada no Brasil", source: "Análise Competitiva" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <p className="text-3xl font-bold text-orange-400 mb-1">{item.value}</p>
                <h4 className="font-semibold text-white mb-2">{item.title}</h4>
                <p className="text-purple-200 text-sm leading-relaxed mb-3">{item.desc}</p>
                <Badge className="bg-white/10 text-purple-200 border-white/10 text-xs">{item.source}</Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-14">
            <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-200">Depoimentos</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">O que nossos usuários dizem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Card key={i} className="card-hover border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-brand flex items-center justify-center text-white font-semibold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl p-12 border border-purple-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pronto para simplificar sua vida?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Junte-se a milhares de pessoas que já descobriram como viver sozinho pode ser mais fácil e prazeroso.
            </p>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="gradient-brand text-white border-0 btn-scale px-10 text-base gap-2">
                  Ir para o Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button size="lg" className="gradient-brand text-white border-0 btn-scale px-10 text-base gap-2">
                  Criar conta gratuita <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
