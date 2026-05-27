import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, Sparkles, Search, MapPin, DollarSign, CheckCircle2, Calendar } from "lucide-react";

const SERVICE_TYPES = [
  { key: "basic", label: "Limpeza Básica", desc: "Limpeza geral dos cômodos, aspiração e lavagem de pisos", priceKey: "priceBasic" },
  { key: "deep", label: "Limpeza Profunda", desc: "Limpeza completa incluindo armários, geladeira e banheiros", priceKey: "priceDeep" },
  { key: "weekly", label: "Pacote Semanal", desc: "Visitas semanais com desconto especial", priceKey: "priceWeekly" },
];

function CleanerCard({ cleaner, onBook }: { cleaner: any; onBook: (c: any) => void }) {
  const serviceTypes = (cleaner.serviceTypes as string[]) ?? [];

  return (
    <Card className="card-hover border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-44 bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
          {cleaner.photoUrl ? (
            <img src={cleaner.photoUrl} alt={cleaner.name} className="w-full h-full object-cover" />
          ) : (
            <Sparkles className="w-14 h-14 text-teal-300" />
          )}
          {cleaner.isAvailable && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Disponível
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg">{cleaner.name}</h3>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{(cleaner.rating ?? 0).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({cleaner.totalReviews ?? 0})</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3.5 h-3.5" />{cleaner.city}
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {serviceTypes.slice(0, 3).map((s: string) => (
              <Badge key={s} variant="secondary" className="text-xs bg-teal-50 text-teal-700">{s}</Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{cleaner.bio}</p>

          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-800">R$ {cleaner.priceBasic}</p>
              <p className="text-muted-foreground">Básica</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-800">R$ {cleaner.priceDeep}</p>
              <p className="text-muted-foreground">Profunda</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="font-bold text-gray-800">R$ {cleaner.priceWeekly}</p>
              <p className="text-muted-foreground">Semanal</p>
            </div>
          </div>

          <Button
            className="w-full bg-teal-600 hover:bg-teal-700 text-white border-0 btn-scale gap-2"
            onClick={() => onBook(cleaner)}
          >
            <Calendar className="w-4 h-4" /> Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Cleaners() {
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [selectedCleaner, setSelectedCleaner] = useState<any>(null);
  const [serviceType, setServiceType] = useState("basic");
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [booked, setBooked] = useState(false);

  const { data: cleaners, isLoading } = trpc.cleaners.list.useQuery(
    { serviceType: serviceFilter !== "all" ? serviceFilter : undefined }
  );

  const utils = trpc.useUtils();
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      toast.success("Limpeza agendada com sucesso!");
      setSelectedCleaner(null);
      setBooked(true);
      utils.bookings.list.invalidate();
    },
    onError: () => toast.error("Erro ao agendar. Tente novamente."),
  });

  const filtered = cleaners?.filter((c: any) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.city?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const selectedService = SERVICE_TYPES.find((s) => s.key === serviceType);
  const price = selectedCleaner ? selectedCleaner[selectedService?.priceKey ?? "priceBasic"] : 0;

  const handleBook = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/limpeza");
      return;
    }
    createBooking.mutate({
      serviceType: "cleaning",
      providerId: selectedCleaner.id,
      scheduledAt,
      notes,
      totalPrice: price,
      address,
      serviceSubtype: selectedService?.label,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Limpeza Residencial</h1>
          </div>
          <p className="text-teal-200 text-lg max-w-2xl">
            Profissionais verificados e avaliados para manter sua casa sempre impecável. Escolha o tipo de serviço e agende online.
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Service types info */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {SERVICE_TYPES.map((st) => (
            <div key={st.key} className="bg-teal-50 border border-teal-100 rounded-xl p-4">
              <h4 className="font-semibold text-teal-800 mb-1">{st.label}</h4>
              <p className="text-sm text-teal-600">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou cidade..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="Tipo de serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="Limpeza básica">Limpeza Básica</SelectItem>
                <SelectItem value="Limpeza profunda">Limpeza Profunda</SelectItem>
                <SelectItem value="Limpeza semanal">Pacote Semanal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md overflow-hidden">
                <Skeleton className="h-44 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Nenhum profissional encontrado</h3>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} profissional{filtered.length !== 1 ? "is" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((c: any) => (
                <CleanerCard key={c.id} cleaner={c} onBook={setSelectedCleaner} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Booking Dialog */}
      <Dialog open={!!selectedCleaner} onOpenChange={(o) => !o && setSelectedCleaner(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-600" />
              Agendar {selectedCleaner?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Tipo de serviço</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {SERVICE_TYPES.map((st) => (
                  <button
                    key={st.key}
                    onClick={() => setServiceType(st.key)}
                    className={`p-2 rounded-lg border text-xs text-center transition-all ${serviceType === st.key ? "border-teal-500 bg-teal-50 text-teal-700 font-semibold" : "border-gray-200 hover:border-teal-300"}`}
                  >
                    <p className="font-medium">{st.label.replace("Limpeza ", "")}</p>
                    <p className="text-muted-foreground mt-0.5">R$ {selectedCleaner?.[st.priceKey]}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="clean-date">Data e horário</Label>
              <Input
                id="clean-date"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="clean-address">Endereço</Label>
              <Input
                id="clean-address"
                placeholder="Rua, número, bairro, cidade"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="clean-notes">Observações (opcional)</Label>
              <Textarea
                id="clean-notes"
                placeholder="Número de cômodos, pets, acesso ao imóvel..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 resize-none"
                rows={2}
              />
            </div>
            {price > 0 && (
              <div className="bg-teal-50 rounded-lg p-3 text-sm">
                <p className="text-gray-700">Total: <span className="font-bold text-teal-700 text-base">R$ {price}</span></p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedCleaner(null)}>Cancelar</Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 text-white border-0 btn-scale"
              disabled={!scheduledAt || !address || createBooking.isPending}
              onClick={handleBook}
            >
              {createBooking.isPending ? "Agendando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
