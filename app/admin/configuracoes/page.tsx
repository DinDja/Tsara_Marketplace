"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Save,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminConfiguracoes() {
  const [notifications, setNotifications] = useState({
    newAppointment: true,
    appointmentReminder: true,
    newOrder: true,
    lowStock: true,
    marketing: false,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm font-sans text-muted-foreground">
          Gerencie as configurações do seu negócio
        </p>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="perfil" className="font-sans">
            Perfil
          </TabsTrigger>
          <TabsTrigger value="negocio" className="font-sans">
            Negócio
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="font-sans">
            Notificações
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="font-sans">
            Pagamentos
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="perfil">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
                    T
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="font-sans">
                      Alterar foto
                    </Button>
                    <p className="text-xs font-sans text-muted-foreground mt-2">
                      JPG, PNG ou GIF. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-sans">
                      Nome completo
                    </Label>
                    <Input
                      id="name"
                      defaultValue="Admin Tsara"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-sans">
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="admin@tsara.com"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-sans">
                      Telefone
                    </Label>
                    <Input
                      id="phone"
                      defaultValue="(11) 99999-0000"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-sans">
                      Cargo
                    </Label>
                    <Input
                      id="role"
                      defaultValue="Administrador"
                      className="font-sans bg-input/50"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Segurança
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="font-sans">
                        Senha atual
                      </Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="font-sans bg-input/50"
                      />
                    </div>
                    <div />
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="font-sans">
                        Nova senha
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="font-sans bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="font-sans">
                        Confirmar nova senha
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="font-sans bg-input/50"
                      />
                    </div>
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
                  <Save className="w-4 h-4" />
                  Salvar alterações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="negocio">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Informações do Negócio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="font-sans">
                      Nome do negócio
                    </Label>
                    <Input
                      id="business-name"
                      defaultValue="Tsara"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-email" className="font-sans">
                      E-mail de contato
                    </Label>
                    <Input
                      id="business-email"
                      type="email"
                      defaultValue="contato@tsara.com"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-phone" className="font-sans">
                      WhatsApp
                    </Label>
                    <Input
                      id="business-phone"
                      defaultValue="(11) 99999-0000"
                      className="font-sans bg-input/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-cnpj" className="font-sans">
                      CNPJ
                    </Label>
                    <Input
                      id="business-cnpj"
                      defaultValue="00.000.000/0001-00"
                      className="font-sans bg-input/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-address" className="font-sans">
                    Endereço
                  </Label>
                  <Input
                    id="business-address"
                    defaultValue="Rua das Estrelas, 123 - São Paulo, SP"
                    className="font-sans bg-input/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-description" className="font-sans">
                    Descrição
                  </Label>
                  <Textarea
                    id="business-description"
                    defaultValue="Tsara é um espaço dedicado ao autoconhecimento e espiritualidade, oferecendo consultas de Tarot e Baralho Cigano, além de artigos esotéricos selecionados."
                    className="font-sans bg-input/50 min-h-24"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Horário de Funcionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { day: "Segunda", open: "09:00", close: "18:00", active: true },
                  { day: "Terça", open: "09:00", close: "18:00", active: true },
                  { day: "Quarta", open: "09:00", close: "18:00", active: true },
                  { day: "Quinta", open: "09:00", close: "18:00", active: true },
                  { day: "Sexta", open: "09:00", close: "18:00", active: true },
                  { day: "Sábado", open: "09:00", close: "14:00", active: true },
                  { day: "Domingo", open: "", close: "", active: false },
                ].map((schedule) => (
                  <div
                    key={schedule.day}
                    className="flex items-center gap-4 py-2"
                  >
                    <div className="w-24">
                      <span className="text-sm font-sans text-foreground">
                        {schedule.day}
                      </span>
                    </div>
                    <Switch defaultChecked={schedule.active} />
                    {schedule.active ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          defaultValue={schedule.open}
                          className="w-32 font-sans bg-input/50"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          defaultValue={schedule.close}
                          className="w-32 font-sans bg-input/50"
                        />
                      </div>
                    ) : (
                      <span className="text-sm font-sans text-muted-foreground">
                        Fechado
                      </span>
                    )}
                  </div>
                ))}
                <Button className="bg-primary hover:bg-primary/90 font-sans gap-2 mt-4">
                  <Save className="w-4 h-4" />
                  Salvar horários
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notificacoes">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: "newAppointment",
                    title: "Novos agendamentos",
                    description:
                      "Receba uma notificação quando um cliente agendar uma consulta",
                  },
                  {
                    key: "appointmentReminder",
                    title: "Lembretes de consultas",
                    description:
                      "Receba lembretes 1 hora antes de cada consulta",
                  },
                  {
                    key: "newOrder",
                    title: "Novos pedidos",
                    description:
                      "Receba uma notificação quando um cliente fizer um pedido",
                  },
                  {
                    key: "lowStock",
                    title: "Estoque baixo",
                    description:
                      "Receba alertas quando produtos estiverem com estoque baixo",
                  },
                  {
                    key: "marketing",
                    title: "E-mails de marketing",
                    description:
                      "Receba novidades e dicas para melhorar seu negócio",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="text-sm font-sans text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      checked={
                        notifications[item.key as keyof typeof notifications]
                      }
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="pagamentos">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Métodos de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { name: "PIX", enabled: true, icon: "💠" },
                    { name: "Cartão de Crédito", enabled: true, icon: "💳" },
                    { name: "Cartão de Débito", enabled: true, icon: "💳" },
                    { name: "Boleto", enabled: false, icon: "📄" },
                  ].map((method) => (
                    <div
                      key={method.name}
                      className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-sans font-medium text-foreground">
                          {method.name}
                        </span>
                      </div>
                      <Switch defaultChecked={method.enabled} />
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-4">
                    Chave PIX
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pix-key" className="font-sans">
                        Tipo de chave
                      </Label>
                      <Input
                        id="pix-key"
                        defaultValue="CNPJ"
                        className="font-sans bg-input/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix-value" className="font-sans">
                        Chave
                      </Label>
                      <Input
                        id="pix-value"
                        defaultValue="00.000.000/0001-00"
                        className="font-sans bg-input/50"
                      />
                    </div>
                  </div>
                </div>

                <Button className="bg-primary hover:bg-primary/90 font-sans gap-2">
                  <Save className="w-4 h-4" />
                  Salvar configurações
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
