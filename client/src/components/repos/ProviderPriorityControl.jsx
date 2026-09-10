import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { api, ENDPOINTS } from "@/lib/api";
import { useAuth } from "../../context/auth-context";
import { ThinkingOrb } from "@/components/ui/thinking-orb";

const DEFAULT_PRIORITY = ["gemini", "sarvam"];

// Small logo shown before the provider name; falls back to the first letter if
// the remote image fails to load.
const ProviderLogo = ({ provider }) => {
  const [broken, setBroken] = useState(false);

  if (broken || !provider?.logo) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-[11px] font-black text-white">
        {(provider?.name || provider?.providerId || "?")
          .charAt(0)
          .toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={provider.logo}
      alt={`${provider.name} logo`}
      className="h-6 w-6 shrink-0 rounded-md object-contain"
      onError={() => setBroken(true)}
    />
  );
};

const ProviderPriorityControl = () => {
  const { user, setUser } = useAuth();
  const [providers, setProviders] = useState([]);
  const [order, setOrder] = useState(DEFAULT_PRIORITY);
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef(null);

  const [orderBaseline, setOrderBaseline] = useState(DEFAULT_PRIORITY);

  const persistedOrder = useMemo(
    () =>
      user?.llmProviderPriority?.length
        ? user.llmProviderPriority
        : DEFAULT_PRIORITY,
    [user?.llmProviderPriority],
  );

  // Reset the editable order whenever the persisted value changes (first load,
  // or a save) — the render-time adjustment React recommends over an effect
  // that only mirrors state.
  if (JSON.stringify(persistedOrder) !== JSON.stringify(orderBaseline)) {
    setOrderBaseline(persistedOrder);
    setOrder(persistedOrder);
  }

  // Load provider display metadata once.
  useEffect(() => {
    let cancelled = false;
    api
      .get(ENDPOINTS.LLM_PROVIDERS)
      .then(({ data }) => {
        if (!cancelled) setProviders(data.providers || []);
      })
      .catch(() => {
        if (!cancelled) setProviders([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close the popover on an outside click.
  useEffect(() => {
    if (!open) return;
    const onClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const metaFor = (id) =>
    providers.find((p) => p.providerId === id) || { providerId: id, name: id };

  const isDirty = JSON.stringify(order) !== JSON.stringify(persistedOrder);

  const move = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const save = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.patch(ENDPOINTS.LLM_PROVIDER_PRIORITY, {
        llmProviderPriority: order,
      });
      setUser(data.user);
      setOrder(data.llmProviderPriority);
      toast.success("AI provider priority updated");
      setOpen(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update provider priority. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="rounded-tile flex w-full items-center gap-2 border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-100 sm:w-auto"
      >
        <Layers size={16} className="text-slate-400" />
        <span className="hidden sm:inline">AI Priority</span>
        <span className="flex items-center -space-x-1.5">
          {order.map((id) => (
            <span
              key={id}
              className="rounded-md border border-white bg-white shadow-sm"
            >
              <ProviderLogo provider={metaFor(id)} />
            </span>
          ))}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="rounded-panel shadow-overlay absolute right-0 z-30 mt-2 w-72 border border-slate-200 bg-white p-4"
          >
            <p className="mb-1 font-mono text-[10px] font-black tracking-[0.22em] text-slate-400 uppercase">
              AI Provider Priority
            </p>
            <p className="mb-3 text-xs text-slate-500">
              README generation tries these in order — first is primary, the
              rest are fallbacks.
            </p>

            <ol className="space-y-2">
              {order.map((id, index) => {
                const provider = metaFor(id);
                return (
                  <li
                    key={id}
                    className="rounded-tile flex items-center justify-between gap-3 border border-slate-200 bg-slate-50/80 p-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-2.5">
                      <ProviderLogo provider={provider} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {provider.name}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                          {index === 0 ? "Primary" : `Fallback ${index}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${provider.name} up`}
                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === order.length - 1}
                        aria-label={`Move ${provider.name} down`}
                        className="rounded-md border border-slate-200 bg-white p-1 text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={save}
              disabled={!isDirty || isSaving}
              className={`rounded-control mt-3 flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                isDirty && !isSaving
                  ? "bg-primary cursor-pointer text-white hover:bg-blue-800"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              }`}
            >
              {isSaving ? (
                <>
                  <ThinkingOrb
                    preset="working"
                    showLabel={false}
                    tone="ghost"
                    size="sm"
                    className="h-auto p-0 text-current [--orb-size:1rem]"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                "Save priority"
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProviderPriorityControl;
