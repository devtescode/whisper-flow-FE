import { Shield } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 py-6 px-6 border-t border-border/30 bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>Messages are completely anonymous.</span>
        </div>
        <a href="#" className="hover:text-primary transition-colors">
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};
