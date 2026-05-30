import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { createChefReal } from "@/lib/trpc-real";

export default function RegisterChef() {
  const useRealApi = import.meta.env.VITE_USE_REAL_API !== "false";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [cuisines, setCuisines] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [price, setPrice] = useState("100");
  const [bio, setBio] = useState("");
  const [experience, setExperience] = useState("0");
  const [loadingReal, setLoadingReal] = useState(false);

  const createChef = trpc.providers.createChef.useMutation({
    onSuccess: () => {
      toast.success("Cadastro de chef enviado com sucesso!");
    },
    onError: () => toast.error("Erro ao cadastrar chef"),
  });

  const submit = async () => {
    if (!name || !email || !city) {
      toast.error("Preencha nome, e-mail e cidade");
      return;
    }
    const payload = {
      name,
      email,
      phone,
      city,
      specialties: specialties.split(",").map((v) => v.trim()).filter(Boolean),
      cuisineTypes: cuisines.split(",").map((v) => v.trim()).filter(Boolean),
      pricePerPerson: Number(price) || 100,
      bio,
      experience: Number(experience) || 0,
      providerType: "CHEF" as const,
    };
    if (!useRealApi) {
      createChef.mutate(payload);
      return;
    }
    setLoadingReal(true);
    try {
      await createChefReal(payload);
      toast.success("Cadastro de chef enviado com sucesso!");
    } catch {
      toast.error("Erro ao cadastrar chef");
    } finally {
      setLoadingReal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container py-10 max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Cadastro de Chef</CardTitle>
            <CardDescription>Fluxo inicial de prestador CHEF</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" /></div>
            <div><Label>E-mail</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Telefone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Cidade/Bairro</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Preço base (R$ por pessoa)</Label><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1.5" /></div>
            <div><Label>Experiência (anos)</Label><Input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Especialidades (separadas por vírgula)</Label><Input value={specialties} onChange={(e) => setSpecialties(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Culinárias (separadas por vírgula)</Label><Input value={cuisines} onChange={(e) => setCuisines(e.target.value)} className="mt-1.5" /></div>
            <div className="md:col-span-2"><Label>Descrição profissional</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="mt-1.5" rows={4} /></div>
            <div className="md:col-span-2">
              <Button className="w-full gradient-brand text-white border-0" disabled={createChef.isPending || loadingReal} onClick={() => void submit()}>
                {(createChef.isPending || loadingReal) ? "Enviando..." : "Cadastrar como Chef"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
