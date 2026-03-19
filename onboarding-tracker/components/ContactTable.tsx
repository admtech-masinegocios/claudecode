"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Contact } from "@/lib/hubspot";

interface ContactTableProps {
  contacts: Contact[];
  onMarkComplete: (id: string, name: string) => void;
  loading?: boolean;
}

export function ContactTable({ contacts, onMarkComplete, loading }: ContactTableProps) {
  const [search, setSearch] = useState("");
  const [completing, setCompleting] = useState<string | null>(null);

  const filtered = contacts.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.displayName.toLowerCase().includes(term) ||
      (c.properties.email || "").toLowerCase().includes(term) ||
      (c.properties.phone || "").includes(term)
    );
  });

  async function handleComplete(id: string, name: string) {
    setCompleting(id);
    await onMarkComplete(id, name);
    setCompleting(null);
  }

  function getTimeAgo(dateStr?: string) {
    if (!dateStr) return "—";
    try {
      return formatDistanceToNow(new Date(dateStr), { locale: ptBR, addSuffix: true });
    } catch {
      return "—";
    }
  }

  function getDateFormatted(dateStr?: string) {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch {
      return "—";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Carregando mentorados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {filtered.length} de {contacts.length} mentorados
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="font-medium">Nenhum mentorado encontrado</p>
          <p className="text-xs mt-1">Tente ajustar a busca</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mentorado</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Contato</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Entrou no CRM</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Onboarding</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((contact) => (
                <tr
                  key={contact.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {contact.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <a
                          href={contact.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {contact.displayName}
                        </a>
                        <p className="text-xs text-gray-400 sm:hidden">{contact.properties.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="space-y-0.5">
                      <p className="text-gray-700">{contact.properties.email || "—"}</p>
                      <p className="text-gray-400 text-xs">{contact.properties.phone || "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="space-y-0.5">
                      <p className="text-gray-700">{getDateFormatted(contact.properties.createdate)}</p>
                      <p className="text-gray-400 text-xs">{getTimeAgo(contact.properties.createdate)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      Pendente
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleComplete(contact.id, contact.displayName)}
                      disabled={completing === contact.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {completing === contact.id ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                          Concluir
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
