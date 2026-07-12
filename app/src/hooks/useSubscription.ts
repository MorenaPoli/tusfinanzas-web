import { trpc } from '@/providers/trpc';

export function useSubscription() {
  const { data, isLoading } = trpc.subscription.getMyPlan.useQuery();
  const { data: monthlyCount } = trpc.subscription.getMonthlyCount.useQuery();
  const utils = trpc.useUtils();

  const upgrade = trpc.subscription.upgradePlan.useMutation({
    onSuccess: () => {
      utils.subscription.getMyPlan.invalidate();
      utils.subscription.getMonthlyCount.invalidate();
    },
  });

  const plan = data?.plan || 'free';
  const isFree = plan === 'free';
  const isPro = plan === 'pro';
  const isFamily = plan === 'family';

  const txCount = monthlyCount?.count || 0;
  const txLimit = monthlyCount?.limit || 30;
  const txRemaining = Math.max(0, txLimit - txCount);
  const txPercent = Math.min(100, (txCount / txLimit) * 100);
  const nearLimit = txPercent >= 80;
  const atLimit = txPercent >= 100;

  return {
    plan,
    isFree,
    isPro,
    isFamily,
    isLoading,
    txCount,
    txLimit,
    txRemaining,
    txPercent,
    nearLimit,
    atLimit,
    upgrade,
  };
}
