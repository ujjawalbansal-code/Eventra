import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, ShieldCheck, Share2 } from "lucide-react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import Badge from "../components/Badge";

export default function TicketDetail() {
  const { id } = useParams();
  const { push } = useToast();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getTicket(id)
      .then((d) => setTicket(d.ticket))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleShare() {
    const shareText = `My ${ticket.ticketType} ticket for ${ticket.event.title} — Ticket ID ${ticket.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Eventra ticket", text: shareText });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(shareText);
    push("Ticket details copied to clipboard", "success");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="text-center py-24">
        <p className="text-ink-faint">This ticket could not be verified.</p>
        <Link to="/tickets" className="text-violet-600 text-sm font-medium hover:underline mt-3 inline-block">
          Back to my tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-8">
      <Link to="/tickets" className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink mb-6">
        <ArrowLeft size={15} /> My tickets
      </Link>

      <div className="bg-white rounded-xl2 shadow-card overflow-hidden">
        <div className="bg-ink px-6 pt-6 pb-8 text-center">
          <Badge tone="mint" className="bg-mint-500/20 text-mint-400 mb-3">
            <ShieldCheck size={12} /> Verified ticket
          </Badge>
          <h1 className="font-display font-bold text-lg text-white leading-snug">{ticket.event.title}</h1>
          <p className="text-white/50 text-sm mt-1">{ticket.attendeeName}</p>
        </div>

        <div className="px-6 -mt-5">
          <div className="bg-white rounded-xl2 shadow-lift p-5 flex flex-col items-center">
            <img src={ticket.qrCode} alt="Ticket QR code" className="w-44 h-44" />
            <p className="font-mono text-sm text-ink mt-3 tracking-wide">{ticket.id}</p>
          </div>
        </div>

        <div className="p-6 space-y-3 text-sm">
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Calendar size={15} className="text-violet-500" /> {ticket.event.date}
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <Clock size={15} className="text-violet-500" /> {ticket.event.time}
          </div>
          <div className="flex items-center gap-2.5 text-ink-soft">
            <MapPin size={15} className="text-violet-500" /> {ticket.event.venue}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-ink/8">
            <span className="text-ink-faint">Ticket type</span>
            <Badge tone="violet">{ticket.ticketType}</Badge>
          </div>
        </div>
      </div>

      <button
        onClick={handleShare}
        className="w-full mt-4 flex items-center justify-center gap-2 rounded-full border border-ink/10 py-3 text-sm font-medium text-ink-soft hover:border-violet-400"
      >
        <Share2 size={16} /> Share ticket
      </button>
    </div>
  );
}
