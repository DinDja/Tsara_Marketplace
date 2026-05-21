"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Star, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { MoonIcon } from "@/components/moon-icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { seedProducts, seedConsultations } from "@/lib/services/seed";

export default function AdminSeedPage() {
  const [seedingProducts, setSeedingProducts] = useState(false);
  const [seedingConsultations, setSeedingConsultations] = useState(false);
  const [done, setDone] = useState<"products" | "consultations" | null>(null);

  const handleSeedProducts = async () => {
    setSeedingProducts(true);
    try {
      await seedProducts();
      setDone("products");
      toast.success("Produtos criados com sucesso!");
    } catch {
      toast.error("Erro ao semear produtos");
    } finally {
      setSeedingProducts(false);
    }
  };

  const handleSeedConsultations = async () => {
    setSeedingConsultations(true);
    try {
      await seedConsultations();
      setDone("consultations");
      toast.success("Tipos de consulta criados com sucesso!");
    } catch {
      toast.error("Erro ao semear consultas");
    } finally {
      setSeedingConsultations(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sementes de Dados</h1>
        <p className="text-sm font-sans text-muted-foreground">
          Popule o banco de dados com dados iniciais para testes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-primary" /> Produtos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-sans text-muted-foreground">
                Cria 8 produtos iniciais com categorias variadas (Cristais, Velas, Oráculos, Incensos, etc.)
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={handleSeedProducts} disabled={seedingProducts} className="font-sans gap-2">
                  {seedingProducts ? <Loader2 className="w-4 h-4 animate-spin" /> : <Package className="w-4 h-4" />}
                  {seedingProducts ? "Semeando..." : "Semear Produtos"}
                </Button>
                {done === "products" && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="w-5 h-5 text-primary" /> Consultas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-sans text-muted-foreground">
                Cria 3 tipos de consulta iniciais (Tarot Terapêutico, Baralho Cigano, Sessão Completa)
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={handleSeedConsultations} disabled={seedingConsultations} className="font-sans gap-2">
                  {seedingConsultations ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  {seedingConsultations ? "Semeando..." : "Semear Consultas"}
                </Button>
                {done === "consultations" && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="bg-card border-border border-yellow-500/30">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm font-sans text-muted-foreground">
                <strong className="text-foreground">Atenção:</strong> A semente cria novos documentos no Firestore sem verificar duplicatas.
                Use apenas uma vez ou em ambiente de testes para evitar dados repetidos.
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
