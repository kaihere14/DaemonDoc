import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder } from "framer-motion";
import { toast } from "sonner";
import { ChevronDown, GripVertical, Layers } from "lucide-react";
import { api, ENDPOINTS } from "@/lib/api";
import { useAuth } from "../../context/auth-context";
import { ThinkingOrb } from "@/components/ui/thinking-orb";

const DEFAULT_PRIORITY = ["gemini", "sarvam"];

// Spring morph borrowed from the @beui/combobox popover, so the open/close
// motion here matches that component.
const POPOVER_MORPH = { type: "spring", duration: 0.5, bounce: 0.22 };

// Small logo shown before the provider name; falls back to the first letter if
// the remote image fails to load.
const ProviderLogo = ({ provider }) => {
  const [broken, setBroken] = useState(false);

  if (broken || !provider?.logo) {
    return (
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[11px] font-black text-white">
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
      className="h-6 w-6 shrink-0 rounded-full border border-slate-200 bg-white object-contain"
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
        <Layers size={16} className="shrink-0 text-slate-400" />
        <span>AI Priority</span>
        <span className="ml-auto flex items-center -space-x-1.5 sm:ml-0">
          {order.map((id) => (
            <span
              key={id}
              className="rounded-full border border-white bg-white shadow-sm"
            >
              <ProviderLogo provider={metaFor(id)} />
            </span>
          ))}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={POPOVER_MORPH}
            style={{ transformOrigin: "top" }}
            className="rounded-panel shadow-overlay absolute right-0 left-0 z-50 mt-2 w-auto border border-slate-200 bg-white p-4 sm:left-auto sm:w-72"
          >
            <p className="mb-1 font-mono text-[10px] font-black tracking-[0.22em] text-slate-400 uppercase">
              AI Provider Priority
            </p>
            <p className="mb-3 text-xs text-slate-500">
              Drag to rank — top is primary, the ones below are fallbacks in
              order.
            </p>

            <Reorder.Group
              axis="y"
              values={order}
              onReorder={setOrder}
              className="space-y-2"
            >
              {order.map((id, index) => {
                const provider = metaFor(id);
                return (
                  <Reorder.Item
                    key={id}
                    value={id}
                    className="rounded-tile flex cursor-grab items-center gap-3 border border-slate-200 bg-slate-50/80 p-2.5 active:cursor-grabbing"
                    whileDrag={{
                      scale: 1.03,
                      boxShadow: "0 12px 28px -12px rgba(15,23,42,0.35)",
                    }}
                    transition={POPOVER_MORPH}
                  >
                    <GripVertical
                      size={16}
                      className="shrink-0 text-slate-300"
                    />
                    <ProviderLogo provider={provider} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {provider.name}
                      </p>
                      <p className="truncate text-[11px] text-slate-400">
                        {index === 0 ? "Primary" : `Fallback ${index}`}
                      </p>
                    </div>
                  </Reorder.Item>
                );
              })}
            </Reorder.Group>

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
