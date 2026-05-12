export default function MarqueeBanner() {
  const items = [
    'Summer Research Season',
    'Save 10% with code: SUMMER10',
    'Free COA with every order',
    'Lab-tested & verified',
    'Fast discreet shipping',
    '99%+ purity guaranteed',
    'Research-grade compounds',
    'Summer Research Season',
    'Save 10% with code: SUMMER10',
    'Free COA with every order',
    'Lab-tested & verified',
    'Fast discreet shipping',
    '99%+ purity guaranteed',
    'Research-grade compounds',
  ];

  return (
    <div className="marquee-banner">
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i}>{item} &bull;</span>
        ))}
      </div>
    </div>
  );
}
