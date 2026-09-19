const { Button, Card, Badge, Tag, Icon, IconButton, Stat, Timeline, Accordion, Tabs } = window.DesignSystem_8e46b6;

const siteShell = {
  wrap: { maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--gutter)" },
};

function Nav() {
  const links = [["#about", "О хакатоне"], ["#task", "Задачи"], ["#prize", "Призы"], ["#faq", "Ответы на вопросы"]];
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(14,17,19,.78)", backdropFilter: "var(--blur-glass)", boxShadow: "inset 0 -1px 0 var(--border-subtle)" }}>
      <div style={{ ...siteShell.wrap, display: "flex", alignItems: "center", gap: "var(--space-8)", height: 76 }}>
        <img src="../../assets/logo-mttech-white.svg" alt="МТТЕХ" style={{ height: 30 }} />
        <nav style={{ display: "flex", gap: "var(--space-6)", marginLeft: "auto" }}>
          {links.map(([h, l]) => <a key={h} href={h} style={{ font: "var(--type-ui-s)", color: "var(--text-secondary)", textDecoration: "none" }}>{l}</a>)}
        </nav>
        <Button size="sm" as="a" href="#reg">Принять участие</Button>
      </div>
    </header>
  );
}

function Hero({ onRegister }) {
  return (
    <section style={{ position: "relative", overflow: "hidden", padding: "var(--space-24) 0 var(--space-20)" }}>
      <img src="../../assets/mark-pin-white.svg" alt="" style={{ position: "absolute", right: -60, top: -40, height: 560, opacity: 0.05, pointerEvents: "none" }} />
      <div style={{ ...siteShell.wrap, position: "relative" }}>
        <div style={{ display: "flex", gap: "var(--space-12)", marginBottom: "var(--space-10)" }}>
          <Stat label="Даты проведения" value="25.09 — 03.10" />
          <Stat label="Призовой фонд" value="4 000 000" unit="₽" />
        </div>
        <h1 style={{ margin: 0, font: "var(--type-display-xl)", letterSpacing: "var(--tracking-display)", maxWidth: 980 }}>
          Хакатон Московского<br />транспорта
        </h1>
        <p style={{ margin: "var(--space-6) 0 var(--space-10)", font: "var(--type-body-l)", color: "var(--text-secondary)", maxWidth: 560 }}>
          Решайте реальные задачи для движения мегаполиса
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-5)", flexWrap: "wrap" }}>
          <Button size="lg" onClick={onRegister} iconRight={<Icon name="arrow-right" size={18} />}>Принять участие</Button>
          <span style={{ font: "var(--type-body-s)", color: "var(--text-muted)" }}>Приём заявок до 22 сентября</span>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, lead, id }) {
  return (
    <div style={{ marginBottom: "var(--space-12)" }} id={id}>
      {eyebrow && <div className="mt-eyebrow" style={{ marginBottom: "var(--space-4)" }}>{eyebrow}</div>}
      <h2 style={{ margin: 0, font: "var(--type-display-m)", letterSpacing: "var(--tracking-display)" }}>{title}</h2>
      {lead && <p style={{ margin: "var(--space-4) 0 0", font: "var(--type-body-l)", color: "var(--text-secondary)", maxWidth: 620 }}>{lead}</p>}
    </div>
  );
}

function About() {
  const facts = [["Даты", "25 сентября — 3 октября"], ["Формат", "Онлайн с финалом в Москве"], ["Задачи", "4 трека"], ["Команда", "От 3 до 5 человек"], ["Призовой фонд", "4 000 000 ₽"]];
  const why = [
    ["route", "Решайте задачи мегаполиса", "Создавайте решения, которыми смогут пользоваться миллионы людей"],
    ["users", "Попади в команду Московского транспорта", "Получите возможность попасть в ИТ-команду, которая приводит целый город в движение"],
    ["messages-square", "Развивайтесь вместе с экспертами", "Получайте обратную связь и усиливайте своё решение"],
    ["send", "Найдите своих в ИТ", "Вступайте в чат хакатона и знакомьтесь с другими участниками"],
    ["trophy", "Призовой фонд 4 000 000 ₽ и фирменный мерч", "Выйдите в финал и получите шанс выиграть денежный приз"],
  ];
  return (
    <section id="about" style={{ background: "var(--bg-surface)", padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="О хакатоне" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "var(--space-4)", marginBottom: "var(--space-16)" }}>
          {facts.map(([l, v]) => <Card key={l} tone="raised"><div className="mt-eyebrow">{l}</div><div style={{ marginTop: "var(--space-3)", font: "var(--type-h4)" }}>{v}</div></Card>)}
        </div>
        <SectionHead title="Зачем участвовать?" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "var(--space-4)" }}>
          {why.map(([ic, t, d], i) => (
            <Card key={t} tone={i === 4 ? "accent" : "raised"} interactive pin={i === 4} style={{ gridColumn: i === 4 ? "span 2" : "span 1", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              <Icon name={ic} size={24} />
              <div style={{ font: "var(--type-h3)", letterSpacing: "var(--tracking-tight)" }}>{t}</div>
              <div style={{ font: "var(--type-body-s)", color: i === 4 ? "rgba(255,255,255,.82)" : "var(--text-secondary)" }}>{d}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { siteShell, Nav, Hero, SectionHead, About });
