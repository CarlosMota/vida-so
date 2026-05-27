import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ChefHat, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";

const CUISINE_OPTIONS = ["Brasileira", "Italiana", "Japonesa", "Mexicana", "Árabe", "Francesa", "Saudável", "Vegana", "Fitness", "Frutos do Mar", "Churrasco", "Mineira"];
const DIETARY_OPTIONS = ["Vegetariano", "Vegano", "Sem glúten", "Sem lactose", "Low carb", "Cetogênica", "Halal", "Kosher"];
const ALLERGY_OPTIONS = ["Amendoim", "Frutos do mar", "Leite", "Ovos", "Trigo", "Soja", "Nozes", "Peixe"];

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("08:00");

  const savePrefs = trpc.preferences.save.useMutation({
    onSuccess: () => {
      toast.success("Perfil configurado com sucesso!");
      navigate("/dashboard");
    },
    onError: () => toast.error("Erro ao salvar preferências"),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold mb-4">Faça login para continuar</h2>
          <a href={getLoginUrl("/onboarding")}>
            <Button className="gradient-brand text-white border-0">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item]);
  };

  const handleFinish = () => {
    savePrefs.mutate({
      cuisineTypes: cuisines,
      dietaryRestrictions: dietary,
      allergies,
      monthlyBudget: parseFloat(budget) || 0,
      preferredDeliveryTime: deliveryTime,
      onboardingCompleted: true,
    });
  };

  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <Navbar />
      <div className="container py-12 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Passo {step} de {totalSteps}</span>
            <span className="text-sm font-medium text-primary">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full gradient-brand rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-lg border-0">
          {step === 1 && (
            <>
              <CardHeader className="text-center pb-2">
                <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3">
                  <ChefHat className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-2xl">Bem-vindo ao VidaSó!</CardTitle>
                <CardDescription>Vamos personalizar sua experiência. Quais culinárias você mais gosta?</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  {CUISINE_OPTIONS.map((c) => (
                    <Badge
                      key={c}
                      variant={cuisines.includes(c) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${cuisines.includes(c) ? "gradient-brand text-white border-0" : "hover:border-primary"}`}
                      onClick={() => toggleItem(cuisines, setCuisines, c)}
                    >
                      {cuisines.includes(c) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {c}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-6">Selecione quantas quiser ({cuisines.length} selecionadas)</p>
                <Button className="w-full gradient-brand text-white border-0 btn-scale gap-2" onClick={() => setStep(2)}>
                  Próximo <ArrowRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Restrições Alimentares</CardTitle>
                <CardDescription>Você segue alguma dieta específica ou tem restrições?</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2 mb-6">
                  {DIETARY_OPTIONS.map((d) => (
                    <Badge
                      key={d}
                      variant={dietary.includes(d) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${dietary.includes(d) ? "bg-teal-600 text-white border-0" : "hover:border-teal-500"}`}
                      onClick={() => toggleItem(dietary, setDietary, d)}
                    >
                      {dietary.includes(d) && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {d}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-2 font-medium">Alergias alimentares:</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {ALLERGY_OPTIONS.map((a) => (
                    <Badge
                      key={a}
                      variant={allergies.includes(a) ? "default" : "outline"}
                      className={`cursor-pointer px-3 py-1.5 text-sm transition-all ${allergies.includes(a) ? "bg-red-500 text-white border-0" : "hover:border-red-400"}`}
                      onClick={() => toggleItem(allergies, setAllergies, a)}
                    >
                      {a}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 btn-scale" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button className="flex-1 gradient-brand text-white border-0 btn-scale gap-2" onClick={() => setStep(3)}>
                    Próximo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Orçamento Mensal</CardTitle>
                <CardDescription>Qual é o seu orçamento mensal para serviços domésticos?</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="budget">Orçamento mensal (R$)</Label>
                    <Input
                      id="budget"
                      type="number"
                      placeholder="Ex: 800"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["300", "600", "1200"].map((v) => (
                      <Button
                        key={v}
                        variant={budget === v ? "default" : "outline"}
                        size="sm"
                        className={budget === v ? "gradient-brand text-white border-0" : ""}
                        onClick={() => setBudget(v)}
                      >
                        R$ {parseInt(v).toLocaleString("pt-BR")}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 btn-scale" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button className="flex-1 gradient-brand text-white border-0 btn-scale gap-2" onClick={() => setStep(4)}>
                    Próximo <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Horário de Entrega</CardTitle>
                <CardDescription>Qual o horário preferido para receber suas compras?</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="time">Horário preferido</Label>
                    <Input
                      id="time"
                      type="time"
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="mt-1.5"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["08:00", "12:00", "18:00"].map((t) => (
                      <Button
                        key={t}
                        variant={deliveryTime === t ? "default" : "outline"}
                        size="sm"
                        className={deliveryTime === t ? "gradient-brand text-white border-0" : ""}
                        onClick={() => setDeliveryTime(t)}
                      >
                        {t}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-purple-50 rounded-xl p-4 mb-6 text-sm space-y-1">
                  <p className="font-semibold text-gray-800 mb-2">Resumo do seu perfil:</p>
                  <p className="text-gray-600"><span className="font-medium">Culinárias:</span> {cuisines.join(", ") || "Não informado"}</p>
                  <p className="text-gray-600"><span className="font-medium">Restrições:</span> {dietary.join(", ") || "Nenhuma"}</p>
                  <p className="text-gray-600"><span className="font-medium">Alergias:</span> {allergies.join(", ") || "Nenhuma"}</p>
                  <p className="text-gray-600"><span className="font-medium">Orçamento:</span> {budget ? `R$ ${parseInt(budget).toLocaleString("pt-BR")}/mês` : "Não informado"}</p>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 gap-2 btn-scale" onClick={() => setStep(3)}>
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </Button>
                  <Button
                    className="flex-1 gradient-brand text-white border-0 btn-scale gap-2"
                    onClick={handleFinish}
                    disabled={savePrefs.isPending}
                  >
                    {savePrefs.isPending ? "Salvando..." : "Concluir"} <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
