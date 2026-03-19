"use client";

import { useCallback, useEffect, useState } from "react";
import { StatsCard } from "@/components/StatsCard";
import { ContactTable } from "@/components/ContactTable";
import { Toast, useToast } from "@/components/Toast";
import type { Contact } from "@/lib/hubspot";

interface Stats {
  totalCustomers: number;
  pendingOnboarding: number;
  completedOnboarding: number;
  newThisWeek: number;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nextAfter, setNextAfter] = useState<string | undefined>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toasts, addToast, removeToast } = useToast();

  const fetchData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [contactsRes, statsRes] = await Promise.all([
        fetch("/api/contacts?limit=50"),
        fetch("/api/stats"),
      ]);

      if (!contactsRes.ok || !statsRes.ok) throw new Error("Erro ao buscar dados");

      const contactsData = await contactsRes.json();
      const statsData = await statsRes.json();

      setContacts(contactsData.contacts);
      setNextAfter(contactsData.nextAfter);
      setStats(statsData);
      setLastRefresh(new Date());
    } catch {
      addToast("Erro ao carregar dados do CRM", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(false), 120_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function loadMore() {
    if (!nextAfter || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/contacts?limit=50&after=${nextAfter}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContacts((prev) => [...prev, ...data.contacts]);
      setNextAfter(data.nextAfter);
    } catch {
      addToast("Erro ao carregar mais contatos", "error");
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleMarkComplete(id: string, name: string) {
    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setStats((prev) =>
        prev
          ? {
              ...prev,
              pendingOnboarding: prev.pendingOnboarding - 1,
              completedOnboarding: prev.completedOnboarding + 1,
            }
          : prev
      );
      addToast(`Onboarding de ${name} marcado como concluído!`, "success");
    } catch {
      addToast(`Erro ao atualizar ${name}`, "error");
    }
  }

  const completionRate =
    stats && stats.totalCustomers > 0
      ? Math.round((stats.completedOnboarding / stats.totalCustomers) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Onboarding Tracker</h1>
                <p className="text-xs text-gray-400">Mentorados pendentes de onboarding</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 hidden sm:block">
                Atualizado às {lastRefresh.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <button
                onClick={() => fetchData(false)}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 transition-colors"
              >
                <svg
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Clientes"
            value={stats?.totalCustomers ?? "—"}
            subtitle="mentorados cadastrados"
            color="blue"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Onboarding Pendente"
            value={stats?.pendingOnboarding ?? "—"}
            subtitle="aguardando conclusão"
            color="yellow"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Onboarding Concluído"
            value={stats?.completedOnboarding ?? "—"}
            subtitle={`${completionRate}% de conclusão`}
            color="green"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatsCard
            title="Novos esta Semana"
            value={stats?.newThisWeek ?? "—"}
            subtitle="últimos 7 dias"
            color="purple"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        </div>

        {stats && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold text-gray-800">Progresso do Onboarding</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {stats.completedOnboarding} de {stats.totalCustomers} mentorados concluíram o onboarding
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-800 text-lg">Mentorados Pendentes</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Clientes que ainda não concluíram o onboarding
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm font-medium text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-full">
                {contacts.length} pendentes
              </span>
            </div>
          </div>
          <ContactTable
            contacts={contacts}
            onMarkComplete={handleMarkComplete}
            loading={loading}
          />

          {nextAfter && !loading && (
            <div className="mt-6 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loadingMore ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Carregar mais"
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
