"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import api from "@/services/api";
import { ITicket, TicketStatus, TicketPriority } from "@/types";
import Table from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";

export default function MyTicketsPage() {
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
        let fetched = response.data;
        if (user?.role === "USER") fetched = fetched.filter(t => t.userName === user.name);
        if (user?.role === "AGENT") fetched = fetched.filter(t => t.assignedAgentName === user.name);
        setTickets(fetched);
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">{user?.role === "USER" ? "My Requests" : "My Assigned Queue"}</h1>
          <p className="text-sm text-[#6b7280] mt-1 font-medium">Tickets explicitly linked to your account.</p>
        </div>
      </div>

      {/* Constraints & Filters block */}
      <div className="bg-white p-5 border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full relative group">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-9 group-focus-within:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <Input 
            label="Search Tickets" 
            placeholder="Search by subject..." 
            value={search}
            className="pl-10"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 w-full md:w-56 text-sm">
            <label className="text-sm font-semibold text-[#111827]">Status Filter</label>
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
        <div className="flex flex-col gap-1.5 w-full md:w-56 text-sm">
            <label className="text-sm font-semibold text-[#111827]">Priority Filter</label>
            <select 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "ALL")}
              className="w-full px-3 py-2.5 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white transition-all shadow-sm"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-[#6b7280] font-medium animate-pulse flex flex-col items-center">
            <svg className="w-8 h-8 animate-spin text-[#4f46e5] mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Loading ticket data...
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5">
               <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
             </div>
             <h3 className="text-xl font-bold text-[#111827] mb-2 tracking-tight">No tickets in queue</h3>
             <p className="text-[#6b7280] text-sm mb-8 max-w-sm">
               {tickets.length === 0 ? "You don't have any assigned tickets right now." : "No tickets match your active filter combinations."}
             </p>
             {user?.role === "USER" && tickets.length === 0 && (
               <Link href="/tickets/create">
                 <Button className="px-6 py-2.5">Create a request</Button>
               </Link>
             )}
          </div>
        ) : (
          <Table headers={["ID", "Subject", "Status", "Priority", "Created", "Action"]} className="border-0 rounded-none">
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="hover:bg-[#f9fafb] transition-colors duration-150 border-t border-[#e5e7eb] cursor-pointer group" onClick={() => window.location.href = `/tickets/${ticket.id}`}>
                <td className="px-6 py-5 text-sm text-[#6b7280] font-medium">#{ticket.id}</td>
                <td className="px-6 py-5 text-sm font-semibold text-[#111827]">{ticket.subject}</td>
                <td className="px-6 py-5"><Badge variant={ticket.status === "CLOSED" ? "dark-gray" : ticket.status === "RESOLVED" ? "green" : ticket.status === "IN_PROGRESS" ? "amber" : "gray"}>{ticket.status}</Badge></td>
                <td className="px-6 py-5"><Badge variant={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "orange" : ticket.priority === "MEDIUM" ? "blue" : "gray"}>{ticket.priority}</Badge></td>
                <td className="px-6 py-5 text-sm text-[#6b7280]">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-5">
                  <span className="text-[#4f46e5] group-hover:underline text-sm font-semibold flex items-center gap-1">
                    Open
                    <svg className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </div>
    </div>
  );
}
