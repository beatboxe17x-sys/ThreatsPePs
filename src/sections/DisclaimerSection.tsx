export default function DisclaimerSection() {
  return (
    <section style={{ background: 'var(--bg-light)', padding: '24px var(--container-pad) 32px' }}>
      <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <strong>DISCLAIMER</strong>
          <br /><br />
          Please note that all products featured on this website are intended exclusively for research and development purposes. They are not designed for any form of human consumption. The claims made on this website have not undergone evaluation by the U.S. Food and Drug Administration. Neither the statements nor the products of this company aim to diagnose, treat, cure, or ward off any disease. Threats is a chemical supplier. Threats is not a compounding pharmacy or chemical compounding facility as defined under 503A of the Federal Food, Drug, and Cosmetic act. Threats is not an outsourcing facility as defined under 503B of the Federal Food, Drug, and Cosmetic act.
        </p>
      </div>
    </section>
  );
}
