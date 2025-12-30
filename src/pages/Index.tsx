import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlowOrb } from "@/components/GlowOrb";
import { Footer } from "@/components/Footer";
import { MessageSquare, Copy, Check, Link, Inbox, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Message {
  content: string;
  createdAt: string;
  _id?: string;
}

interface LinkData {
  publicUrl: string;
  inboxUrl: string;
  _id: string;
  nickname: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [createdLink, setCreatedLink] = useState<LinkData | null>(null);
  const [copiedPublic, setCopiedPublic] = useState(false);
  const [copiedInbox, setCopiedInbox] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Check localStorage for existing link
  useEffect(() => {
    const savedLink = localStorage.getItem("myAnonymousLink");
    if (savedLink) {
      const linkData: LinkData = JSON.parse(savedLink);
      setCreatedLink(linkData);
      fetchMessages(linkData._id);
    }
    setLoading(false);
  }, []);

  const fetchMessages = async (linkId?: string) => {
    if (!linkId) return;

    try {
      const res = await axios.get(
        `http://localhost:3000/link/messages/${linkId}`
      );

      // ✅ READ THE CORRECT FIELD
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch messages");
    }
  };



  const handleCreateLink = async () => {
    if (!nickname.trim()) {
      toast.error("Please enter a nickname");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/link/create", {
        nickname: nickname.trim(),
      });

      const data = response.data;
      const baseUrl = window.location.origin;

      const linkData: LinkData = {
        publicUrl: `${baseUrl}/u/${data.publicId}`,
        inboxUrl: `${baseUrl}/inbox/${data.inboxId}`,
        _id: data._id,
        nickname: data.nickname,
      };

      console.log(linkData, "link data");

      setCreatedLink(linkData);
      localStorage.setItem("myAnonymousLink", JSON.stringify(linkData));

      // Fetch initial messages
      setMessages(data.messages || []);

      toast.success("Your anonymous link has been created!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create link");
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);



if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}


  return (
    <div className="min-h-screen relative overflow-hidden pb-20 z-10">
      <GlowOrb className="-top-32 -left-32" size="lg" />
      <GlowOrb className="top-1/2 -right-48" size="lg" />
      <GlowOrb className="bottom-20 left-1/4" size="md" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-20">
        {!createdLink ? (
          <div className="text-center mb-16 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">100% Anonymous</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Receive <span className="text-gradient">Anonymous</span>
              <br />Messages Safely
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Create your unique link and let anyone send you anonymous messages.
              Simple, secure, and completely private.
            </p>

            {/* Create Link Form */}
            <div className="glass-card p-8 md:p-10 shadow-card mt-8 animate-fade-up">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-muted-foreground">
                    Your Nickname
                  </label>
                  <Input
                    placeholder="Enter your nickname..."
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateLink()}
                    className="text-lg"
                  />
                </div>
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleCreateLink}
                >
                  Create My Anonymous Link
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-8 md:p-10 shadow-card animate-fade-up space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Your Link is Ready!</h2>
              <p className="text-muted-foreground">Share your public link and keep your inbox link private</p>
            </div>

            {/* Public Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-primary" />
                <label className="text-sm font-medium">Public Link (Share this)</label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={createdLink.publicUrl}
                  readOnly
                  className="font-mono text-sm bg-secondary/80"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdLink.publicUrl, "public")}
                >
                  {copiedPublic ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Inbox Link */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Inbox className="w-4 h-4 text-primary" />
                <label className="text-sm font-medium">Inbox Link (Keep this private!)</label>
              </div>
              <div className="flex gap-2">
                <Input
                  value={createdLink.inboxUrl}
                  readOnly
                  className="font-mono text-sm bg-secondary/80"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(createdLink.inboxUrl, "inbox")}
                >
                  {copiedInbox ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Inbox Messages */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-base">
                  Messages Preview
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                  {messages.length} today
                </span>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">
                      No messages yet today.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Share your public link to receive messages
                    </p>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={msg._id || i}
                      className="glass-card p-3 rounded-lg space-y-1 cursor-pointer hover:shadow-lg transition"
                      onClick={() => setSelectedMessage(msg)}
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Anonymous</span>
                        <span>{formatDateTime(msg.createdAt)}</span>
                      </div>

                      <p className="text-sm leading-relaxed truncate">
                        {msg.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Modal */}
            {selectedMessage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                {/* Prevent body scrolling */}
                <style>{`body { overflow: hidden; }`}</style>

                <div
                  className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full mx-4 p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[80vh] relative"
                  onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
                >
                  {/* Close button */}
                  <button
                    className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-bold text-lg"
                    onClick={() => setSelectedMessage(null)}
                  >
                    ✕
                  </button>

                  {/* Header */}
                  <div className="flex items-center justify-between mt-5 mb-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                    <span>Anonymous</span>
                    <span>{new Date(selectedMessage.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}</span>
                  </div>

                  {/* Message content */}
                  <div className="text-gray-800 dark:text-gray-100 text-base leading-relaxed whitespace-pre-wrap break-words">
                    {selectedMessage.content}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                variant="glass"
                className="flex-1"
                onClick={() => window.open(createdLink.inboxUrl, "_blank")}
              >
                <Inbox className="w-4 h-4" />
                View Inbox
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setCreatedLink(null);
                  setNickname("");
                  setMessages([]);
                  localStorage.removeItem("myAnonymousLink");
                }}
              >
                Create Another
              </Button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Index;
