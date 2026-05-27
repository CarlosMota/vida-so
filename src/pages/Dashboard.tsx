import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChefHat, ShoppingCart, Sparkles, Calendar, Star,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowRight, Brain, LayoutDashboard, Plus
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const STATUS_CONFIG = {
  pending: { label: "Pendente", color: "bg-yellow-100 text-yellow-700", icon: AlertCircle },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: CheckCircle2 },
  completed: { label: "Concluído", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

const SERVICE_CONFIG = {
  chef: { label: "Personal Chef", icon: ChefHat, color: "text-purple-600 bg-purple-50" },
  cleaning: { label: "Limpeza", icon: Sparkles, color: "text-teal-600 bg-teal-50" },
  shopping: { label: "Compras", icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
};

function ReviewDialog({ booking, onClose }: { booking: any; onClose: () => void }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const utils = trpc.useUtils();

  const createReview = trpc.reviews.create.useMutation({
    onSuccess: () => {
      toast.success("Avaliação enviada!");
      utils.bookings.list.invalidate();
      onClose();
    },
    onError: () => toast.error("Erro ao enviar avaliação"),
  });

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Avaliar Serviço
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div>
          <p className="text-sm font-medium mb-2">Sua avaliação</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)}>
                <Star className={`w-8 h-8 transition-colors ${s <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium mb-1.5">Comentário (opcional)</p>
          <Textarea
            placeholder="Como foi o serviço?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button
          className="gradient-brand text-white border-0"
          disabled={createReview.isPending}
          onClick={() => {
            if (!booking.providerId) return;
            createReview.mutate({
              bookingId: booking.id,
              providerType: booking.serviceType === "chef" ? "chef" : "cleaner",
              providerId: booking.providerId,
              rating,
              comment,
            });
          }}
        >
          {createReview.isPending ? "Enviando..." : "Enviar Avaliação"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [reviewBooking, setReviewBooking] = useState<any>(null);

  const { data: bookings, isLoading: loadingBookings } = trpc.bookings.list.useQuery(undefined, { enabled: isAuthenticated });
  const { data: prefs } = trpc.preferences.get.useQuery(undefined, { enabled: isAuthenticated });
  const { data: shoppingLists } = trpc.shopping.getLists.useQuery(undefined, { enabled: isAuthenticated });

  const utils = trpc.useUtils();
  const cancelBooking = trpc.bookings.cancel.useMutation({
    onSuccess: () => { toast.success("Agendamento cancelado"); utils.bookings.list.invalidate(); },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <LayoutDashboard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesse seu Dashboard</h2>
          <p className="text-muted-foreground mb-6">Faça login para ver seus agendamentos e serviços.</p>
          <a href={getLoginUrl("/dashboard")}>
            <Button className="gradient-brand text-white border-0 btn-scale">Entrar</Button>
          </a>
        </div>
      </div>
    );
  }

  const upcoming = bookings?.filter((b: any) => ["pending", "confirmed"].includes(b.status) && new Date(b.scheduledAt) > new Date()) ?? [];
  const completed = bookings?.filter((b: any) => b.status === "completed") ?? [];
  const totalSpent = bookings?.filter((b: any) => b.status === "completed").reduce((sum: number, b: any) => sum + (b.totalPrice ?? 0), 0) ?? 0;

  // Monthly spending chart data
  const monthlyData = (() => {
    const months: Record<string, number> = {};
    bookings?.forEach((b: any) => {
      if (b.status === "completed" && b.totalPrice) {
        const month = new Date(b.scheduledAt).toLocaleDateString("pt-BR", { month: "short" });
        months[month] = (months[month] ?? 0) + b.totalPrice;
      }
    });
    return Object.entries(months).map(([month, value]) => ({ month, value }));
  })();

  const hasOnboarding = prefs?.onboardingCompleted;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container py-8">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Olá, {user?.name?.split(" ")[0] ?? "usuário"}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Aqui está um resumo da sua conta</p>
          </div>
          {!hasOnboarding && (
            <Link href="/onboarding">
              <Button className="gradient-brand text-white border-0 btn-scale gap-2">
                <Brain className="w-4 h-4" /> Configurar Perfil IA
              </Button>
            </Link>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Próximos Agendamentos", value: upcoming.length, icon: Calendar, color: "text-blue-600 bg-blue-50" },
            { label: "Serviços Concluídos", value: completed.length, icon: CheckCircle2, color: "text-green-600 bg-green-50" },
            { label: "Listas de Compras", value: shoppingLists?.length ?? 0, icon: ShoppingCart, color: "text-orange-600 bg-orange-50" },
            { label: "Total Gasto", value: `R$ ${totalSpent.toFixed(0)}`, icon: TrendingUp, color: "text-purple-600 bg-purple-50" },
          ].map((stat, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming bookings */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  Próximos Agendamentos
                </CardTitle>
                <span className="text-sm text-muted-foreground">{upcoming.length} agendamento{upcoming.length !== 1 ? "s" : ""}</span>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
                ) : upcoming.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum agendamento futuro</p>
                    <div className="flex gap-2 justify-center mt-3">
                      <Link href="/chefs"><Button size="sm" variant="outline" className="gap-1.5"><ChefHat className="w-3.5 h-3.5" />Chef</Button></Link>
                      <Link href="/limpeza"><Button size="sm" variant="outline" className="gap-1.5"><Sparkles className="w-3.5 h-3.5" />Limpeza</Button></Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((b: any) => {
                      const svc = SERVICE_CONFIG[b.serviceType as keyof typeof SERVICE_CONFIG];
                      const st = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
                      return (
                        <div key={b.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div className={`w-10 h-10 rounded-xl ${svc?.color} flex items-center justify-center shrink-0`}>
                            {svc && <svc.icon className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">{svc?.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(b.scheduledAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                            {b.serviceSubtype && <p className="text-xs text-muted-foreground">{b.serviceSubtype}</p>}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`text-xs ${st?.color}`}>{st?.label}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive hover:text-destructive h-7"
                              onClick={() => cancelBooking.mutate({ bookingId: b.id })}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Histórico de Serviços
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completed.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum serviço concluído ainda</p>
                ) : (
                  <div className="space-y-2">
                    {completed.slice(0, 5).map((b: any) => {
                      const svc = SERVICE_CONFIG[b.serviceType as keyof typeof SERVICE_CONFIG];
                      return (
                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                          <div className={`w-9 h-9 rounded-lg ${svc?.color} flex items-center justify-center shrink-0`}>
                            {svc && <svc.icon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800">{svc?.label}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(b.scheduledAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                          {b.totalPrice && (
                            <p className="text-sm font-semibold text-gray-700 shrink-0">R$ {b.totalPrice.toFixed(0)}</p>
                          )}
                          {b.serviceType !== "shopping" && b.providerId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs gap-1 h-7 shrink-0"
                              onClick={() => setReviewBooking(b)}
                            >
                              <Star className="w-3 h-3" /> Avaliar
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Spending chart */}
            {monthlyData.length > 0 && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-500" />
                    Gastos Mensais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `R$${v}`} />
                      <Tooltip formatter={(v: any) => [`R$ ${v.toFixed(2)}`, "Gasto"]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {monthlyData.map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? "#7c3aed" : "#f97316"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick actions */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/chefs">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 btn-scale">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-purple-600" />
                    </div>
                    Contratar Chef
                  </Button>
                </Link>
                <Link href="/compras">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 btn-scale">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4 text-orange-600" />
                    </div>
                    Nova Lista de Compras
                  </Button>
                </Link>
                <Link href="/limpeza">
                  <Button variant="outline" className="w-full justify-start gap-3 h-11 btn-scale">
                    <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                    </div>
                    Agendar Limpeza
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-600" />
                  Recomendações IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!hasOnboarding ? (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-600 mb-3">Configure seu perfil para receber recomendações personalizadas</p>
                    <Link href="/onboarding">
                      <Button size="sm" className="gradient-brand text-white border-0 btn-scale gap-1.5">
                        <Plus className="w-3.5 h-3.5" /> Configurar Perfil
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-lg p-3 text-sm border border-purple-100">
                      <p className="font-medium text-gray-800 mb-1">🍽️ Chef recomendado</p>
                      <p className="text-gray-600 text-xs">Baseado nas suas preferências, veja os chefs com maior compatibilidade.</p>
                      <Link href="/chefs">
                        <Button size="sm" variant="link" className="p-0 h-auto text-purple-600 text-xs mt-1 gap-1">
                          Ver recomendações <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-sm border border-orange-100">
                      <p className="font-medium text-gray-800 mb-1">🛒 Hora de repor o estoque!</p>
                      <p className="text-gray-600 text-xs">Use a IA para sugerir itens baseados no seu histórico.</p>
                      <Link href="/compras">
                        <Button size="sm" variant="link" className="p-0 h-auto text-orange-600 text-xs mt-1 gap-1">
                          Criar lista <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Profile summary */}
            {prefs && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Meu Perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(prefs.cuisineTypes as string[])?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Culinárias favoritas</p>
                      <div className="flex flex-wrap gap-1">
                        {(prefs.cuisineTypes as string[]).slice(0, 4).map((c: string) => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {prefs.monthlyBudget && prefs.monthlyBudget > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Orçamento mensal</span>
                      <span className="font-semibold">R$ {prefs.monthlyBudget.toLocaleString("pt-BR")}</span>
                    </div>
                  )}
                  <Link href="/onboarding">
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs">Editar Preferências</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={(o) => !o && setReviewBooking(null)}>
        {reviewBooking && <ReviewDialog booking={reviewBooking} onClose={() => setReviewBooking(null)} />}
      </Dialog>

      <Footer />
    </div>
  );
}
