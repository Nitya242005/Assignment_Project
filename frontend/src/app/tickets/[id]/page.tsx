"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { ITicket, TicketStatus, IComment } from "@/types";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useAuth } from "@/hooks/useAuth";

const STATUS_FLOW: TicketStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function TicketDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<ITicket | null>(null);
  const [comments, setComments] = useState<IComment[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [statusToUpdate, setStatusToUpdate] = useState<TicketStatus>("OPEN");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Rating State
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // File Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicketAndComments();
  }, [id]);

  const fetchTicketAndComments = async () => {
    try {
      const ticketRes = await api.get<ITicket>(`/tickets/${id}`);
      setTicket(ticketRes.data);
      setStatusToUpdate(ticketRes.data.status);
      setComments(ticketRes.data.comments || []);
      if (ticketRes.data.rating) {
        setRating(ticketRes.data.rating);
        setRatingSubmitted(true);
      }
      setErrorMsg(null);
    } catch (error: any) {
      console.error("Failed to fetch ticket data", error);
      if (error.response?.status === 403) {
        setErrorMsg("Access Denied: You do not have permission to view this specific record payload.");
      } else if (error.response?.status === 404) {
        setErrorMsg("Record Not Found: This ticket does not exist within the system.");
      } else {
        setErrorMsg("System Fetch Failure: Unable to securely connect to the backend array.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!ticket) return;
    setIsUpdatingStatus(true);
    try {
      await api.put(`/tickets/${id}/status`, { status: statusToUpdate });
      await fetchTicketAndComments(); 
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status. Check permissions.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await api.post(`/tickets/${id}/comments`, { message: commentText });
      setCommentText("");
      await fetchTicketAndComments(); 
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleRating = async (selectedRating: number) => {
    try {
      setRating(selectedRating);
      await api.put(`/tickets/${id}/rate`, { rating: selectedRating });
      setRatingSubmitted(true);
    } catch (error) {
      console.error("Failed to submit rating", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowed = ['image/png', 'image/jpeg', 'application/pdf'];
      if (!allowed.includes(file.type)) {
        setUploadError('Only PNG, JPG, and PDF files are allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size must be under 5MB.');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile || !id) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      await api.post(`/tickets/${id}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadFile(null);
      await fetchTicketAndComments();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return <div className="text-[#6b7280] p-16 text-center text-sm font-medium animate-pulse">Synchronizing ticket data...</div>;
  }

  if (errorMsg || !ticket) {
    return (
      <div className="text-center py-20 flex flex-col items-center">
        <svg className="w-16 h-16 text-red-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <h2 className="text-2xl font-extrabold text-[#111827]">{errorMsg ? "Data Exception" : "Ticket Not Found"}</h2>
        <p className="text-sm text-[#6b7280] font-semibold mt-2">{errorMsg || "The specific ticket configuration could not be loaded."}</p>
        <Link href="/dashboard">
          <Button variant="ghost" className="mt-6 border border-gray-200">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const canUpdateStatus = user?.role === "ADMIN" || user?.role === "AGENT";
  const showRating = (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && user?.role === "USER";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e7eb] pb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="secondary" className="px-3">← Back</Button>
          </Link>
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">#{ticket.id}</h1>
             <Badge variant={ticket.status === "CLOSED" ? "dark-gray" : ticket.status === "RESOLVED" ? "green" : ticket.status === "IN_PROGRESS" ? "amber" : "gray"}>
               {ticket.status}
             </Badge>
          </div>
        </div>
        
        {/* Status Transition Core mapping */}
        {canUpdateStatus && ticket.status !== "CLOSED" && (
          <div className="flex items-center gap-2 bg-white p-2.5 border border-[#e5e7eb] rounded-lg shadow-sm">
            <span className="text-xs font-bold text-[#6b7280] ml-2 uppercase tracking-wider">State Pipeline:</span>
            <select 
              value={statusToUpdate}
              onChange={(e) => setStatusToUpdate(e.target.value as TicketStatus)}
              className="text-sm border border-[#e5e7eb] rounded-md px-3 py-1.5 focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] focus:outline-none bg-gray-50 hover:bg-white transition-colors font-semibold text-[#111827] cursor-pointer"
            >
              {STATUS_FLOW.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <Button 
              size="sm" 
              onClick={handleUpdateStatus} 
              disabled={isUpdatingStatus || statusToUpdate === ticket.status}
              className="text-sm px-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]"
            >
              Update
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-2">
        {/* Main Discussion Tree */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Ticket Synopsis block */}
          <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
             <div className="px-6 py-5 border-b border-[#e5e7eb] bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h2 className="text-xl font-bold text-[#111827]">{ticket.subject}</h2>
             </div>
             
             <div className="p-6 text-[#374151] text-[15px] leading-relaxed whitespace-pre-wrap">
               {ticket.description}
             </div>
             
             {/* Visual Progress Bar */}
             <div className="px-6 py-4 border-t border-[#e5e7eb] bg-[#f9fafb]">
                <div className="flex items-center justify-between">
                  {STATUS_FLOW.map((s, idx) => {
                    const isActive = ticket.status === s;
                    const isPast = STATUS_FLOW.indexOf(ticket.status) >= idx;
                    return (
                      <div key={s} className="flex flex-col items-center flex-1 relative group">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-300 font-bold text-xs ${isActive ? "bg-[#4f46e5] text-white ring-4 ring-[#4f46e5]/20 shadow-md" : isPast ? "bg-[#4338ca] text-white" : "bg-white border-2 border-[#e5e7eb] text-[#9ca3af]"}`}>
                          {isPast ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : idx + 1}
                        </div>
                        <span className={`text-[10px] mt-2 font-bold uppercase tracking-wider ${isActive ? "text-[#4f46e5]" : isPast ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>{s.replace("_", " ")}</span>
                        {/* Connecting Line */}
                        {idx < STATUS_FLOW.length - 1 && (
                          <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-0 ${STATUS_FLOW.indexOf(ticket.status) > idx ? "bg-[#4338ca]" : "bg-[#e5e7eb]"}`}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
             </div>
          </div>

          {/* Discussion Array */}
          <div className="space-y-6">
            <h3 className="text-lg font-extrabold text-[#111827] tracking-tight inline-flex items-center gap-2">
               Communication Log
               <span className="bg-[#f3f4f6] text-[#6b7280] text-xs px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>
            
            <div className="space-y-5">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 shadow-sm border border-indigo-200">
                     {comment.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white p-5 rounded-tr-xl rounded-b-xl rounded-tl-sm shadow-sm border border-[#e5e7eb] hover:shadow-md transition-shadow duration-300 flex-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-extrabold text-sm text-[#111827] tracking-tight">{comment.userName}</span>
                      <span className="text-xs font-semibold text-[#9ca3af]">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#4b5563] whitespace-pre-wrap leading-relaxed">{comment.message}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center p-12 text-[#6b7280] text-sm border-2 border-dashed border-[#e5e7eb] rounded-xl bg-[#f9fafb]">
                  {ticket.status === "CLOSED" ? "This ticket was closed with zero external communication." : "There are no replies. Leave an internal or external response below."}
                </div>
              )}
            </div>

            {/* Response Module */}
            {ticket.status !== "CLOSED" ? (
              <form onSubmit={handleAddComment} className="mt-8 bg-white p-6 border border-[#e5e7eb] rounded-xl shadow-sm flex flex-col items-start gap-4 hover:shadow-md transition-shadow">
                <div className="w-full">
                   <label className="block text-sm font-extrabold text-[#111827] mb-2 tracking-tight">Post a response</label>
                   <textarea
                     value={commentText}
                     onChange={(e) => setCommentText(e.target.value)}
                     placeholder="Type your reply here..."
                     className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] text-sm resize-none bg-[#f9fafb] focus:bg-white transition-all shadow-inner"
                     rows={4}
                     required
                   />
                </div>
                
                {/* Real File Upload Section */}
                 <div className="w-full space-y-2">
                   <label className="block text-xs font-bold text-[#6b7280] uppercase tracking-widest">Attach File (PNG, JPG, PDF — max 5MB)</label>
                   <div className="flex items-center gap-3">
                     <label className="cursor-pointer border border-dashed border-[#e5e7eb] hover:border-[#4f46e5] bg-[#f9fafb] hover:bg-[#eef2ff] px-4 py-2.5 rounded-lg text-sm font-semibold text-[#4f46e5] transition-all flex items-center gap-2">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                       {uploadFile ? uploadFile.name : 'Choose File'}
                       <input type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden" onChange={handleFileChange} />
                     </label>
                     {uploadFile && (
                       <>
                         <span className="text-xs text-[#6b7280] font-medium">{(uploadFile.size / 1024).toFixed(1)} KB</span>
                         <Button type="button" size="sm" onClick={handleFileUpload} disabled={isUploading} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700">
                           {isUploading ? 'Uploading...' : 'Upload'}
                         </Button>
                         <button type="button" onClick={() => setUploadFile(null)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>
                       </>
                     )}
                   </div>
                   {uploadError && (
                     <div className="text-red-600 text-xs font-semibold bg-red-50 border border-red-200 px-3 py-1.5 rounded">{uploadError}</div>
                   )}
                 </div>
                                <div className="w-full flex items-center justify-end pt-2">
                   <Button type="submit" disabled={isCommenting || !commentText.trim()} className="px-6 flex items-center gap-2 shadow-[0_2px_4px_0_rgba(0,0,0,0.06)]">
                     {isCommenting ? "Sending..." : "Submit Response"}
                     {!isCommenting && <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                   </Button>
                </div>
              </form>
            ) : (
              <div className="mt-8 bg-[#f4f6f8] p-6 text-center border border-[#e5e7eb] rounded-xl flex flex-col items-center justify-center gap-3">
                <svg className="w-8 h-8 text-[#9ca3af]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <div>
                   <h4 className="text-base font-bold text-[#111827]">Discussion Locked</h4>
                   <p className="text-sm text-[#6b7280] mt-1 max-w-sm">This ticket has been permanently closed. If the issue persists, please open a fresh request.</p>
                </div>
              </div>
            )}

            {/* Satisfaction Rating Feature */}
            {showRating && (
               <div className="mt-8 bg-gradient-to-br from-indigo-50 to-white p-8 border border-indigo-100 rounded-xl shadow-sm text-center">
                  <h3 className="text-lg font-extrabold text-[#111827] tracking-tight">Rate your support experience</h3>
                  <p className="text-sm text-[#6b7280] mt-1 mb-5">Your feedback helps us refine our enterprise SLA compliance.</p>
                  
                  {ratingSubmitted ? (
                     <div className="text-emerald-600 font-bold flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        Thank you for your rating!
                     </div>
                  ) : (
                     <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                           <button 
                             key={star}
                             type="button"
                             disabled={ratingSubmitted}
                             onMouseEnter={() => !ratingSubmitted && setHoverRating(star)}
                             onMouseLeave={() => !ratingSubmitted && setHoverRating(0)}
                             onClick={() => !ratingSubmitted && handleRating(star)}
                             className={`transition-transform focus:outline-none ${!ratingSubmitted && 'hover:scale-110 cursor-pointer'} ${ratingSubmitted && 'cursor-default'}`}
                           >
                              <svg 
                                className={`w-10 h-10 ${star <= (hoverRating || rating) ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`} 
                                fill="currentColor" 
                                viewBox="0 0 20 20"
                              >
                                 <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            )}
          </div>
        </div>

        {/* Sidebar Info Array */}
        <div className="lg:col-span-1 space-y-6">
          <Card title="Issue Telemetry" className="shadow-md">
            <div className="space-y-6 text-sm divide-y divide-[#e5e7eb]">
              <div className="pb-4">
                <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-2">Current State</div>
                <Badge variant={ticket.status === "CLOSED" ? "dark-gray" : ticket.status === "RESOLVED" ? "green" : ticket.status === "IN_PROGRESS" ? "amber" : "gray"}>
                  {ticket.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="py-4">
                <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-2">Priority Classification</div>
                <Badge variant={ticket.priority === "URGENT" ? "red" : ticket.priority === "HIGH" ? "orange" : ticket.priority === "MEDIUM" ? "blue" : "gray"}>
                  {ticket.priority}
                </Badge>
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-1.5">Submitted By</div>
                  <div className="font-extrabold text-[#111827]">{ticket.userName}</div>
                </div>
              </div>
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-1.5">Lead Delegate</div>
                  <div className="font-extrabold text-[#111827]">{ticket.assignedAgentName || <span className="text-gray-400 italic font-medium">Unassigned</span>}</div>
                </div>
              </div>
              <div className="pt-4">
                <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-1.5">Time of Origin</div>
                <div className="text-[#4b5563] font-medium">
                  {new Date(ticket.createdAt).toLocaleString(undefined, { 
                     year: 'numeric', month: 'long', day: 'numeric',
                     hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
              {/* Attachment Display */}
              <div className="pt-4">
                <div className="text-[#9ca3af] text-[11px] font-bold uppercase tracking-widest mb-2">Attachment</div>
                {ticket.attachmentPath ? (
                  <a
                    href={`http://localhost:8080/api/tickets/${ticket.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-sm font-semibold text-[#4f46e5] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    {ticket.attachmentPath.split('_').slice(2).join('_') || ticket.attachmentPath}
                  </a>
                ) : (
                  <span className="text-xs text-[#9ca3af] italic">No attachment</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
