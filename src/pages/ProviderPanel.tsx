import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChefHat, Sparkles, Calendar, Star, Users, DollarSign,
  CheckCircle2, Clock, ArrowRight, Settings, BarChart2
} from "lucide-react";

export default function ProviderPanel() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "register" | "bookings">("overview");
  const [providerType, setProviderType] = useState<"chef" | "cleaner">("chef");

  // Chef registration form
  const [chefName, setChefName] = useState("");
  const [chefBio, setChefBio] = useState("");
  const [chefPrice, setChefPrice] = useState("");
  const [chefCity, setChefCity] = useState("");
  const [chefExperience, setChefExperience] = useState("");
  const [chefCuisines, setChefCuisines] = useState<string[]>([]);
  const [chefSpecialties, setChefSpecialties] = useState<string[]>([]);

  // Cleaner registration form
  const [cleanerName, setCleanerName] = useState("");
  const [cleanerBio, setCleanerBio] = useState("");
  const [cleanerCity, setCleanerCity] = useState("");
  const [cleanerPriceBasic, setCleanerPriceBasic] = useState("150");
  const [cleanerPriceDeep, setCleanerPriceDeep] = useState("250");
  const [cleanerPriceWeekly, setCleanerPriceWeekly] = useState("400");

  const CUISINE_OPTIONS = ["Brasileira", "Italiana", "Japonesa", "Mexicana", "Francesa", "Saudável", "Vegana", "Fitness", "Frutos do Mar", "Churrasco", "Mineira", "Fusion"];
  const SPECIALTY_OPTIONS = ["Marmitas saudáveis", "Jantares especiais", "Brunch", "Massas artesanais", "Risotos", "Sobremesas", "Sushi", "Churrasco", "Frutos do mar", "Doces"];
  const SERVICE_OPTIONS = ["Limpeza básica", "Limpeza profunda", "Limpeza semanal", "Pós-obra", "Organização", "Higienização"];

  const [cleanerServices, setCleanerServices] = useState<string[]>([]);

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleRegisterChef = async () => {
    if (!chefName || !chefPrice || !chefCity) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    // In a real app, this would call a tRPC mutation to insert into DB
    toast.success("Cadastro de chef enviado para análise! Em breve entraremos em contato.");
  };

  const handleRegisterCleaner = async () => {
    if (!cleanerName || !cleanerCity) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    toast.success("Cadastro de profissional enviado para análise! Em breve entraremos em contato.");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center max-w-md mx-auto">
          <Settings className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Painel de Prestadores</h2>
          <p className="text-muted-foreground mb-6">Faça login para acessar o painel de prestadores.</p>
          <a href={getLoginUrl("/prestador")}>
            <Button className="gradient-brand text-white border-0 btn-scale">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-2">Painel de Prestadores</h1>
          <p className="text-gray-300">Gerencie seus serviços, agenda e visualize seus agendamentos.</p>
        </div>
      </section>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 pb-0">
          {[
            { key: "overview", label: "Visão Geral", icon: BarChart2 },
            { key: "register", label: "Cadastrar Serviço", icon: Plus },
            { key: "bookings", label: "Minha Agenda", icon: Calendar },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === key ? "border-purple-600 text-purple-700" : "border-transparent text-muted-foreground hover:text-gray-700"}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chef card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-purple-500 to-purple-700" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Personal Chef</h3>
                      <p className="text-sm text-muted-foreground">Ofereça serviços culinários</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {["Ganhe de R$ 75 a R$ 150+ por sessão", "Defina sua própria agenda", "Receba avaliações e construa reputação", "Matching automático por IA"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full gradient-brand text-white border-0 btn-scale gap-2"
                    onClick={() => { setProviderType("chef"); setActiveTab("register"); }}
                  >
                    Cadastrar como Chef <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              {/* Cleaner card */}
              <Card className="border-0 shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-teal-700" />
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Profissional de Limpeza</h3>
                      <p className="text-sm text-muted-foreground">Ofereça serviços de limpeza</p>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-5">
                    {["Ganhe de R$ 140 a R$ 450+ por serviço", "Escolha os tipos de limpeza", "Clientes verificados e seguros", "Pagamento garantido pela plataforma"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white border-0 btn-scale gap-2"
                    onClick={() => { setProviderType("cleaner"); setActiveTab("register"); }}
                  >
                    Cadastrar como Profissional <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Stats preview */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Por que ser prestador no VidaSó?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { value: "12M+", label: "Potenciais clientes", icon: Users },
                    { value: "R$0", label: "Taxa de cadastro", icon: DollarSign },
                    { value: "4.8★", label: "Avaliação média", icon: Star },
                    { value: "24h", label: "Suporte ao prestador", icon: Clock },
                  ].map((s, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl">
                      <s.icon className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Register */}
        {activeTab === "register" && (
          <div className="max-w-2xl">
            {/* Type selector */}
            <div className="flex gap-3 mb-6">
              <Button
                variant={providerType === "chef" ? "default" : "outline"}
                className={`gap-2 btn-scale ${providerType === "chef" ? "gradient-brand text-white border-0" : ""}`}
                onClick={() => setProviderType("chef")}
              >
                <ChefHat className="w-4 h-4" /> Personal Chef
              </Button>
              <Button
                variant={providerType === "cleaner" ? "default" : "outline"}
                className={`gap-2 btn-scale ${providerType === "cleaner" ? "bg-teal-600 text-white border-0" : ""}`}
                onClick={() => setProviderType("cleaner")}
              >
                <Sparkles className="w-4 h-4" /> Profissional de Limpeza
              </Button>
            </div>

            {providerType === "chef" ? (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Cadastro de Personal Chef</CardTitle>
                  <CardDescription>Preencha suas informações para começar a receber clientes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Nome completo *</Label>
                      <Input value={chefName} onChange={(e) => setChefName(e.target.value)} placeholder="Seu nome" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Cidade *</Label>
                      <Input value={chefCity} onChange={(e) => setChefCity(e.target.value)} placeholder="São Paulo" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Experiência (anos) *</Label>
                      <Input type="number" value={chefExperience} onChange={(e) => setChefExperience(e.target.value)} placeholder="5" className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label>Preço por pessoa (R$) *</Label>
                      <Input type="number" value={chefPrice} onChange={(e) => setChefPrice(e.target.value)} placeholder="85" className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label>Bio / Apresentação *</Label>
                      <Textarea value={chefBio} onChange={(e) => setChefBio(e.target.value)} placeholder="Conte sobre sua experiência, formação e estilo culinário..." className="mt-1.5 resize-none" rows={3} />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Culinárias que você domina</Label>
                    <div className="flex flex-wrap gap-2">
                      {CUISINE_OPTIONS.map((c) => (
                        <Badge
                          key={c}
                          variant={chefCuisines.includes(c) ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${chefCuisines.includes(c) ? "gradient-brand text-white border-0" : "hover:border-purple-400"}`}
                          onClick={() => toggleItem(chefCuisines, setChefCuisines, c)}
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Especialidades</Label>
                    <div className="flex flex-wrap gap-2">
                      {SPECIALTY_OPTIONS.map((s) => (
                        <Badge
                          key={s}
                          variant={chefSpecialties.includes(s) ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${chefSpecialties.includes(s) ? "bg-orange-500 text-white border-0" : "hover:border-orange-400"}`}
                          onClick={() => toggleItem(chefSpecialties, setChefSpecialties, s)}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full gradient-brand text-white border-0 btn-scale gap-2 mt-2"
                    onClick={handleRegisterChef}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Enviar Cadastro
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Cadastro de Profissional de Limpeza</CardTitle>
                  <CardDescription>Preencha suas informações para começar a receber clientes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Nome completo *</Label>
                      <Input value={cleanerName} onChange={(e) => setCleanerName(e.target.value)} placeholder="Seu nome" className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label>Cidade *</Label>
                      <Input value={cleanerCity} onChange={(e) => setCleanerCity(e.target.value)} placeholder="São Paulo" className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Preço Limpeza Básica (R$)</Label>
                      <Input type="number" value={cleanerPriceBasic} onChange={(e) => setCleanerPriceBasic(e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Preço Limpeza Profunda (R$)</Label>
                      <Input type="number" value={cleanerPriceDeep} onChange={(e) => setCleanerPriceDeep(e.target.value)} className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label>Preço Pacote Semanal (R$)</Label>
                      <Input type="number" value={cleanerPriceWeekly} onChange={(e) => setCleanerPriceWeekly(e.target.value)} className="mt-1.5" />
                    </div>
                    <div className="col-span-2">
                      <Label>Bio / Apresentação</Label>
                      <Textarea value={cleanerBio} onChange={(e) => setCleanerBio(e.target.value)} placeholder="Conte sobre sua experiência e diferenciais..." className="mt-1.5 resize-none" rows={3} />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Tipos de serviço que você oferece</Label>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_OPTIONS.map((s) => (
                        <Badge
                          key={s}
                          variant={cleanerServices.includes(s) ? "default" : "outline"}
                          className={`cursor-pointer text-xs ${cleanerServices.includes(s) ? "bg-teal-600 text-white border-0" : "hover:border-teal-400"}`}
                          onClick={() => toggleItem(cleanerServices, setCleanerServices, s)}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white border-0 btn-scale gap-2 mt-2"
                    onClick={handleRegisterCleaner}
                  >
                    <CheckCircle2 className="w-4 h-4" /> Enviar Cadastro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Bookings */}
        {activeTab === "bookings" && (
          <div className="max-w-2xl">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Minha Agenda
                </CardTitle>
                <CardDescription>
                  Visualize os agendamentos recebidos pelos seus serviços
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-medium text-gray-600 mb-1">Nenhum agendamento ainda</p>
                  <p className="text-sm">Após seu cadastro ser aprovado, os agendamentos aparecerão aqui.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setActiveTab("register")}
                  >
                    Cadastrar Serviço
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// Missing import
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
