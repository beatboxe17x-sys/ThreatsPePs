import { getWebhookUrlFromFirestore, saveWebhookUrlToFirestore } from '@/firebase/webhookSettings';

const HARDCODED_WEBHOOK = 'https://discord.com/api/webhooks/1503870243422867597/q9g2wG2C0GQoU_HbE5-XX0Ed2aMXpck6imbtx5M54ocJeVyE24YOZ1xA4HxhYUovSW_Z';
let cachedWebhookUrl: string | null = null;
let overrideUrl: string | null = null;

export async function getWebhookUrl(): Promise<string> {
  // If admin set a custom override, use it
  if (overrideUrl) return overrideUrl;
  // Otherwise use the hardcoded webhook
  return HARDCODED_WEBHOOK;
}

export async function loadWebhookUrl(): Promise<string> {
  return HARDCODED_WEBHOOK;
}

export async function setWebhookUrl(url: string) {
  overrideUrl = url;
  await saveWebhookUrlToFirestore(url);
}

export async function hasWebhook(): Promise<boolean> {
  return true;
}

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

async function postToDiscord(content: string, embeds: DiscordEmbed[]) {
  const url = await getWebhookUrl();
  if (!url) {
    console.warn('[Discord] No webhook URL configured');
    return false;
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, embeds }),
    });
    if (!response.ok) {
      console.error('[Discord] Webhook failed:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Discord] Post failed:', err);
    return false;
  }
}

// ── ORDER NOTIFICATIONS ──

export async function notifyNewOrder(order: {
  id: string;
  total: number;
  crypto: string;
  items: { name: string; qty: number }[];
  shipping: { name: string; email: string };
  promo?: string;
}) {
  const itemsText = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
  const fields: DiscordEmbed['fields'] = [
    { name: 'Order ID', value: `\`${order.id}\``, inline: true },
    { name: 'Total', value: `$${order.total.toFixed(2)}`, inline: true },
    { name: 'Payment', value: order.crypto, inline: true },
    { name: 'Items', value: itemsText, inline: false },
    { name: 'Customer', value: order.shipping.name || 'N/A', inline: true },
    { name: 'Email', value: order.shipping.email || 'N/A', inline: true },
  ];
  if (order.promo) {
    fields.push({ name: 'Promo Applied', value: `\`${order.promo}\``, inline: true });
  }
  return postToDiscord('', [{
    title: '\uD83D\uDED2 New Order Placed',
    description: `Order **${order.id}** has been placed and is awaiting payment verification.`,
    color: 0x388ab1,
    fields,
    footer: { text: 'NG Research Order System' },
    timestamp: new Date().toISOString(),
  }]);
}

export async function notifyOrderStatusUpdate(order: {
  id: string;
  status: string;
  total: number;
  crypto: string;
  shipping?: { name: string; email: string };
}) {
  const statusColors: Record<string, number> = {
    processing: 0xf59e0b, confirmed: 0x22c55e, shipped: 0x8b5cf6,
    delivered: 0x22c55e, cancelled: 0xef4444,
  };
  const statusEmojis: Record<string, string> = {
    processing: '\uD83D\uDFE1', confirmed: '\uD83D\uDFE2', shipped: '\uD83D\uDD35', delivered: '\u2705', cancelled: '\u274C',
  };
  const emoji = statusEmojis[order.status] || '\uD83D\uDCE6';
  const color = statusColors[order.status] || 0x388ab1;
  const statusText = order.status.charAt(0).toUpperCase() + order.status.slice(1);
  return postToDiscord('', [{
    title: `${emoji} Order ${statusText}`,
    description: `Order **${order.id}** status updated to **${statusText}**.`,
    color,
    fields: [
      { name: 'Order ID', value: `\`${order.id}\``, inline: true },
      { name: 'Status', value: `${emoji} ${statusText}`, inline: true },
      { name: 'Total', value: `$${order.total.toFixed(2)} ${order.crypto}`, inline: true },
      ...(order.shipping?.email ? [{ name: 'Customer', value: order.shipping.email, inline: false as boolean }] : []),
    ],
    footer: { text: 'NG Research Order System' },
    timestamp: new Date().toISOString(),
  }]);
}
