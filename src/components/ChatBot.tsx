import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  X,
  Send,
  ChevronDown,
  Bot,
  User,
  RotateCcw,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL } from "../lib/api";
import type { Language } from "../i18n/translations";

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  suggestions?: string[];
  link?: string;
  timestamp: Date;
}

interface ApiResponse {
  reply: string;
  suggestions: string[];
  link?: string;
}

interface StoredMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  suggestions?: string[];
  link?: string;
  timestamp: string;
}

const CHATBOT_URL = `${API_BASE_URL.replace(/\/+$/, "")}/chatbot`;
const CHATBOT_STORAGE_PREFIX = "tourigo-chatbot-history-v1";
const MAX_MESSAGES = 60;

const FALLBACK_WELCOME_BY_LANGUAGE: Record<Language, string> = {
  fr: "Bonjour ! 👋 Je suis votre assistant TouriGo. Comment puis-je vous aider ?",
  en: "Hello! 👋 I am your TouriGo assistant. How can I help you?",
  ar: "مرحبًا! 👋 أنا مساعدك في TouriGo. كيف يمكنني مساعدتك؟",
};

const FALLBACK_SUGGESTIONS_BY_LANGUAGE: Record<Language, string[]> = {
  fr: ["🏠 Immobilier", "🚗 Véhicules", "🌴 Activités"],
  en: ["🏠 Real estate", "🚗 Vehicles", "🌴 Activities"],
  ar: ["🏠 عرض العقارات", "🚗 استئجار مركبة", "🌴 اكتشاف الأنشطة"],
};

const FALLBACK_ERROR_BY_LANGUAGE: Record<Language, string> = {
  fr: "Désolé, je rencontre une difficulté technique. Réessayez dans quelques instants.",
  en: "Sorry, I am facing a technical issue. Please try again in a moment.",
  ar: "عذرًا، أواجه مشكلة تقنية حاليًا. حاول مرة أخرى بعد قليل.",
};

const createMessageId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const SUGGESTION_PATHS: Record<string, string> = {
  "🏠 Voir l'immobilier": "/immobilier",
  "🏠 Immobilier": "/immobilier",
  "🚗 Louer un véhicule": "/vehicules",
  "🚗 Véhicules": "/vehicules",
  "🌴 Découvrir des activités": "/activites",
  "🌴 Activités": "/activites",
  "🔑 Se connecter": "/connexion",
  "📝 S'inscrire": "/inscription",
  "✅ Devenir hôte": "/devenir-hote",
  "📋 Voir toutes les annonces": "/resultats",
  "📋 Voir les annonces": "/resultats",
  "🔍 Rechercher un logement": "/immobilier",
  "🔍 Chercher un véhicule": "/vehicules",
  "🔍 Voir les logements": "/immobilier",
  "🔍 Voir les véhicules": "/vehicules",
  "🔍 Voir les activités": "/activites",
  "🔍 Chercher une activité": "/activites",
  "🔍 Voir les annonces": "/resultats",
  "📍 Activités à Béjaïa": "/activites?destination=bejaia",
  "📍 Activités à Alger": "/activites?destination=alger",
  "🏠 Logement à Béjaïa": "/immobilier?destination=bejaia",
  "🏠 Logement à Alger": "/immobilier?destination=alger",
  "🚗 Véhicule à Béjaïa": "/vehicules?destination=bejaia",
  "🚗 Véhicule à Alger": "/vehicules?destination=alger",
  "🌴 Activités à Béjaïa": "/activites?destination=bejaia",
  "🌴 Activités à Alger": "/activites?destination=alger",
  "🏠 Chercher un logement": "/immobilier",
  "🚗 Chercher un véhicule": "/vehicules",
  "🌴 Chercher une activité": "/activites",
  "❓ Aide": "/centre-aide",
  "🏠 Real estate": "/immobilier",
  "🚗 Vehicles": "/vehicules",
  "🌴 Activities": "/activites",
  "🏠 عرض العقارات": "/immobilier",
  "🏠 العقارات": "/immobilier",
  "🚗 استئجار مركبة": "/vehicules",
  "🚗 المركبات": "/vehicules",
  "🌴 اكتشاف الأنشطة": "/activites",
  "🌴 الأنشطة": "/activites",
  "🔑 تسجيل الدخول": "/connexion",
  "📝 إنشاء حساب": "/inscription",
  "✅ أصبح مضيفًا": "/devenir-hote",
  "📋 عرض كل الإعلانات": "/resultats",
  "📋 عرض الإعلانات": "/resultats",
  "🔍 البحث عن سكن": "/immobilier",
  "🔍 البحث عن مركبة": "/vehicules",
  "🔍 البحث عن نشاط": "/activites",
  "🔍 عرض العقارات": "/immobilier",
  "🔍 عرض المركبات": "/vehicules",
  "🔍 عرض الأنشطة": "/activites",
  "🔍 عرض الإعلانات": "/resultats",
  "📍 أنشطة في بجاية": "/activites?destination=bejaia",
  "📍 أنشطة في الجزائر": "/activites?destination=alger",
  "🏠 سكن في بجاية": "/immobilier?destination=bejaia",
  "🏠 سكن في الجزائر": "/immobilier?destination=alger",
  "🚗 مركبة في بجاية": "/vehicules?destination=bejaia",
  "🚗 مركبة في الجزائر": "/vehicules?destination=alger",
  "🌴 أنشطة في بجاية": "/activites?destination=bejaia",
  "🌴 أنشطة في الجزائر": "/activites?destination=alger",
  "❓ مساعدة": "/centre-aide",
};

const getLinkLabel = (link: string, language: Language) => {
  const isArabic = language === "ar";
  if (link.startsWith("/immobilier")) return isArabic ? "عرض العقارات" : "Voir l'immobilier";
  if (link.startsWith("/vehicules")) return isArabic ? "عرض المركبات" : "Voir les véhicules";
  if (link.startsWith("/activites")) return isArabic ? "عرض الأنشطة" : "Voir les activités";
  if (link.startsWith("/devenir-hote")) return isArabic ? "أصبح مضيفًا" : "Devenir hôte";
  if (link.startsWith("/connexion")) return isArabic ? "تسجيل الدخول" : "Se connecter";
  if (link.startsWith("/resultats")) return isArabic ? "عرض النتائج" : "Voir les résultats";
  if (link.startsWith("/centre-aide")) return isArabic ? "فتح المساعدة" : "Ouvrir l'aide";
  return isArabic ? "فتح الصفحة" : "Ouvrir la page";
};

const getCurrentContext = (): "immobilier" | "vehicule" | "activite" | undefined => {
  if (typeof window === "undefined") return undefined;
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith("/immobilier")) return "immobilier";
  if (path.startsWith("/vehicules")) return "vehicule";
  if (path.startsWith("/activites")) return "activite";
  return undefined;
};

const parseStoredMessages = (raw: string | null): Message[] => {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        const stored = item as Partial<StoredMessage>;
        if (!stored || (stored.role !== "bot" && stored.role !== "user")) return null;
        if (typeof stored.text !== "string" || typeof stored.timestamp !== "string") return null;

        const date = new Date(stored.timestamp);
        if (Number.isNaN(date.getTime())) return null;

        const restoredMessage: Message = {
          id: typeof stored.id === "string" ? stored.id : createMessageId(),
          role: stored.role,
          text: stored.text,
          timestamp: date,
        };

        if (Array.isArray(stored.suggestions)) {
          restoredMessage.suggestions = stored.suggestions.filter(
            (value): value is string => typeof value === "string"
          );
        }
        if (typeof stored.link === "string") {
          restoredMessage.link = stored.link;
        }

        return restoredMessage;
      })
      .filter((message): message is Message => message !== null)
      .slice(-MAX_MESSAGES);
  } catch {
    return [];
  }
};

export default function ChatBot() {
  const { language } = useLanguage();
  const storageKey = `${CHATBOT_STORAGE_PREFIX}-${language}`;
  const isArabic = language === "ar";
  const uiCopy = isArabic
    ? {
        openAria: "فتح مساعد المحادثة",
        dialogAria: "مساعد TouriGo",
        online: "متصل",
        newChatAria: "محادثة جديدة",
        closeAria: "إغلاق المحادثة",
        inputPlaceholder: "اكتب رسالتك...",
        inputAria: "رسالة إلى المساعد",
        sendAria: "إرسال",
      }
    : {
        openAria: "Ouvrir le chat assistant",
        dialogAria: "Assistant TouriGo",
        online: "En ligne",
        newChatAria: "Nouvelle conversation",
        closeAria: "Fermer le chat",
        inputPlaceholder: "Écrivez votre message...",
        inputAria: "Message au chatbot",
        sendAria: "Envoyer",
      };

  const initialMessages = useMemo(() => {
    if (typeof window === "undefined") return [];
    return parseStoredMessages(window.localStorage.getItem(storageKey));
  }, [storageKey]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [welcomeLoaded, setWelcomeLoaded] = useState(initialMessages.length > 0);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const addBotMessage = useCallback(
    (text: string, suggestions?: string[], link?: string) => {
      setMessages((prev) => [
        ...prev.slice(-(MAX_MESSAGES - 1)),
        {
          id: createMessageId(),
          role: "bot",
          text,
          suggestions,
          link,
          timestamp: new Date(),
        },
      ]);
      if (!isOpen) setHasUnread(true);
    },
    [isOpen]
  );

  const addUserMessage = useCallback((text: string) => {
    setMessages((prev) => [
      ...prev.slice(-(MAX_MESSAGES - 1)),
      { id: createMessageId(), role: "user", text, timestamp: new Date() },
    ]);
  }, []);

  const navigateToPath = useCallback(
    (path: string) => {
      if (!path) return;
      if (path.startsWith("http://") || path.startsWith("https://")) {
        window.open(path, "_blank", "noopener,noreferrer");
        return;
      }
      setIsOpen(false);
      navigate(path);
    },
    [navigate]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedMessages: StoredMessage[] = messages.slice(-MAX_MESSAGES).map((message) => ({
      id: message.id,
      role: message.role,
      text: message.text,
      suggestions: message.suggestions,
      link: message.link,
      timestamp: message.timestamp.toISOString(),
    }));
    window.localStorage.setItem(storageKey, JSON.stringify(storedMessages));
  }, [messages, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const restoredMessages = parseStoredMessages(window.localStorage.getItem(storageKey));
    setMessages(restoredMessages);
    setWelcomeLoaded(restoredMessages.length > 0);
    setIsTyping(false);
  }, [storageKey]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setHasUnread(false);
    }
  }, [isOpen]);

  const loadWelcome = useCallback(
    async (force = false) => {
      if (welcomeLoaded && !force) return;
      setWelcomeLoaded(true);
      setIsTyping(true);
      try {
        const res = await fetch(`${CHATBOT_URL}/welcome?language=${encodeURIComponent(language)}`);
        if (!res.ok) throw new Error("Unable to load welcome message");
        const data: ApiResponse = await res.json();
        setTimeout(() => {
          setIsTyping(false);
          addBotMessage(data.reply, data.suggestions, data.link);
        }, 800);
      } catch {
        setIsTyping(false);
        addBotMessage(FALLBACK_WELCOME_BY_LANGUAGE[language], FALLBACK_SUGGESTIONS_BY_LANGUAGE[language]);
      }
    },
    [addBotMessage, language, welcomeLoaded]
  );

  useEffect(() => {
    if (isOpen) void loadWelcome();
  }, [isOpen, loadWelcome]);

  useEffect(() => {
    if (isOpen || messages.length > 0) return;
    const timer = setTimeout(() => setHasUnread(true), 3000);
    return () => clearTimeout(timer);
  }, [isOpen, messages.length]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    addUserMessage(trimmed);
    setInput("");
    setIsTyping(true);

    try {
      const context = getCurrentContext();
      const res = await fetch(`${CHATBOT_URL}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language,
          ...(context ? { context } : {}),
        }),
      });
      if (!res.ok) throw new Error("Unable to send message");
      const data: ApiResponse = await res.json();
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(data.reply, data.suggestions, data.link);
      }, 700 + Math.random() * 400);
    } catch {
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(FALLBACK_ERROR_BY_LANGUAGE[language], FALLBACK_SUGGESTIONS_BY_LANGUAGE[language]);
      }, 600);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setInput("");
    setWelcomeLoaded(false);
    setIsTyping(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(storageKey);
    }
    if (isOpen) {
      void loadWelcome(true);
    }
  };

  const handleSuggestion = (suggestion: string, fallbackLink?: string) => {
    const needsFallbackLink =
      suggestion.includes("Filtrer par ville") ||
      suggestion.includes("التصفية حسب المدينة") ||
      suggestion.includes("Voir les prix") ||
      suggestion.includes("Voir les tarifs") ||
      suggestion.includes("عرض الأسعار");
    const path =
      SUGGESTION_PATHS[suggestion] ??
      (needsFallbackLink ? fallbackLink : undefined);

    if (path) {
      addUserMessage(suggestion);
      navigateToPath(path);
      return;
    }

    void sendMessage(suggestion);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString(language === "ar" ? "ar-DZ" : "fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <button
        id="chatbot-toggle"
        aria-label={uiCopy.openAria}
        onClick={() => setIsOpen((value) => !value)}
        className="chatbot-fab"
      >
        {isOpen ? <ChevronDown className="chatbot-fab-icon" /> : <MessageCircle className="chatbot-fab-icon" />}
        {hasUnread && !isOpen && <span className="chatbot-fab-badge" />}
      </button>

      <div
        className={`chatbot-window${isOpen ? " chatbot-window--open" : ""}`}
        role="dialog"
        aria-label={uiCopy.dialogAria}
      >
        <div className="chatbot-header">
          <div className="chatbot-header-avatar">
            <Bot size={20} />
          </div>
          <div className="chatbot-header-info">
            <span className="chatbot-header-name">Assistant TouriGo</span>
            <span className="chatbot-header-status">
              <span className="chatbot-status-dot" />
              {uiCopy.online}
            </span>
          </div>
          <button
            aria-label={uiCopy.newChatAria}
            onClick={resetConversation}
            className="chatbot-reset-btn"
          >
            <RotateCcw size={15} />
          </button>
          <button
            aria-label={uiCopy.closeAria}
            onClick={() => setIsOpen(false)}
            className="chatbot-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chatbot-messages" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div key={msg.id} className={`chatbot-msg-row chatbot-msg-row--${msg.role}`}>
              {msg.role === "bot" && (
                <div className="chatbot-msg-avatar chatbot-msg-avatar--bot">
                  <Bot size={14} />
                </div>
              )}

              <div className="chatbot-msg-wrap">
                <div className={`chatbot-bubble chatbot-bubble--${msg.role}`}>
                  {msg.text.split("\n").map((line, index, lines) => (
                    <span key={index}>
                      {line}
                      {index < lines.length - 1 && <br />}
                    </span>
                  ))}
                </div>

                <span className="chatbot-timestamp">{formatTime(msg.timestamp)}</span>

                {msg.role === "bot" && msg.link && (
                  <button onClick={() => navigateToPath(msg.link ?? "")} className="chatbot-link-btn">
                    {getLinkLabel(msg.link, language)}
                    <ArrowUpRight size={13} />
                  </button>
                )}

                {msg.role === "bot" && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="chatbot-suggestions">
                    {msg.suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestion(suggestion, msg.link)}
                        className="chatbot-suggestion-btn"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === "user" && (
                <div className="chatbot-msg-avatar chatbot-msg-avatar--user">
                  <User size={14} />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="chatbot-msg-row chatbot-msg-row--bot">
              <div className="chatbot-msg-avatar chatbot-msg-avatar--bot">
                <Bot size={14} />
              </div>
              <div className="chatbot-bubble chatbot-bubble--bot chatbot-typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          className="chatbot-input-area"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage(input);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={uiCopy.inputPlaceholder}
            className="chatbot-input"
            aria-label={uiCopy.inputAria}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="chatbot-send-btn"
            aria-label={uiCopy.sendAria}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </>
  );
}
