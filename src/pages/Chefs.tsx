import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getChefsListReal, getChefsMatchReal } from "@/lib/trpc-real";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Star, Search, Brain, ChefHat, MapPin, DollarSign, Award } from "lucide-react";

function ChefCard({ chef, matchScore }: { chef: any; matchScore?: number }) {
  const cuisines = (chef.cuisineTypes as string[]) ?? [];
  const specialties = (chef.specialties as string[]) ?? [];

  return (
    <Card className="card-hover border-0 shadow-md overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
          {chef.photoUrl ? (
            <img src={chef.photoUrl} alt={chef.name} className="w-full h-full object-cover" />
          ) : (
            <ChefHat className="w-16 h-16 text-purple-300" />
          )}
          {matchScore !== undefined && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Brain className="w-3 h-3" /> {matchScore}% match
            </div>
          )}
          {chef.isAvailable && (
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              Disponível
            </div>
          )}
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">{chef.name}</h3>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-sm">{(chef.rating ?? 0).toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({chef.totalReviews ?? 0})</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{chef.city}</span>
            <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{chef.experience} anos</span>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {cuisines.slice(0, 3).map((c: string) => (
              <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-4">{chef.bio}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-bold text-green-700">R$ {chef.pricePerPerson}/pessoa</span>
            </div>
            <Link href={`/chefs/${chef.id}`}>
              <Button size="sm" className="gradient-brand text-white border-0 btn-scale">
                Ver Perfil
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Chefs() {
  const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [maxPrice, setMaxPrice] = useState("all");
  const [useAI, setUseAI] = useState(false);
  const [realChefs, setRealChefs] = useState<any[] | undefined>(undefined);
  const [realLoading, setRealLoading] = useState(false);

  const { data: allChefs, isLoading: loadingAll } = trpc.chefs.list.useQuery(
    { cuisine: cuisine !== "all" ? cuisine : undefined, maxPrice: maxPrice !== "all" ? parseInt(maxPrice) : undefined },
    { enabled: !useAI && !useRealApi }
  );

  const { data: matchedChefs, isLoading: loadingMatch } = trpc.chefs.match.useQuery(
    undefined,
    { enabled: useAI && isAuthenticated && !useRealApi }
  );

  useEffect(() => {
    if (!useRealApi) return;

    let mounted = true;
    setRealLoading(true);

    const run = async () => {
      try {
        if (useAI) {
          if (!isAuthenticated) {
            if (mounted) setRealChefs([]);
            return;
          }
          const data = await getChefsMatchReal();
          if (mounted) setRealChefs(data ?? []);
          return;
        }

        const data = await getChefsListReal({
          cuisine: cuisine !== "all" ? cuisine : undefined,
          maxPrice: maxPrice !== "all" ? parseInt(maxPrice) : undefined,
        });
        if (mounted) setRealChefs(data ?? []);
      } catch {
        if (mounted) setRealChefs([]);
      } finally {
        if (mounted) setRealLoading(false);
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [useRealApi, useAI, isAuthenticated, cuisine, maxPrice]);

  const isLoading = useRealApi ? realLoading : useAI ? loadingMatch : loadingAll;
  const chefs = useRealApi ? realChefs : useAI ? matchedChefs : allChefs;

  const filtered = chefs?.filter((c: any) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.cuisineTypes as string[]).some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  ) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <ChefHat className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Personal Chefs</h1>
          </div>
          <p className="text-purple-200 text-lg max-w-2xl">
            Encontre o chef perfeito para você. Nossa IA analisa suas preferências e recomenda os melhores profissionais.
          </p>
        </div>
      </section>

      <div className="container py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou culinária..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cuisine} onValueChange={setCuisine}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Culinária" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as culinárias</SelectItem>
                <SelectItem value="Brasileira">Brasileira</SelectItem>
                <SelectItem value="Italiana">Italiana</SelectItem>
                <SelectItem value="Japonesa">Japonesa</SelectItem>
                <SelectItem value="Saudável">Saudável</SelectItem>
                <SelectItem value="Vegana">Vegana</SelectItem>
              </SelectContent>
            </Select>
            <Select value={maxPrice} onValueChange={setMaxPrice}>
              <SelectTrigger className="w-full md:w-44">
                <SelectValue placeholder="Preço máximo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer preço</SelectItem>
                <SelectItem value="80">Até R$ 80</SelectItem>
                <SelectItem value="100">Até R$ 100</SelectItem>
                <SelectItem value="130">Até R$ 130</SelectItem>
              </SelectContent>
            </Select>
            {isAuthenticated && (
              <Button
                variant={useAI ? "default" : "outline"}
                className={`gap-2 shrink-0 btn-scale ${useAI ? "gradient-brand text-white border-0" : ""}`}
                onClick={() => setUseAI(!useAI)}
              >
                <Brain className="w-4 h-4" />
                {useAI ? "IA Ativa" : "Usar IA"}
              </Button>
            )}
          </div>
          {useAI && (
            <p className="text-sm text-purple-600 mt-3 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Mostrando chefs ordenados por compatibilidade com seu perfil
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-md overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">Nenhum chef encontrado</h3>
            <p className="text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} chef{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((chef: any) => (
                <ChefCard key={chef.id} chef={chef} matchScore={useAI ? chef.matchScore : undefined} />
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
