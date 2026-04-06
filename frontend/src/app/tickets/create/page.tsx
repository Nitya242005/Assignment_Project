"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/services/api";
import { TicketPriority } from "@/types";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CreateTicketPage() {
  const router = useRouter();
  
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("LOW");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [uploadMock, setUploadMock] = useState<{name: string, size: string}[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadMock(prev => [...prev, ...files.map(f => ({ 
        name: f.name, 
        size: (f.size / 1024).toFixed(1) + ' KB' 
      }))]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/tickets", {
        subject,
        description,
        priority,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">Submit Request</h1>
          <p className="text-sm text-[#6b7280] font-medium mt-1">Describe the issue and our team will get back to you shortly.</p>
        </div>
      </div>

      <Card className="shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6 p-2">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          
          <Input
            label="Subject Summary"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            placeholder="Brief description of the issue..."
          />

          <div className="flex flex-col gap-1.5 w-full text-sm">
            <label className="text-sm font-semibold text-[#111827]">Detailed Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Provide exact replication steps, error codes, and related system context..."
              className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] text-[#111827] placeholder:text-[#9ca3af] transition-all duration-200 resize-none shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5 w-full text-sm">
              <label className="text-sm font-semibold text-[#111827]">Priority Rating</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
                className="w-full px-4 py-3 rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/30 focus:border-[#4f46e5] bg-white transition-all duration-200 shadow-sm cursor-pointer font-medium"
              >
                <option value="LOW">Low - Minimal workflow impact</option>
                <option value="MEDIUM">Medium - Partial disruption</option>
                <option value="HIGH">High - Significant functional loss</option>
                <option value="URGENT">Urgent - System wide failure</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5 w-full text-sm justify-start">
              <label className="text-sm font-semibold text-[#111827]">Related Attachments</label>
              <div className="mt-1 flex items-center gap-3">
                <label className="cursor-pointer border border-[#e5e7eb] bg-white px-4 py-2.5 rounded-lg shadow-sm hover:shadow text-sm font-semibold text-[#4f46e5] hover:bg-[#f4f6f8] transition-all flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  Browse Files
                  <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                </label>
                <span className="text-xs font-medium text-[#9ca3af]">Up to 25MB (PDF, PNG, JPG)</span>
              </div>
            </div>
          </div>

          {/* Attachment Previews */}
          {uploadMock.length > 0 && (
            <div className="bg-[#f9fafb] p-3 rounded-lg border border-[#e5e7eb] mt-2">
              <h4 className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">Attached Files queue ({uploadMock.length})</h4>
              <ul className="space-y-2">
                {uploadMock.map((file, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-white p-2 border border-[#e5e7eb] rounded shadow-sm text-sm">
                    <span className="font-semibold text-[#111827] truncate overflow-hidden max-w-[200px] sm:max-w-[300px] shrink">{file.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-[#9ca3af] font-medium">{file.size}</span>
                      <button type="button" className="text-red-500 hover:text-red-700" onClick={() => setUploadMock(prev => prev.filter((_, i) => i !== idx))}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-[#e5e7eb] flex items-center justify-between">
            <Link href="/dashboard" className="text-sm font-semibold text-[#6b7280] hover:text-[#111827] transition-colors">
              Cancel
            </Link>
            <Button type="submit" disabled={loading} size="lg" className="px-8 flex items-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </>
              ) : (
                <>
                   Submit Ticket
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
