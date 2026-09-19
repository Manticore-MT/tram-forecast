import React from "react";
import { Button, Card, Badge, Tag, Icon, Timeline, Accordion } from "../../components";
import logoMttech from "../../assets/logo-mttech-white.svg";
import logoTim from "../../assets/logo-tim-white.svg";
import { siteShell, SectionHead } from "./Sections";

export interface Track {
  n: string;
  title: string;
  lead: string;
  tags: string[];
  featured?: boolean;
}

export const TRACKS: Track[] = [
  { n: "01", title: "Резервная одометрия по модели", lead: "Оценка пройденного пути беспилотного трамвая без показаний датчиков.", tags: ["ML", "Sensor fusion", "C++/Python"] },
  { n: "02", title: "ИИ-прогноз загрузки трамвайных маршрутов", lead: "Краткосрочные, среднесрочные и долгосрочные прогнозы пассажиропотока с привязкой к геопозиции и времени.", tags: ["Time series", "Spring Boot", "React + карты"], featured: true },
  { n: "03", title: "Предиктор изменений в графике движения городского транспорта", lead: "Предсказание отклонений от расписания и их причин.", tags: ["ML", "Data Engineering"] },
  { n: "04", title: "Геймификация для ВСМ", lead: "Сценарии вовлечения пассажиров высокоскоростной магистрали.", tags: ["Product", "Frontend"] },
];

export function Tracks() {
  const [open, setOpen] = React.useState(1);
  return (
    <section id="task" style={{ padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="Задачи" lead="Выбирайте один трек и создавайте решение для движения мегаполиса" />
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {TRACKS.map((t, i) => {
            const on = i === open;
            return (
              <Card key={t.n} tone={on ? "raised" : "surface"} padding="var(--space-6) var(--space-8)" style={{ cursor: "pointer" }} onClick={() => setOpen(on ? -1 : i)}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-6)" }}>
                  <span style={{ font: "var(--type-metric)", color: on ? "var(--text-accent)" : "var(--text-muted)" }}>{t.n}</span>
                  <span style={{ flex: 1, font: "var(--type-h2)", letterSpacing: "var(--tracking-tight)" }}>{t.title}</span>
                  {t.featured && <Badge tone="accent">Трек Manticore</Badge>}
                  <span aria-hidden="true" style={{ width: 12, height: 12, borderRight: "2px solid var(--text-muted)", borderBottom: "2px solid var(--text-muted)", transform: on ? "rotate(-135deg)" : "rotate(45deg)", transition: "transform var(--dur-base) var(--ease-standard)" }} />
                </div>
                {on && (
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-8)", marginTop: "var(--space-6)", paddingLeft: 76 }}>
                    <p style={{ margin: 0, flex: 1, font: "var(--type-body)", color: "var(--text-secondary)", maxWidth: 640 }}>{t.lead}</p>
                    <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>{t.tags.map((x) => <Tag key={x}>{x}</Tag>)}</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export interface PrizesProps {
  onRegister: () => void;
}

export function Prizes({ onRegister }: PrizesProps) {
  const places: [string, string][] = [["1 место", "500 000 ₽"], ["2 место", "300 000 ₽"], ["3 место", "200 000 ₽"]];
  return (
    <section id="prize" style={{ background: "var(--bg-surface)", padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="Призовой фонд" />
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "var(--space-6)", alignItems: "stretch" }}>
          <Card tone="accent" pin padding="var(--space-10)" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="mt-eyebrow" style={{ color: "rgba(255,255,255,.75)" }}>Общий призовой фонд</div>
            <div style={{ font: "var(--type-metric-xl)", letterSpacing: "var(--tracking-display)" }}>4 000 000 ₽</div>
            <Button variant="inverse" onClick={onRegister} style={{ alignSelf: "flex-start" }}>Принять участие</Button>
          </Card>
          <Card tone="raised" padding="var(--space-8)">
            <div className="mt-eyebrow">В каждом треке</div>
            <div style={{ marginTop: "var(--space-6)", display: "flex", flexDirection: "column" }}>
              {places.map(([p, v], i) => (
                <div key={p} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "var(--space-5) 0", boxShadow: i < 2 ? "inset 0 -1px 0 var(--border-subtle)" : "none" }}>
                  <span style={{ font: "var(--type-h3)", color: "var(--text-secondary)" }}>{p}</span>
                  <span style={{ font: "var(--type-metric)" }}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

export function Schedule() {
  const items = [
    { date: "25 сентября", title: "Открытие хакатона (офлайн с трансляцией)", done: true },
    { date: "27 сентября", title: "Дедлайн по загрузке решений", done: true },
    { date: "29 сентября", title: "Публикация списка команд-полуфиналистов" },
    { date: "30 сентября", title: "Полуфинал. Закрытые онлайн-питчи" },
    { date: "1 октября", title: "Публикация списка команд-финалистов" },
    { date: "3 октября", title: "Финал хакатона (офлайн с трансляцией)" },
  ];
  return (
    <section style={{ padding: "var(--space-24) 0" }}>
      <div style={{ ...siteShell.wrap, display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: "var(--space-16)" }}>
        <SectionHead title="Таймлайн" lead="Девять дней от открытия до финала" />
        <Timeline items={items} />
      </div>
    </section>
  );
}

export function Faq() {
  const items = [
    { question: "Как будет проходить хакатон?", answer: "Онлайн-этап с 25 по 29 сентября, закрытые полуфинальные питчи 30 сентября и очный финал в Москве 3 октября с трансляцией." },
    { question: "Сколько человек должно быть в команде?", answer: "От 3 до 5 человек. Рекомендуемый состав для ML-трека: 1–2 ML-инженера, backend, frontend и аналитик." },
    { question: "У меня нет команды, как мне найти сокомандников?", answer: "Вступайте в чат хакатона в Telegram — там участники собирают команды по трекам." },
    { question: "Кто может участвовать в хакатоне?", answer: "Разработчики, аналитики, дата-сайентисты и продакт-менеджеры от 18 лет." },
    { question: "Как будет устроена коммуникация с участниками?", answer: "Все объявления дублируются в Telegram-чате и на почту капитана команды." },
    { question: "Как я могу связаться с организаторами?", answer: "Напишите на ask@pgenesis.ru или в чат хакатона." },
  ];
  return (
    <section id="faq" style={{ background: "var(--bg-surface)", padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="Ответы на вопросы" />
        <Accordion defaultOpen={1} items={items} />
      </div>
    </section>
  );
}

const EXPERTS: [string, string][] = [
  ["Жанна Ермолина", "Генеральный директор МТТЕХ"],
  ["Маргарита Колосова", "Генеральный директор ООО «ВСМ-400»"],
  ["Анна Скобкина", "Руководитель Центра транспортных решений МТТЕХ"],
  ["Николай Кудашов", "Руководитель Центра наземного транспорта МТТЕХ"],
  ["Павел Бокша", "Руководитель Центра беспилотного транспорта МТТЕХ"],
  ["Гусейн Римиханов", "Руководитель Центра прикладных сервисов МТТЕХ"],
  ["Александр Цыпляев", "Заместитель генерального директора ООО «ВСМ-400» по обслуживанию пассажиров"],
  ["Сергей Марченко", "Заместитель руководителя дирекции клиентского сервиса и маркетинга «ВСМ-400»"],
];

export function Experts() {
  return (
    <section style={{ padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="Эксперты" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--space-4)" }}>
          {EXPERTS.map(([n, r]) => (
            <Card key={n} tone="surface" padding="var(--space-5)">
              <div style={{ height: 132, borderRadius: "var(--radius-md)", background: "var(--ink-600)", boxShadow: "var(--inset-hairline)", display: "grid", placeItems: "center", color: "var(--slate-400)", font: "var(--type-caption)", marginBottom: "var(--space-4)" }}>портрет не предоставлен</div>
              <div style={{ font: "var(--type-h4)" }}>{n}</div>
              <div style={{ marginTop: 6, font: "var(--type-body-s)", color: "var(--text-muted)" }}>{r}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Organizers() {
  return (
    <section style={{ background: "var(--bg-surface)", padding: "var(--space-24) 0" }}>
      <div style={siteShell.wrap}>
        <SectionHead title="Организаторы" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
          <Card tone="raised" padding="var(--space-8)">
            <img src={logoMttech} alt="МТТЕХ" style={{ height: 34, marginBottom: "var(--space-6)" }} />
            <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>МТТЕХ — центр разработки Московского транспорта, создающий ИТ-решения, которыми ежедневно пользуются миллионы пассажиров: от оплаты и планирования маршрутов до беспилотного трамвая.</p>
          </Card>
          <Card tone="raised" padding="var(--space-8)">
            <img src={logoTim} alt="Транспортные Инновации Москвы" style={{ height: 44, marginBottom: "var(--space-5)" }} />
            <p style={{ margin: 0, font: "var(--type-body-s)", color: "var(--text-secondary)" }}>Фонд «Транспортные инновации Москвы» помогает интегрировать технологические решения в транспортный комплекс Москвы, поддерживает перспективные компании и сопровождает проекты от заявки до пилотирования, внедрения и масштабирования.</p>
          </Card>
        </div>
      </div>
    </section>
  );
}

export interface SiteFooterProps {
  onRegister: () => void;
}

export function SiteFooter({ onRegister }: SiteFooterProps) {
  return (
    <footer id="reg" style={{ padding: "var(--space-20) 0 var(--space-12)", boxShadow: "inset 0 1px 0 var(--border-subtle)" }}>
      <div style={siteShell.wrap}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-8)", flexWrap: "wrap", marginBottom: "var(--space-16)" }}>
          <div>
            <div style={{ font: "var(--type-display-m)", letterSpacing: "var(--tracking-display)" }}>Принять участие</div>
            <div style={{ marginTop: "var(--space-3)", font: "var(--type-body-s)", color: "var(--text-muted)" }}>Приём заявок до 22 сентября</div>
          </div>
          <Button size="lg" onClick={onRegister} iconRight={<Icon name="arrow-right" size={18} />}>Подать заявку</Button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-8)", font: "var(--type-body-s)", color: "var(--text-muted)" }}>
          <div>
            <div className="mt-eyebrow" style={{ marginBottom: "var(--space-4)" }}>Контакты</div>
            <div><a href="mailto:ask@pgenesis.ru">ask@pgenesis.ru</a></div>
            <div style={{ marginTop: 6 }}><a href="#faq">Чат в Telegram</a></div>
          </div>
          <div>
            <div className="mt-eyebrow" style={{ marginBottom: "var(--space-4)" }}>Документы</div>
            <div><a href="#faq">Положение хакатона</a></div>
            <div style={{ marginTop: 6 }}><a href="#faq">Политика обработки персональных данных</a></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div>Хакатон Московского транспорта © 2026</div>
            <div style={{ marginTop: 6, fontFamily: "var(--font-mono)" }}>25.09 — 03.10 · Онлайн + Москва</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
