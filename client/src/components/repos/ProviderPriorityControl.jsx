import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layers } from "lucide-react";
import { api, ENDPOINTS } from "@/lib/api";
import { useAuth } from "../../context/auth-context";
import {
  SortableDropdown,
  SortableDropdownAvatar,
} from "@/components/ui/sortable-dropdown";

const DEFAULT_PRIORITY = ["gemini", "sarvam"];

// Providers with a small context window. When one of these runs, the pipeline
// trims the repository context to fit before calling it; a larger-window
// fallback below it still receives the full context.
const LOW_CONTEXT_PROVIDERS = new Set(["sarvam"]);

const LowContextBadge = () => (
  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[9px] font-black tracking-wider text-amber-700 uppercase">
    <Layers size={9} strokeWidth={2.75} />
    Low context
  </span>
);

const ProviderPriorityControl = () => {
  const { user, setUser } = useAuth();
  const [providers, setProviders] = useState([]);

  const persistedOrder = useMemo(
    () =>
      user?.llmProviderPriority?.length
        ? user.llmProviderPriority
        : DEFAULT_PRIORITY,
    [user?.llmProviderPriority],
  );

  const [order, setOrder] = useState(persistedOrder);
  const [orderBaseline, setOrderBaseline] = useState(persistedOrder);

  // Reset the editable order whenever the persisted value changes (first load,
  // or a save) — the render-time adjustment React recommends over an effect
  // that only mirrors state.
  if (JSON.stringify(persistedOrder) !== JSON.stringify(orderBaseline)) {
    setOrderBaseline(persistedOrder);
    setOrder(persistedOrder);
  }

  // Load provider display metadata once.
  React.useEffect(() => {
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

  const metaFor = (id) =>
    providers.find((p) => p.providerId === id) || { providerId: id, name: id };

  const items = useMemo(() => {
    const ids = Array.from(
      new Set([...order, ...providers.map((p) => p.providerId)]),
    );
    return ids.map((id) => {
      const provider = metaFor(id);
      return {
        id,
        label: provider.name,
        icon: <SortableDropdownAvatar src={provider.logo} alt={provider.name} />,
        badge: LOW_CONTEXT_PROVIDERS.has(id) ? <LowContextBadge /> : null,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, providers]);

  const handleApply = async (nextOrder) => {
    try {
      const { data } = await api.patch(ENDPOINTS.LLM_PROVIDER_PRIORITY, {
        llmProviderPriority: nextOrder,
      });
      setUser(data.user);
      setOrder(data.llmProviderPriority);
      toast.success("AI provider priority updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update provider priority. Please try again.",
      );
      throw error;
    }
  };

  return (
    <SortableDropdown
      items={items}
      order={order}
      onOrderChange={setOrder}
      triggerIcon={<Layers size={16} className="shrink-0 text-muted-foreground" />}
      label="AI Priority"
      eyebrow="AI Provider Priority"
      description="Drag to rank — top is primary, the ones below are fallbacks in order."
      note={
        order.some((id) => LOW_CONTEXT_PROVIDERS.has(id)) ? (
          <span className="flex items-start gap-1.5">
            <Layers size={13} className="mt-px shrink-0" strokeWidth={2.5} />
            <span>
              <span className="font-bold uppercase">Low context</span> — small
              window, context trimmed to fit. A larger fallback below still
              gets it all.
            </span>
          </span>
        ) : undefined
      }
      onApply={handleApply}
      applyLabel="Save priority"
      applyLoadingLabel="Saving…"
      applySuccessLabel="Saved"
    />
  );
};

export default ProviderPriorityControl;
