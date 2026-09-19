const { Dialog, Button, Input, Select, Checkbox, Radio, Toast, Icon } = window.DesignSystem_8e46b6;

function RegisterDialog({ open, onClose, onDone }) {
  const [track, setTrack] = React.useState("02");
  const [agree, setAgree] = React.useState(false);
  return (
    <Dialog open={open} onClose={onClose} width={520} title="Заявка на хакатон" description="Приём заявок до 22 сентября. Команда — от 3 до 5 человек."
      footer={<><Button variant="ghost" onClick={onClose}>Отмена</Button><Button disabled={!agree} onClick={onDone}>Отправить заявку</Button></>}>
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <Input label="Название команды" defaultValue="Manticore" />
        <Input label="Почта капитана" defaultValue="captain@manticore.dev" prefix={<Icon name="mail" size={16} />} />
        <Select label="Размер команды" options={[{ value: "3", label: "3 человека" }, { value: "4", label: "4 человека" }, { value: "5", label: "5 человек" }]} />
        <div>
          <div style={{ font: "var(--type-ui-s)", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>Трек</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {TRACKS.map((t) => <Radio key={t.n} name="track" checked={track === t.n} onChange={() => setTrack(t.n)} label={t.title} />)}
          </div>
        </div>
        <Checkbox checked={agree} onChange={() => setAgree(!agree)} label="Согласен с политикой обработки персональных данных" />
      </div>
    </Dialog>
  );
}

function App() {
  const [dialog, setDialog] = React.useState(false);
  const [toast, setToast] = React.useState(false);
  const open = () => setDialog(true);
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <Nav />
      <Hero onRegister={open} />
      <About />
      <Tracks />
      <Prizes onRegister={open} />
      <Schedule />
      <Faq />
      <Experts />
      <Organizers />
      <SiteFooter onRegister={open} />
      <RegisterDialog open={dialog} onClose={() => setDialog(false)} onDone={() => { setDialog(false); setToast(true); setTimeout(() => setToast(false), 4000); }} />
      {toast && <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 60 }}>
        <Toast tone="ok" icon={<Icon name="check" size={16} />} title="Заявка отправлена" description="Мы написали на почту капитана команды Manticore." onClose={() => setToast(false)} />
      </div>}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
