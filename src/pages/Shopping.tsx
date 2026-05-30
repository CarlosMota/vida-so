import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  addShoppingItemReal,
  createShoppingListReal,
  getShoppingItemsReal,
  getShoppingListsReal,
  removeShoppingItemReal,
  scheduleShoppingDeliveryReal,
  suggestShoppingItemsReal,
  toggleShoppingItemReal,
} from "@/lib/trpc-real";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShoppingCart, Plus, Trash2, Brain, Calendar, Package,
  CheckCircle2, Clock, Loader2, ArrowRight, Sparkles
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  "Hortifruti": "bg-green-100 text-green-700",
  "Proteínas": "bg-red-100 text-red-700",
  "Laticínios": "bg-blue-100 text-blue-700",
  "Grãos e Cereais": "bg-yellow-100 text-yellow-700",
  "Bebidas": "bg-cyan-100 text-cyan-700",
  "Limpeza": "bg-purple-100 text-purple-700",
  "Higiene": "bg-pink-100 text-pink-700",
  "Outros": "bg-gray-100 text-gray-700",
};

export default function Shopping() {
  const { isAuthenticated } = useAuth();
  const useRealApi = import.meta.env.VITE_USE_REAL_API === "true";
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [newListName, setNewListName] = useState("");
  const [newItem, setNewItem] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newUnit, setNewUnit] = useState("unidade");
  const [aiContext, setAiContext] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [deliveryAt, setDeliveryAt] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [realLists, setRealLists] = useState<any[]>([]);
  const [realItems, setRealItems] = useState<any[]>([]);
  const [loadingRealLists, setLoadingRealLists] = useState(false);
  const [loadingRealItems, setLoadingRealItems] = useState(false);
  const [creatingListReal, setCreatingListReal] = useState(false);
  const [addingItemReal, setAddingItemReal] = useState(false);
  const [schedulingReal, setSchedulingReal] = useState(false);
  const [suggestingReal, setSuggestingReal] = useState(false);

  const utils = trpc.useUtils();
  const { data: mockLists, isLoading: loadingMockLists } = trpc.shopping.getLists.useQuery(undefined, { enabled: isAuthenticated && !useRealApi });
  const { data: mockItems, isLoading: loadingMockItems } = trpc.shopping.getItems.useQuery(
    { listId: selectedListId! },
    { enabled: !!selectedListId && !useRealApi }
  );

  const createList = trpc.shopping.createList.useMutation({
    onSuccess: () => { utils.shopping.getLists.invalidate(); setNewListName(""); toast.success("Lista criada!"); },
  });
  const addItem = trpc.shopping.addItem.useMutation({
    onSuccess: () => { utils.shopping.getItems.invalidate({ listId: selectedListId! }); setNewItem(""); setNewQty("1"); },
  });
  const removeItem = trpc.shopping.removeItem.useMutation({
    onSuccess: () => utils.shopping.getItems.invalidate({ listId: selectedListId! }),
  });
  const toggleItem = trpc.shopping.toggleItem.useMutation({
    onSuccess: () => utils.shopping.getItems.invalidate({ listId: selectedListId! }),
  });
  const schedule = trpc.shopping.scheduleDelivery.useMutation({
    onSuccess: () => {
      utils.shopping.getLists.invalidate();
      setScheduleOpen(false);
      toast.success("Entrega agendada com sucesso!");
    },
  });
  const suggestItems = trpc.shopping.suggestItems.useMutation({
    onSuccess: async (suggestions: any[]) => {
      if (!selectedListId) return;
      for (const item of suggestions) {
        await addItem.mutateAsync({
          listId: selectedListId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          estimatedPrice: item.estimatedPrice,
          category: item.category,
        });
      }
      toast.success(`${suggestions.length} itens sugeridos pela IA adicionados!`);
      setAiLoading(false);
    },
    onError: () => { toast.error("Erro ao gerar sugestões"); setAiLoading(false); },
  });

  async function refreshListsReal() {
    const lists = await getShoppingListsReal();
    setRealLists(lists ?? []);
  }

  async function refreshItemsReal(listId: number) {
    const items = await getShoppingItemsReal(listId);
    setRealItems(items ?? []);
  }

  async function handleCreateList() {
    if (!newListName) return;
    if (!useRealApi) {
      createList.mutate({ name: newListName });
      return;
    }
    setCreatingListReal(true);
    try {
      await createShoppingListReal({ name: newListName });
      await refreshListsReal();
      setNewListName("");
      toast.success("Lista criada!");
    } catch {
      toast.error("Erro ao criar lista");
    } finally {
      setCreatingListReal(false);
    }
  }

  async function handleAddItem() {
    if (!newItem || !selectedListId) return;
    if (!useRealApi) {
      addItem.mutate({ listId: selectedListId, name: newItem, quantity: newQty, unit: newUnit });
      return;
    }
    setAddingItemReal(true);
    try {
      await addShoppingItemReal({ listId: selectedListId, name: newItem, quantity: newQty, unit: newUnit });
      await refreshItemsReal(selectedListId);
      setNewItem("");
      setNewQty("1");
    } catch {
      toast.error("Erro ao adicionar item");
    } finally {
      setAddingItemReal(false);
    }
  }

  useEffect(() => {
    if (!useRealApi || !isAuthenticated) return;
    let mounted = true;
    async function loadLists() {
      setLoadingRealLists(true);
      try {
        const lists = await getShoppingListsReal();
        if (!mounted) return;
        setRealLists(lists ?? []);
      } catch {
        if (!mounted) return;
        toast.error("Falha ao carregar listas reais");
      } finally {
        if (mounted) setLoadingRealLists(false);
      }
    }
    loadLists();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, useRealApi]);

  useEffect(() => {
    if (!useRealApi || !isAuthenticated || !selectedListId) {
      setRealItems([]);
      return;
    }
    let mounted = true;
    async function loadItems() {
      setLoadingRealItems(true);
      try {
        const items = await getShoppingItemsReal(selectedListId);
        if (!mounted) return;
        setRealItems(items ?? []);
      } catch {
        if (!mounted) return;
        toast.error("Falha ao carregar itens reais");
      } finally {
        if (mounted) setLoadingRealItems(false);
      }
    }
    loadItems();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, selectedListId, useRealApi]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center max-w-md mx-auto">
          <ShoppingCart className="w-16 h-16 text-orange-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Faça login para usar as Compras</h2>
          <p className="text-muted-foreground mb-6">Crie listas inteligentes e agende entregas no horário que preferir.</p>
          <a href={getLoginUrl("/compras")}>
            <Button className="gradient-brand text-white border-0 btn-scale gap-2">
              Entrar <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
        <Footer />
      </div>
    );
  }

  const lists = useRealApi ? realLists : (mockLists ?? []);
  const items = useRealApi ? realItems : (mockItems ?? []);
  const loadingLists = useRealApi ? loadingRealLists : loadingMockLists;
  const loadingItems = useRealApi ? loadingRealItems : loadingMockItems;

  const selectedList = lists.find((l: any) => l.id === selectedListId);
  const checkedCount = items?.filter((i: any) => i.checked).length ?? 0;
  const totalEstimate = items?.reduce((sum: number, i: any) => sum + (i.estimatedPrice ?? 0) * parseFloat(i.quantity ?? "1"), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-orange-500 to-orange-700 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-4xl font-bold">Compras Inteligentes</h1>
          </div>
          <p className="text-orange-100 text-lg max-w-2xl">
            Crie listas de compras, receba sugestões personalizadas por IA e agende a entrega no horário que preferir.
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Lists sidebar */}
          <div className="space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-500" />
                  Minhas Listas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome da lista..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && newListName && handleCreateList()}
                    className="text-sm"
                  />
                  <Button
                    size="icon"
                    className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white border-0"
                    disabled={!newListName || createList.isPending || creatingListReal}
                    onClick={handleCreateList}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {loadingLists ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : !lists || lists.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Crie sua primeira lista!</p>
                ) : (
                  <div className="space-y-1.5">
                    {lists.map((list: any) => (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(list.id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${selectedListId === list.id ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/50"}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm text-gray-800 truncate">{list.name}</p>
                          <Badge
                            className={`text-xs ml-2 shrink-0 ${list.status === "ordered" ? "bg-blue-100 text-blue-700" : list.status === "delivered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {list.status === "draft" ? "Rascunho" : list.status === "ordered" ? "Pedido" : list.status === "delivered" ? "Entregue" : list.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(list.createdAt).toLocaleDateString("pt-BR")}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Items */}
          <div className="lg:col-span-2">
            {!selectedListId ? (
              <div className="text-center py-20 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Selecione ou crie uma lista para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* List header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedList?.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {checkedCount}/{items?.length ?? 0} itens marcados · Estimativa: <span className="font-semibold text-orange-600">R$ {totalEstimate.toFixed(2)}</span>
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white border-0 gap-2 btn-scale"
                    onClick={() => setScheduleOpen(true)}
                    disabled={!items || items.length === 0}
                  >
                    <Calendar className="w-4 h-4" /> Agendar Entrega
                  </Button>
                </div>

                {/* Add item */}
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar item..."
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newItem && selectedListId) {
                            handleAddItem();
                          }
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Qtd"
                        value={newQty}
                        onChange={(e) => setNewQty(e.target.value)}
                        className="w-16"
                      />
                      <Input
                        placeholder="Un."
                        value={newUnit}
                        onChange={(e) => setNewUnit(e.target.value)}
                        className="w-20"
                      />
                      <Button
                        className="bg-orange-500 hover:bg-orange-600 text-white border-0 shrink-0"
                        disabled={!newItem || addItem.isPending || addingItemReal}
                        onClick={handleAddItem}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Suggestions */}
                <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-orange-50 border border-purple-100">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-purple-600" />
                      <p className="font-semibold text-sm text-gray-800">Sugestões por IA</p>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: jantar para semana, café da manhã saudável..."
                        value={aiContext}
                        onChange={(e) => setAiContext(e.target.value)}
                        className="flex-1 text-sm bg-white"
                      />
                      <Button
                        className="gradient-brand text-white border-0 btn-scale gap-2 shrink-0"
                        disabled={aiLoading || suggestItems.isPending || suggestingReal}
                        onClick={async () => {
                          setAiLoading(true);
                          if (!useRealApi) {
                            suggestItems.mutate({ context: aiContext || "compras semanais básicas" });
                            return;
                          }
                          if (!selectedListId) {
                            setAiLoading(false);
                            toast.error("Selecione uma lista antes");
                            return;
                          }
                          setSuggestingReal(true);
                          try {
                            const suggestions = await suggestShoppingItemsReal({ context: aiContext || "compras semanais básicas" });
                            for (const item of suggestions ?? []) {
                              await addShoppingItemReal({
                                listId: selectedListId,
                                name: item.name,
                                quantity: item.quantity,
                                unit: item.unit,
                                estimatedPrice: item.estimatedPrice,
                                category: item.category,
                              });
                            }
                            await refreshItemsReal(selectedListId);
                            toast.success(`${(suggestions ?? []).length} itens sugeridos pela IA adicionados!`);
                          } catch {
                            toast.error("Erro ao gerar sugestões");
                          } finally {
                            setSuggestingReal(false);
                            setAiLoading(false);
                          }
                        }}
                      >
                        {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Sugerir
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Items list */}
                {loadingItems ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                  </div>
                ) : !items || items.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Lista vazia. Adicione itens ou use a IA para sugestões.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${item.checked ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100 shadow-sm"}`}
                      >
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={async (checked) => {
                            if (!useRealApi) {
                              toggleItem.mutate({ itemId: item.id, checked: !!checked });
                              return;
                            }
                            try {
                              await toggleShoppingItemReal({ itemId: item.id, checked: !!checked });
                              if (selectedListId) await refreshItemsReal(selectedListId);
                            } catch {
                              toast.error("Erro ao atualizar item");
                            }
                          }}
                          className="shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${item.checked ? "line-through text-muted-foreground" : "text-gray-800"}`}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} {item.unit}
                            {item.estimatedPrice && ` · R$ ${item.estimatedPrice}`}
                          </p>
                        </div>
                        {item.category && (
                          <Badge className={`text-xs shrink-0 ${CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                            {item.category}
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={async () => {
                            if (!useRealApi) {
                              removeItem.mutate({ itemId: item.id });
                              return;
                            }
                            try {
                              await removeShoppingItemReal({ itemId: item.id });
                              if (selectedListId) await refreshItemsReal(selectedListId);
                            } catch {
                              toast.error("Erro ao remover item");
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Dialog */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              Agendar Entrega
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Data e horário de entrega</Label>
              <Input
                type="datetime-local"
                value={deliveryAt}
                onChange={(e) => setDeliveryAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Endereço de entrega</Label>
              <Input
                placeholder="Rua, número, bairro, cidade"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-1.5"
              />
            </div>
            {totalEstimate > 0 && (
              <div className="bg-orange-50 rounded-lg p-3 text-sm">
                <p className="text-gray-700">Estimativa total: <span className="font-bold text-orange-700">R$ {totalEstimate.toFixed(2)}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">{items?.length ?? 0} itens na lista</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancelar</Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600 text-white border-0 btn-scale"
              disabled={!deliveryAt || !deliveryAddress || schedule.isPending || schedulingReal}
              onClick={async () => {
                if (!useRealApi) {
                  schedule.mutate({ listId: selectedListId!, deliveryAt, deliveryAddress });
                  return;
                }
                setSchedulingReal(true);
                try {
                  await scheduleShoppingDeliveryReal({ listId: selectedListId!, deliveryAt, deliveryAddress });
                  await refreshListsReal();
                  setScheduleOpen(false);
                  toast.success("Entrega agendada com sucesso!");
                } catch {
                  toast.error("Erro ao agendar entrega");
                } finally {
                  setSchedulingReal(false);
                }
              }}
            >
              {(schedule.isPending || schedulingReal) ? "Agendando..." : "Confirmar Entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
