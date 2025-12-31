import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  // Only show button if install is possible
  if (!showInstall) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return; // guard against null
    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    console.log("User choice:", choiceResult);
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  return (
    <button
      onClick={handleInstallClick}
      className="px-3 py-2 rounded-lg  text-white"
    >
        <Download className="inline-block w-5 h-5 mr-2" />
      Install App
    </button>

    
  );
}
