import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowOrb } from "@/components/GlowOrb";
import { Footer } from "@/components/Footer";
import {
  Inbox as InboxIcon,
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  Clock,
  Link,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";

const Inbox = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const navigate = useNavigate();

  const [link, setLink] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedInbox, setCopiedInbox] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null); // ✅ modal state

  useEffect(() => {
    if (!inboxId) return;

    const fetchInbox = async () => {
      try {
        const res = await axios.get(`https://whisper-flow-be.onrender.com/link/inbox/${inboxId}`);
        setLink(res.data);
        setMessages(res.data.messages || []);
      } catch (err) {
        console.log(err);
        toast.error("Invalid Inbox Link");
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [inboxId]);

  const baseUrl = window.location.origin;
  const publicUrl = link ? `${baseUrl}/u/${link.publicId}` : "";
  const inboxUrl = link ? `${baseUrl}/inbox/${link.inboxId}` : "";

  const copyToClipboard = async (text: string, type: "public" | "inbox") => {
    await navigator.clipboard.writeText(text);
    if (type === "public") {
      setCopiedPublic(true);
      setTimeout(() => setCopiedPublic(false), 2000);
    } else {
      setCopiedInbox(true);
      setTimeout(() => setCopiedInbox(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
        <GlowOrb className="-top-32 -left-32" size="lg" />
        <GlowOrb className="bottom-20 right-20" size="md" />
        <div className="glass-card p-8 md:p-10 max-w-md w-full text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-3">Invalid Inbox Link</h1>
          <p className="text-muted-foreground mb-6">
            This inbox link doesn't exist or may have been removed.
          </p>
          <Button variant="hero" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-24">
      <GlowOrb className="-top-32 -left-32" size="lg" />
      <GlowOrb className="top-1/2 -right-48" size="lg" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <InboxIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Anonymous Inbox</h1>
              <p className="text-muted-foreground text-sm">Welcome back, {link.nickname}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="glass-card p-6 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Link className="w-4 h-4 text-primary" />
            Your Links
          </h2>

          <div className="space-y-4">
            {/* Public Link */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Public Link (share this)
              </label>
              <div className="flex gap-2">
                <Input
                  value={publicUrl}
                  readOnly
                  className="font-mono text-xs bg-secondary/80"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(publicUrl, "public")}
                >
                  {copiedPublic ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(publicUrl, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Inbox Link */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Inbox Link (keep private!)
              </label>
              <div className="flex gap-2">
                <Input
                  value={inboxUrl}
                  readOnly
                  className="font-mono text-xs bg-secondary/80"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(inboxUrl, "inbox")}
                >
                  {copiedInbox ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            Anyone with your inbox link can view your messages
          </p>
        </div>

        {/* Messages */}
        <div className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Messages ({messages.length})
            </h2>
          </div>

          {messages.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No messages yet</h3>
              <p className="text-muted-foreground mb-6">
                Share your public link to start receiving anonymous messages
              </p>
              <Button
                variant="hero"
                onClick={() => copyToClipboard(publicUrl, "public")}
              >
                <Copy className="w-4 h-4" />
                Copy Public Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={msg._id}
                  className="glass-card p-5 hover:border-primary/30 transition-colors cursor-pointer"
                  style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                  onClick={() => setSelectedMessage(msg)} // ✅ open modal on click
                >
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {selectedMessage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          {/* Prevent body scroll */}
          <style>{`body { overflow: hidden; }`}</style>

          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full mx-4 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-lg"
              onClick={() => setSelectedMessage(null)}
            >
              ✕
            </button>

            <div className="flex items-center mt-5 justify-between mb-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
              <span>Anonymous</span>
              <span>{new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}</span>
            </div>

            <div className="text-gray-800 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap break-words">
              {selectedMessage.content}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Inbox;
