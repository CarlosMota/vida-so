import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { createBookingReal, getChefByIdReal, getChefReviewsReal } from "@/lib/trpc-real";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Star, MapPin, Award, DollarSign, ChefHat, ArrowLeft,
  Calendar, Clock, MessageSquare, CheckCircle2
} from "lucide-react";

export default function ChefProfile() {
  const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");
  const [address, setAddress] = useState("");
  const [guests, setGuests] = useState("2");
  const [booked, setBooked] = useState(false);
  const [realChef, setRealChef] = useState<any | null>(null);
  const [realReviews, setRealReviews] = useState<any[]>([]);
  const [realLoading, setRealLoading] = useState(false);
  const [bookingRealLoading, setBookingRealLoading] = useState(false);

  const parsedId = parseInt(id ?? "0");
  const { data: chefMock, isLoading: isLoadingMock } = trpc.chefs.getById.useQuery(
    { id: parsedId },
    { enabled: !useRealApi },
  );
  const { data: reviewsMock } = trpc.chefs.getReviews.useQuery(
    { chefId: parsedId },
    { enabled: !useRealApi },
  );

  useEffect(() => {
    if (!useRealApi) return;

    let mounted = true;
    setRealLoading(true);

    const run = async () => {
      try {
        const [chefData, reviewsData] = await Promise.all([
          getChefByIdReal(parsedId),
          getChefReviewsReal(parsedId),
        ]);
        if (mounted) {
          setRealChef(chefData ?? null);
          setRealReviews(reviewsData ?? []);
        }
      } catch {
        if (mounted) {
          setRealChef(null);
          setRealReviews([]);
        }
      } finally {
        if (mounted) setRealLoading(false);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [useRealApi, parsedId]);

  const chef = useRealApi ? realChef : chefMock;
  const reviews = useRealApi ? realReviews : reviewsMock;
  const isLoading = useRealApi ? realLoading : isLoadingMock;

  const utils = trpc.useUtils();
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Agendamento realizado com sucesso!");
      setBookingOpen(false);
      setBooked(true);
      utils.bookings.list.invalidate();
    },
    onError: () => toast.error("Erro ao agendar. Tente novamente."),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 max-w-4xl">
          <Skeleton className="h-64 w-full rounded-2xl mb-6" />
          <Skeleton className="h-8 w-1/2 mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!chef) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h2 className="text-2xl font-bold">Chef não encontrado</h2>
          <Button className="mt-4" onClick={() => navigate("/chefs")}>Voltar</Button>
        </div>
      </div>
    );
  }

  const cuisines = (chef.cuisineTypes as string[]) ?? [];
  const specialties = (chef.specialties as string[]) ?? [];
  const totalPrice = parseFloat(guests) * chef.pricePerPerson;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8 max-w-5xl">
        <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate("/chefs")}>
          <ArrowLeft className="w-4 h-4" /> Voltar para Chefs
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
              {chef.photoUrl ? (
                <img src={chef.photoUrl} alt={chef.name} className="w-full h-full object-cover" />
              ) : (
                <ChefHat className="w-20 h-20 text-purple-300" />
              )}
              {chef.isAvailable && (
                <div className="absolute top-4 left-4 bg-green-500 text-white text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Disponível
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{chef.name}</h1>
                <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">{(chef.rating ?? 0).toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({chef.totalReviews ?? 0} avaliações)</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{chef.city}</span>
                <span className="flex items-center gap-1.5"><Award className="w-4 h-4" />{chef.experience} anos de experiência</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-green-600" /><span className="text-green-700 font-semibold">R$ {chef.pricePerPerson}/pessoa</span></span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {cuisines.map((c: string) => (
                  <Badge key={c} className="bg-purple-100 text-purple-700 border-purple-200">{c}</Badge>
                ))}
              </div>

              <p className="text-gray-700 leading-relaxed">{chef.bio}</p>
            </div>

            {/* Specialties */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Especialidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {specialties.map((s: string) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Avaliações ({reviews?.length ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!reviews || reviews.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhuma avaliação ainda. Seja o primeiro!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((r: any) => (
                      <div key={r.id} className="border-b border-gray-100 pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-md sticky top-24">
              <CardContent className="p-6">
                <div className="text-center mb-5">
                  <p className="text-3xl font-bold text-gray-900">R$ {chef.pricePerPerson}</p>
                  <p className="text-sm text-muted-foreground">por pessoa</p>
                </div>

                {booked ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                    <p className="font-semibold text-green-700">Agendado com sucesso!</p>
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/dashboard")}>
                      Ver no Dashboard
                    </Button>
                  </div>
                ) : isAuthenticated ? (
                  <Button
                    className="w-full gradient-brand text-white border-0 btn-scale gap-2 mb-4"
                    onClick={() => setBookingOpen(true)}
                  >
                    <Calendar className="w-4 h-4" /> Agendar Serviço
                  </Button>
                ) : (
                  <a href={getLoginUrl(`/chefs/${id}`)}>
                    <Button className="w-full gradient-brand text-white border-0 btn-scale gap-2 mb-4">
                      Entrar para Agendar
                    </Button>
                  </a>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Profissional verificado</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Cancelamento gratuito</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Pagamento seguro</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-purple-600" />
              Agendar {chef.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="date">Data e horário</Label>
              <Input
                id="date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="guests">Número de pessoas</Label>
              <Input
                id="guests"
                type="number"
                min="1"
                max="20"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número, bairro, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Restrições alimentares, preferências especiais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 resize-none"
                rows={3}
              />
            </div>
            {scheduledAt && guests && (
              <div className="bg-purple-50 rounded-lg p-3 text-sm">
                <p className="font-semibold text-gray-800 mb-1">Resumo do agendamento:</p>
                <p className="text-gray-600">{parseFloat(guests)} pessoa(s) × R$ {chef.pricePerPerson} = <span className="font-bold text-purple-700">R$ {totalPrice.toFixed(2)}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-brand text-white border-0 btn-scale"
              disabled={!scheduledAt || !address || createBooking.isPending || bookingRealLoading}
              onClick={async () => {
                if (!useRealApi) {
                  createBooking.mutate({
                    serviceType: "chef",
                    providerId: chef.id,
                    scheduledAt,
                    notes,
                    totalPrice,
                    address,
                    serviceSubtype: `${guests} pessoas`,
                  });
                  return;
                }
                setBookingRealLoading(true);
                try {
                  await createBookingReal({
                    serviceType: "chef",
                    providerId: chef.id,
                    scheduledAt,
                    notes,
                    totalPrice,
                    address,
                    serviceSubtype: `${guests} pessoas`,
                  });
                  toast.success("Agendamento realizado com sucesso!");
                  setBookingOpen(false);
                  setBooked(true);
                } catch {
                  toast.error("Erro ao agendar. Tente novamente.");
                } finally {
                  setBookingRealLoading(false);
                }
              }}
            >
              {(createBooking.isPending || bookingRealLoading) ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
