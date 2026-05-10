"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: "active" | "inactive" | "low_stock";
  featured: boolean;
}

const products: Product[] = [
  {
    id: 1,
    name: "Cristal Ametista Bruta",
    category: "Cristais",
    price: 89.9,
    stock: 23,
    sold: 45,
    status: "active",
    featured: true,
  },
  {
    id: 2,
    name: "Kit 7 Velas Energizadas",
    category: "Velas",
    price: 54.9,
    stock: 8,
    sold: 38,
    status: "low_stock",
    featured: false,
  },
  {
    id: 3,
    name: "Baralho Cigano Tradicional",
    category: "Oráculos",
    price: 129.9,
    stock: 15,
    sold: 32,
    status: "active",
    featured: true,
  },
  {
    id: 4,
    name: "Incenso 7 Ervas (cx 50)",
    category: "Incensos",
    price: 27.0,
    stock: 45,
    sold: 28,
    status: "active",
    featured: false,
  },
  {
    id: 5,
    name: "Tarot de Marselha Premium",
    category: "Oráculos",
    price: 189.9,
    stock: 12,
    sold: 22,
    status: "active",
    featured: true,
  },
  {
    id: 6,
    name: "Quartzo Rosa Polido",
    category: "Cristais",
    price: 65.0,
    stock: 3,
    sold: 19,
    status: "low_stock",
    featured: false,
  },
  {
    id: 7,
    name: "Pêndulo de Cristal",
    category: "Acessórios",
    price: 45.0,
    stock: 0,
    sold: 15,
    status: "inactive",
    featured: false,
  },
  {
    id: 8,
    name: "Sal Grosso Consagrado 1kg",
    category: "Rituais",
    price: 18.9,
    stock: 50,
    sold: 67,
    status: "active",
    featured: false,
  },
];

const categories = [
  "Todos",
  "Cristais",
  "Velas",
  "Oráculos",
  "Incensos",
  "Acessórios",
  "Rituais",
];

export default function AdminProdutos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "active").length;
  const lowStockProducts = products.filter(
    (p) => p.status === "low_stock"
  ).length;
  const outOfStock = products.filter((p) => p.stock === 0).length;

  const getStatusBadge = (status: string, stock: number) => {
    if (stock === 0) {
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-500 border-red-500/20 text-xs font-sans"
        >
          Sem estoque
        </Badge>
      );
    }
    switch (status) {
      case "active":
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20 text-xs font-sans"
          >
            Ativo
          </Badge>
        );
      case "low_stock":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs font-sans"
          >
            Estoque baixo
          </Badge>
        );
      case "inactive":
        return (
          <Badge
            variant="outline"
            className="bg-secondary text-muted-foreground text-xs font-sans"
          >
            Inativo
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="text-sm font-sans text-muted-foreground">
            Gerencie o catálogo de produtos
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total de Produtos",
            value: totalProducts,
            icon: Package,
            color: "text-primary",
          },
          {
            label: "Produtos Ativos",
            value: activeProducts,
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "Estoque Baixo",
            value: lowStockProducts,
            icon: AlertTriangle,
            color: "text-yellow-500",
          },
          {
            label: "Sem Estoque",
            value: outOfStock,
            icon: AlertTriangle,
            color: "text-red-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg bg-secondary flex items-center justify-center",
                    stat.color
                  )}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-xs font-sans text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 font-sans bg-input/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={cn(
                      "font-sans text-xs",
                      selectedCategory === category &&
                        "bg-primary hover:bg-primary/90"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Vendidos
                    </th>
                    <th className="text-center py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
                            {product.category === "Cristais"
                              ? "💎"
                              : product.category === "Velas"
                              ? "🕯️"
                              : product.category === "Oráculos"
                              ? "🃏"
                              : product.category === "Incensos"
                              ? "🌿"
                              : "✨"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {product.name}
                            </p>
                            {product.featured && (
                              <span className="text-xs font-sans text-primary">
                                Destaque
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-sans text-muted-foreground">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-sans font-medium text-foreground">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span
                          className={cn(
                            "text-sm font-sans font-medium",
                            product.stock === 0
                              ? "text-red-500"
                              : product.stock < 10
                              ? "text-yellow-500"
                              : "text-foreground"
                          )}
                        >
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-sans text-muted-foreground">
                          {product.sold} un.
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {getStatusBadge(product.status, product.stock)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Eye className="w-4 h-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2">
                              <Edit className="w-4 h-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-500">
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
