import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Minus, Plus, ShieldCheck, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { api } from "../api/client";
import { useToast } from "../context/ToastContext";
import Button from "../components/Button";

const STEP_LABELS = ["Select", "Review", "Payment", "Done"];

export default function BookingFlow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [quantities, setQuantities] = useState({});
  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [paying, setPaying] = useState(false);
  const [paymentState, setPaymentState] = useState(null); // null | processing | successful | failed
  const [creatingBooking, setCreatingBooking] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    api
      .getEvent(id)
      .then((d) => setEvent(d.event))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <span className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }
  if (!event) return null;

  const items = Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([ticketTypeId, quantity]) => ({ ticketTypeId, quantity }));
  const total = items.reduce((sum, item) => {
    const t = event.ticketTypes.find((tt) => tt.id === item.ticketTypeId);
    return sum + (t ? t.price * item.quantity : 0);
  }, 0);

  function setQty(ticketTypeId, delta, max) {
    setFormError("");
    setQuantities((q) => {
      const next = Math.max(0, Math.min(max, (q[ticketTypeId] || 0) + delta));
      return { ...q, [ticketTypeId]: next };
    });
  }

  async function handleCreateBooking() {
    if (items.length === 0) {
      setFormError("Select at least one ticket to continue.");
      return;
    }
    setCreatingBooking(true);
    try {
      const { booking } = await api.createBooking({ eventId: id, items });
      setBooking(booking);
      setStep(1);
    } catch (err) {
      push(err.message, "error");
    } finally {
      setCreatingBooking(false);
    }
  }

  async function handlePay(simulateFailure = false) {
    setPaying(true);
    setPaymentState("processing");
    setStep(2);
    try {
      const res = await api.payBooking(booking.id, { simulateFailure });
      if (res.booking.paymentStatus === "failed") {
        setPaymentState("failed");
        push(res.message, "error");
      } else {
        setPaymentState("successful");
        setTickets(res.tickets);
        setStep(3);
      }
    } catch (err) {
      setPaymentState("failed");
      push(err.message, "error");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <button
        onClick={() => (step === 0 ? navigate(-1) : setStep((s) => Math.max(0, s - 1)))}
        className="flex items-center gap-1.5 text-sm text-ink-faint hover:text-ink mb-4"
        disabled={step === 3}
      >
        <ArrowLeft size={15} /> {step === 0 ? "Back to event" : "Back"}
      </button>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex-1 flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                i <= step ? "bg-ink text-white" : "bg-ink/8 text-ink-faint"
              }`}
            >
              {i < step ? <CheckCircle2 size={15} /> : i + 1}
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div className={`h-0.5 flex-1 rounded ${i < step ? "bg-ink" : "bg-ink/8"}`} />
            )}
          </div>
        ))}
      </div>

      <h1 className="font-display font-bold text-xl text-ink mb-1">{event.title}</h1>
      <p className="text-ink-faint text-sm mb-6">{event.venue}</p>

      {/* Step 0: select */}
      {step === 0 && (
        <div className="space-y-3">
          {event.ticketTypes.map((t) => (
            <div key={t.id} className="bg-white rounded-xl2 p-4 shadow-soft">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-ink">{t.name}</p>
                  <p className="font-mono text-sm text-ink-soft mt-0.5">
                    {t.price ? `₹${t.price}` : "Free"}
                  </p>
                  {t.perks?.length > 0 && (
                    <ul className="text-xs text-ink-faint mt-1.5 space-y-0.5">
                      {t.perks.map((p) => (
                        <li key={p}>· {p}</li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-ink-faint mt-1.5">
                    {t.availableQuantity > 0 ? `${t.availableQuantity} available` : "Sold out"}
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setQty(t.id, -1, t.availableQuantity)}
                    disabled={!quantities[t.id]}
                    className="w-7 h-7 rounded-full border border-ink/15 flex items-center justify-center text-ink-soft disabled:opacity-30"
                    aria-label={`Decrease ${t.name} quantity`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="w-4 text-center text-sm font-medium">{quantities[t.id] || 0}</span>
                  <button
                    onClick={() => setQty(t.id, 1, t.availableQuantity)}
                    disabled={t.availableQuantity === 0 || (quantities[t.id] || 0) >= t.availableQuantity}
                    className="w-7 h-7 rounded-full border border-ink/15 flex items-center justify-center text-ink-soft disabled:opacity-30"
                    aria-label={`Increase ${t.name} quantity`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {formError && <p className="text-sm text-coral-600">{formError}</p>}

          <div className="sticky bottom-4 bg-white rounded-xl2 shadow-lift p-4 flex items-center justify-between mt-6">
            <div>
              <p className="text-xs text-ink-faint">Total</p>
              <p className="font-display font-bold text-lg">₹{total}</p>
            </div>
            <Button onClick={handleCreateBooking} loading={creatingBooking} size="lg">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 1: review */}
      {step === 1 && booking && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl2 p-4 shadow-soft space-y-2.5">
            {booking.items.map((item) => {
              const t = event.ticketTypes.find((tt) => tt.id === item.ticketTypeId);
              return (
                <div key={item.ticketTypeId} className="flex items-center justify-between text-sm">
                  <span className="text-ink-soft">{t.name} × {item.quantity}</span>
                  <span className="font-mono">₹{t.price * item.quantity}</span>
                </div>
              );
            })}
            <div className="border-t border-ink/8 pt-2.5 flex items-center justify-between font-medium">
              <span>Total</span>
              <span className="font-mono">₹{booking.totalAmount}</span>
            </div>
          </div>
          <div className="bg-violet-50 rounded-xl p-3.5 flex items-start gap-2 text-sm text-violet-700">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            Secured with Eventra's demo payment layer. No real money moves.
          </div>
          <Button className="w-full" size="lg" onClick={() => handlePay(false)}>
            Proceed to demo payment
          </Button>
        </div>
      )}

      {/* Step 2: payment processing / failed */}
      {step === 2 && (
        <div className="flex flex-col items-center text-center py-10">
          {paymentState === "processing" && (
            <>
              <span className="w-10 h-10 border-[3px] border-violet-200 border-t-violet-600 rounded-full animate-spin mb-5" />
              <p className="font-medium text-ink">Processing your demo payment…</p>
              <p className="text-ink-faint text-sm mt-1">This is a simulated gateway — please wait a moment.</p>
            </>
          )}
          {paymentState === "failed" && (
            <>
              <XCircle size={40} className="text-coral-500 mb-4" />
              <p className="font-display font-semibold text-lg text-ink">Payment failed</p>
              <p className="text-ink-faint text-sm mt-1 max-w-xs">
                Your seats have been released back to availability. No charge was made.
              </p>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => navigate(`/events/${id}`)}>
                  Back to event
                </Button>
                <Button onClick={() => setStep(0)}>Try again</Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 3: confirmation */}
      {step === 3 && (
        <div className="flex flex-col items-center text-center py-6">
          <CheckCircle2 size={44} className="text-mint-500 mb-4" />
          <h2 className="font-display font-bold text-xl text-ink">Booking confirmed!</h2>
          <p className="text-ink-faint text-sm mt-1.5 max-w-xs">
            {tickets.length} digital ticket{tickets.length > 1 ? "s" : ""} generated with a unique QR code each.
          </p>
          <div className="w-full space-y-2.5 mt-6">
            {tickets.map((t) => (
              <div key={t.id} className="bg-white rounded-xl2 p-3.5 shadow-soft flex items-center gap-3 text-left">
                <img src={t.qrCode} alt="" className="w-12 h-12 rounded-lg" />
                <div>
                  <p className="font-medium text-sm text-ink">{t.ticketType}</p>
                  <p className="font-mono text-xs text-ink-faint">{t.id}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2.5 w-full mt-7">
            <Button as={Link} to="/tickets" size="lg">
              View my tickets
            </Button>
            <Button as={Link} to="/squads" variant="outline" size="lg">
              Create a squad for this event
            </Button>
          </div>
        </div>
      )}

      {/* Demo-only failure trigger, only visible on review step */}
      {step === 1 && (
        <button
          onClick={() => handlePay(true)}
          className="text-xs text-ink-faint hover:text-coral-600 mt-4 underline mx-auto block"
        >
          Simulate a failed payment (demo)
        </button>
      )}
    </div>
  );
}
