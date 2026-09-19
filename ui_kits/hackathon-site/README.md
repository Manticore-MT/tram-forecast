# UI kit — Хакатон Московского транспорта (лендинг)

Recreation of the public landing page at **https://mt-hackathon.ru/**, built from the site's own copy (pasted by the user) and the supplied organizer lockup. No screenshots or CSS from the live Tilda build were available, so layout follows the page's section order and content structure; type scale, colour and spacing come from this design system's tokens.

**Files**
- `index.html` — mount + script order.
- `Sections.jsx` — `Nav`, `Hero`, `SectionHead`, `About` (facts strip + «Зачем участвовать?»).
- `Tracks.jsx` — `Tracks` (4 tracks, expandable), `Prizes`, `Schedule`, `Faq`, `Experts`, `Organizers`, `SiteFooter`.
- `App.jsx` — `RegisterDialog` + app composition and toast.

**Interactive:** sticky nav anchors, expandable track rows (track 02 open by default — Manticore's track), FAQ accordion, and a working registration dialog (team name → size → track → consent) that fires a success toast.

**Deliberately blank:** expert portraits render as labelled plates — no photography was supplied and none is invented.
