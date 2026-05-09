export type Plan = { planId: string; amount: number };

export async function getPlans(): Promise<{
  monthly: Plan | null;
  yearly: Plan | null;
}> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/payments/plans`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error("plans fetch failed");
    const data = (await res.json()) as { plans: Plan[] };
    return {
      monthly: data.plans.find((p) => p.planId === "pro_monthly") ?? null,
      yearly: data.plans.find((p) => p.planId === "pro_yearly") ?? null,
    };
  } catch {
    return { monthly: null, yearly: null };
  }
}
