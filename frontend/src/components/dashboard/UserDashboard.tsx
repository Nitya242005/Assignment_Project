"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/services/api";
import { ITicket, TicketStatus, TicketPriority } from "@/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "ALL">("ALL");

  const { user } = useAuth();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get<ITicket[]>("/tickets");
        const userTickets = response.data.filter(t => t.userName === user?.name);
        setTickets(userTickets);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchTickets();
  }, [user]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      const matchSearch = ticket.subject.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [tickets, search, statusFilter, priorityFilter]);

  const total = tickets.length;
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const inProgressCount = tickets.filter(t => t.status === "IN_PROGRESS").length;
  const resolvedCount = tickets.filter(t => t.status === "RESOLVED").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Personal Dashboard</h1>
          <p className="text-sm text-[#6b7280] mt-1 font-medium">Track and monitor your personal support requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-indigo-50 to-white shadow-md border-indigo-100">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Total Tickets</div>
               <div className="text-4xl font-extrabold text-[#111827]">{total}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-[#4f46e5]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
             </div>
          </div>
        </Card>
        <Card className="shadow-md">
          <div className="flex justify-between items-start">
             <div>
               <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Awaiting action</div>
               <div className="text-4xl font-extrabold text-[#111827]">{openCount}</div>
             </div>
             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#6b7280]">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5h0M12 14.5v-1.5" /></svg>
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
          <div className="bg-white p-5 border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col md:flex-row gap-5 items-end">
            <div className="flex-1 w-full relative group">
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-9 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <Input 
                label="Search Requests" 
                placeholder="Search ticket subject..." 
                value={search}
                className="pl-10"
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full md:w-48 text-sm">
                <label className="text-sm font-semibold text-[#111827]">Status Range</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "ALL")}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white transition-all shadow-sm"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] w-full overflow-hidden">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="p-20 text-center text-[#6b7280] font-medium animate-pulse flex flex-col items-center">
                  <svg className="w-8 h-8 animate-spin text-[#4f46e5] mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Mapping ticket matrix...
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-24 flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 bg-[#eef2ff] rounded-full flex items-center justify-center mb-6 shadow-inner">
                     <svg className="w-10 h-10 text-[#4f46e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                   </div>
                   <h3 className="text-2xl font-extrabold text-[#111827] mb-2 tracking-tight">No tickets found</h3>
                   <p className="text-[#6b7280] text-[15px] mb-8 max-w-sm font-medium">
                     {tickets.length === 0 ? "You have not submitted any tracking requests." : "No records match your active query filters."}
                   </p>
                   {tickets.length === 0 && (
                     <Link href="/tickets/create">
                       <Button className="px-8 py-3 bg-[#4f46e5] hover:bg-[#6366f1] shadow-lg hover:shadow-xl transition-all">Submit an issue</Button>
                     </Link>
                   )}
                </div>
              ) : (
                <Table headers={["Ref", "Subject", "Status", "Priority", "Delegate"]} className="border-0 rounded-none w-full min-w-[600px]">
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[#eef2ff]/50 transition-colors duration-150 border-t border-[#e5e7eb] cursor-pointer group" onClick={() => router.push(`/tickets/${ticket.id}`)}>
                      <td className="px-5 py-4 text-xs text-[#6b7280] font-bold">#{ticket.id}</td>
                      <td className="px-5 py-4 text-sm font-bold text-[#111827]">{ticket.subject.length > 40 ? ticket.subject.substring(0,40) + "..." : ticket.subject}</td>
                      <td className="px-5 py-4"><Badge variant={ticket.status === "CLOSED" ? "dark-gray" : ticket.status === "RESOLVED" ? "green" : ticket.status === "IN_PROGRESS" ? "amber" : "gray"}>{ticket.status}</Badge></td>
                      <td className="px-5 py-4"><Badge variant={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "orange" : ticket.priority === "MEDIUM" ? "blue" : "gray"}>{ticket.priority}</Badge></td>
                      <td className="px-5 py-4 text-sm text-[#4b5563] font-medium">{ticket.assignedAgentName || <span className="text-gray-400 italic">Unassigned</span>}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 space-y-6">
          <Card title="Quick Actions" className="shadow-md">
            <div className="flex flex-col gap-3">
              <Link href="/tickets/create" className="w-full">
                <Button className="w-full justify-start items-center gap-3 bg-[#4f46e5] hover:bg-[#6366f1] py-3 text-sm shadow-md">
                  <div className="bg-white/20 p-1.5 rounded-md">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  Launch New Ticket
                </Button>
              </Link>
              <Link href="/tickets/my" className="w-full">
                <Button variant="secondary" className="w-full justify-start items-center gap-3 py-3 text-sm shadow-sm bg-gray-50 hover:bg-white border-[#e5e7eb]">
                  <div className="bg-gray-200 p-1.5 rounded-md">
                     <svg className="w-4 h-4 text-[#4b5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                  View My Tickets
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
