"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/services/api";
import { ITicket, IUser, TicketStatus } from "@/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

import { useRouter } from "next/navigation";

export default function AgentDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [agents, setAgents] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");

  const { user } = useAuth();

  const fetchTickets = async () => {
    try {
      const response = await api.get<ITicket[]>("/tickets");
      const agentTickets = response.data.filter(t => 
        t.assignedAgentName === user?.name || 
        !t.assignedAgentName || 
        t.assignedAgentName === "Unassigned"
      );
      setTickets(agentTickets);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await api.get<{ id: number; name: string }[]>("/tickets/agents");
      setAgents(res.data.map(a => ({ ...a, email: "", role: "AGENT" as const })));
    } catch {
      // Silently fail — reassign dropdown just won't show
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
      fetchAgents();
    }
  }, [user]);

  const handleStatusUpdate = async (e: React.MouseEvent, ticketId: number, status: TicketStatus) => {
    e.stopPropagation(); // prevent row click routing
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
      await fetchTickets();
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Status update failed");
    }
  };

  const handleTakeOwnership = async (e: React.MouseEvent, ticketId: number) => {
    e.stopPropagation();
    try {
      await api.put(`/tickets/${ticketId}/assign`);
      await fetchTickets();
    } catch (err) {
      console.error("Failed to take ownership", err);
      alert("Take ownership failed");
    }
  };

  const handleReassign = async (e: React.ChangeEvent<HTMLSelectElement>, ticketId: number) => {
    const agentId = e.target.value;
    if (!agentId) return;
    try {
      await api.put(`/tickets/${ticketId}/reassign`, { agentId: Number(agentId) });
      await fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Reassign failed");
    }
    e.target.value = "";
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchSearch = ticket.subject.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [tickets, search, statusFilter]);

  const assignedCount = tickets.length;
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  // Calculate resolved tickets today. Note: "Resolved Today" is a complex query based on timestamps that may not be completely reliable without audit logs, so we'll just track total resolved in this array for now or approximate it. Let's strictly map "Resolved".
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Agent Work Queue</h1>
          <p className="text-sm text-[#6b7280] mt-1 font-medium">Manage and resolve assigned tickets efficiently.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-md border-indigo-100">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Assigned Pipeline</div>
               <div className="text-4xl font-extrabold text-[#111827]">{assignedCount}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#4f46e5]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
          </div>
        </Card>
        <Card className="shadow-md border-red-50">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Awaiting Action</div>
               <div className="text-4xl font-extrabold text-red-600">{openCount}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">In Progress</div>
               <div className="text-4xl font-extrabold text-[#111827]">{inProgressCount}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2">Resolved</div>
               <div className="text-4xl font-extrabold text-emerald-600">{resolvedCount}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          {/* Main Agent Table Filter */}
          <div className="bg-white p-5 border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col md:flex-row gap-5 items-end">
            <div className="flex-1 w-full relative group">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-9 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <Input 
                label="Queue Search" 
                placeholder="Search ticket subject..." 
                value={search}
                className="pl-10"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full md:w-48 text-sm">
                <label className="text-sm font-semibold text-[#111827]">Phase Filter</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "ALL")}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white transition-all shadow-sm cursor-pointer"
                >
                  <option value="ALL">All phases</option>
                  <option value="OPEN">Open (Awaiting)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] w-full overflow-hidden">
            <div className="overflow-x-auto pb-4">
              {loading ? (
                <div className="p-20 text-center text-[#6b7280] font-medium animate-pulse flex flex-col items-center">
                  <svg className="w-8 h-8 animate-spin text-[#4f46e5] mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Synchronizing Assigned Queue...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-24 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-[#eef2ff] rounded-full flex items-center justify-center mb-6 shadow-inner">
                     <svg className="w-10 h-10 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   </div>
                   <h3 className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight">Queue Clear</h3>
                   <p className="text-[#6b7280] text-[15px] mb-8 max-w-sm font-medium">
                     There are no active tickets sitting in your assignment pipeline matching these tags.
                   </p>
                </div>
              ) : (
                <Table headers={["ID", "Subject", "Priority", "Status", "Owner", "Actions"]} className="border-0 rounded-none w-full min-w-[900px]">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#eef2ff]/30 transition-colors duration-150 border-t border-[#e5e7eb] group cursor-pointer" onClick={() => router.push(`/tickets/${ticket.id}`)}>
                      <td className="px-5 py-4 text-xs text-[#6b7280] font-bold">#{ticket.id}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#111827]">{ticket.subject.length > 35 ? ticket.subject.substring(0,35) + "..." : ticket.subject}</td>
                      <td className="px-5 py-4"><Badge variant={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "orange" : ticket.priority === "MEDIUM" ? "blue" : "gray"}>{ticket.priority}</Badge></td>
                      <td className="px-5 py-4"><Badge variant={ticket.status === "CLOSED" ? "dark-gray" : ticket.status === "RESOLVED" ? "green" : ticket.status === "IN_PROGRESS" ? "amber" : "gray"}>{ticket.status}</Badge></td>
                      <td className="px-5 py-4 text-sm text-[#4b5563] font-semibold">{ticket.userName}</td>
                      <td className="px-5 py-4 flex items-center gap-2 flex-wrap">
                         {(!ticket.assignedAgentName || ticket.assignedAgentName === "Unassigned") ? (
                           <Button size="sm" onClick={(e) => handleTakeOwnership(e, ticket.id)} className="text-[11px] px-3 py-1.5 whitespace-nowrap bg-indigo-600 hover:bg-indigo-700">
                             Take Ownership
                           </Button>
                         ) : (
                           <>
                             {ticket.status === "OPEN" && (
                               <Button size="sm" onClick={(e) => handleStatusUpdate(e, ticket.id, "IN_PROGRESS")} className="text-[11px] px-3 py-1.5 whitespace-nowrap bg-[#4f46e5]">
                                 Start Progress
                               </Button>
                             )}
                             {ticket.status === "IN_PROGRESS" && (
                               <Button size="sm" onClick={(e) => handleStatusUpdate(e, ticket.id, "RESOLVED")} className="text-[11px] px-3 py-1.5 whitespace-nowrap bg-emerald-600 hover:bg-emerald-700">
                                 Resolve
                               </Button>
                             )}
                             {/* Reassign dropdown — only visible for tickets assigned to current agent */}
                             {ticket.assignedAgentName === user?.name && agents.length > 0 && (
                               <select
                                 className="text-[11px] border border-[#e5e7eb] rounded px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 cursor-pointer"
                                 defaultValue=""
                                 onClick={e => e.stopPropagation()}
                                 onChange={e => handleReassign(e, ticket.id)}
                               >
                                 <option value="" disabled>Reassign to...</option>
                                 {agents.filter(a => a.name !== ticket.assignedAgentName).map(a => (
                                   <option key={a.id} value={a.id}>{a.name}</option>
                                 ))}
                               </select>
                             )}
                           </>
                         )}
                         <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); router.push(`/tickets/${ticket.id}`); }} className="text-[11px] px-3 py-1.5 whitespace-nowrap border-gray-300">
                           Reply
                         </Button>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card title="Agent Utilities" className="shadow-md">
            <div className="flex flex-col gap-3">
              <Link href="/tickets/my" className="w-full">
                <Button className="w-full justify-start items-center gap-3 bg-[#4f46e5] hover:bg-[#6366f1] py-3 text-sm shadow-md">
                  <div className="bg-white/20 p-1.5 rounded-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  View My Tickets
                </Button>
              </Link>
              <Button variant="secondary" onClick={fetchTickets} className="w-full justify-start items-center gap-3 py-3 text-sm shadow-sm bg-gray-50 hover:bg-white border-[#e5e7eb]">
                <div className="bg-gray-200 p-1.5 rounded-md">
                   <svg className="w-4 h-4 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </div>
                Refresh Queue
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
