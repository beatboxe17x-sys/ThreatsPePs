// Affiliate applications webhook — sends to a separate Discord channel
const AFFILIATE_WEBHOOK = 'https://discord.com/api/webhooks/1503870243422867597/q9g2wG2C0GQoU_HbE5-XX0Ed2aMXpck6imbtx5M54ocJeVyE24YOZ1xA4HxhYUovSW_Z';

export async function submitAffiliateApplication(data: {
  name: string;
  email: string;
  phone: string;
  socialPlatform: string;
  socialHandle: string;
  followerCount: string;
  why: string;
  website?: string;
}) {
  const fields = [
    { name: 'Name', value: data.name, inline: true },
    { name: 'Email', value: data.email, inline: true },
    { name: 'Phone', value: data.phone, inline: true },
    { name: 'Platform', value: data.socialPlatform, inline: true },
    { name: 'Handle', value: data.socialHandle, inline: true },
    { name: 'Followers', value: data.followerCount, inline: true },
    { name: 'Website', value: data.website || 'N/A', inline: false },
    { name: 'Why Affiliate', value: data.why.substring(0, 1000), inline: false },
  ];

  try {
    const res = await fetch(AFFILIATE_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '\uD83E\uDD1D New Affiliate Application',
          description: `Application from **${data.name}** to join the NG Research affiliate program.`,
          color: 0x8b5cf6,
          fields,
          footer: { text: 'NG Research Affiliate Program' },
          timestamp: new Date().toISOString(),
        }],
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
