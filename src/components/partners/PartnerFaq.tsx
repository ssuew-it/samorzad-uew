import type { QA } from "@/components/Faq";
import { ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";
import styles from "./PartnerFaq.module.css";

export function PartnerFaq({ items, locale }: { items: QA[]; locale: string }) {
  const c = locale === "en"
    ? { heading: "Before we start.", lead: "A few answers to make the first step easier.", contact: "Have another question?", action: "Let’s talk" }
    : { heading: "Zanim zaczniemy.", lead: "Kilka odpowiedzi, które ułatwią pierwszy krok.", contact: "Masz inne pytanie?", action: "Porozmawiajmy" };
  const schema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: items.map(item => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };
  return (
    <section id="pytania-partnerzy" className={styles.section} aria-labelledby="partners-faq-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
      <div className={styles.inner}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>FAQ / {String(items.length).padStart(2, "0")}</p>
          <h2 id="partners-faq-heading">{c.heading}</h2>
          <p className={styles.lead}>{c.lead}</p>
          <div className={styles.contact}><p>{c.contact}</p><a href="#kontakt-partnerzy">{c.action}<ArrowUpRight size={20} aria-hidden="true" /></a></div>
        </header>
        <div className={styles.questions}>
          {items.map((item, i) => (
            <details key={item.q} name="partner-faq" className={styles.item}>
              <summary><span className={styles.number} aria-hidden="true">0{i + 1}</span><span>{item.q}</span><span className={styles.toggle}><Plus size={20} aria-hidden="true" /></span></summary>
              <div className={styles.answer}><p>{item.a}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
