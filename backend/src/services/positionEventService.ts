import { prisma } from '../lib/prisma';

interface RealWorldUpdate {
  subjectId: string;
  subjectName: string;
  eventType: 'form_drop' | 'form_rise' | 'injury' | 'transfer' | 'suspension' | 'milestone';
  description: string;
  oddsImpact: number;
  severity: 'positive' | 'negative' | 'neutral';
}

export async function generatePositionEvents(update: RealWorldUpdate): Promise<void> {
  const affectedPositions = await prisma.position.findMany({
    where: {
      subjectId: update.subjectId,
      status: 'open',
    },
    include: { director: { include: { user: true } }, insurance: true },
  });

  for (const pos of affectedPositions) {
    const valueImpact = Math.round(pos.currentValue * Math.abs(update.oddsImpact) * 0.1);
    const isNegativeForHolder = (update.severity === 'negative' && !pos.isCounter) || (update.severity === 'positive' && pos.isCounter);

    await prisma.positionEvent.create({
      data: {
        positionId: pos.id,
        eventType: update.eventType,
        description: update.description,
        oddsImpact: update.oddsImpact,
        valueImpact: isNegativeForHolder ? -valueImpact : valueImpact,
        severity: isNegativeForHolder ? 'negative' : 'positive',
      },
    });

    // Update position current value
    const newValue = Math.max(0, pos.currentValue + (isNegativeForHolder ? -valueImpact : valueImpact));
    await prisma.position.update({ where: { id: pos.id }, data: { currentValue: newValue } });

    // Check insurance trigger for extreme negative events
    if (isNegativeForHolder && pos.hasInsurance && pos.insurance && !pos.insurance.isTriggered) {
      const dropPct = valueImpact / Math.max(1, pos.currentValue);
      if (dropPct > 0.3 || update.eventType === 'injury' || update.eventType === 'suspension') {
        await triggerInsurance(pos.id, update.description);
      }
    }

    // Send intelligence alert to users who paid for trend alerts
    await prisma.intelligenceAlert.create({
      data: {
        userId: pos.director.user.id,
        positionId: pos.id,
        alertType: update.eventType,
        message: `${update.description} — value impact: ${isNegativeForHolder ? '-' : '+'}⚡ ${valueImpact}`,
        isRead: false,
      },
    });
  }
}

export async function triggerInsurance(positionId: string, reason: string): Promise<void> {
  const pos = await prisma.position.findUniqueOrThrow({
    where: { id: positionId },
    include: { director: { include: { user: true } }, insurance: true },
  });

  if (!pos.insurance || pos.insurance.isTriggered) return;

  const refund = pos.coinsStaked - pos.insurance.coinsCost;
  const { addCoins } = await import('./coinService');
  await addCoins(pos.director.user.id, refund, 'director_position_win', `Insurance triggered: ${pos.claim}`, positionId);

  await prisma.positionInsurance.update({
    where: { id: pos.insurance.id },
    data: { isTriggered: true, triggeredAt: new Date(), reason, coinsReturned: refund },
  });

  await prisma.position.update({ where: { id: positionId }, data: { status: 'void' } });

  await prisma.notification.create({
    data: {
      userId: pos.director.user.id,
      type: 'director_insurance',
      title: '✅ Position Insurance Triggered',
      body: `${pos.claim} — ⚡ ${refund} refunded (stake minus insurance cost)`,
      link: '/director',
      isRead: false,
    },
  });
}
