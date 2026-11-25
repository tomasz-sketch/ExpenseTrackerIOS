import React, { useEffect, useMemo, useState } from "react";
import { Wallet, Plus, Search, Trash2, Pencil, Download, X, TrendingDown, CalendarDays, PieChart, List, Home } from "lucide-react";

const KEY = "expense-tracker-items-v1";
const CATEGORIES = ["Jedzenie", "Transport", "Mieszkanie", "Zakupy", "Zdrowie", "Rozrywka", "Rachunki", "Inne"];
const money = (value) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(value);
const today = () => new Date().toISOString().slice(0, 10);
const monthNow = () => today().slice(0, 7);

function readItems() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

export default function App() {
  const [items, setItems] = useState(readItems);
  const [month, setMonth] = useState(monthNow());
  const [category, setCategory] = useState("Wszystkie");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "Jedzenie", date: today(), note: "" });
  const [tab, setTab] = useState("home");

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items
    .filter(x => x.date.startsWith(month))
    .filter(x => category === "Wszystkie" || x.category === category)
    .filter(x => (x.title + " " + (x.note || "")).toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt), [items, month, category, search]);

  const total = filtered.reduce((sum, x) => sum + Number(x.amount), 0);
  const allTotal = items.filter(x => x.date.startsWith(month)).reduce((sum,x) => sum + Number(x.amount), 0);
  const grouped = CATEGORIES.map(name => ({ name, value: filtered.filter(x => x.category === name).reduce((s,x) => s + Number(x.amount), 0) })).filter(x => x.value > 0);

  function openNew() {
    setEditing(null);
    setForm({ title: "", amount: "", category: "Jedzenie", date: today(), note: "" });
    setShowForm(true);
  }
  function openEdit(item) {
    setEditing(item.id);
    setForm({ title: item.title, amount: String(item.amount), category: item.category, date: item.date, note: item.note || "" });
    setShowForm(true);
  }
  function save(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !Number.isFinite(amount) || amount <= 0 || !form.date) return;
    if (editing) {
      setItems(prev => prev.map(x => x.id === editing ? { ...x, ...form, amount } : x));
    } else {
      setItems(prev => [...prev, { ...form, amount, id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), createdAt: Date.now() }]);
    }
    setShowForm(false);
  }
  function remove(id) {
    if (window.confirm("Usunąć ten wydatek?")) setItems(prev => prev.filter(x => x.id !== id));
  }
  function exportCSV() {
    const rows = [["Data","Nazwa","Kategoria","Kwota PLN","Opis"], ...filtered.map(x => [x.date, x.title, x.category, x.amount, x.note || ""])];
    const csv = "\uFEFF" + rows.map(row => row.map(v => `"${String(v).replaceAll('"','""')}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `wydatki-${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-icon"><Wallet size={21}/></span><span>ExpenseTracker</span></div>
      <button className="icon-btn" aria-label="Eksport CSV" onClick={exportCSV}><Download size={19}/></button>
    </header>

    <main>
      <section className="intro">
        <div><p className="eyebrow">TWOJE FINANSE</p><h1>Podsumowanie</h1></div>
        <label className="month-picker"><CalendarDays size={16}/><input type="month" value={month} onChange={e=>setMonth(e.target.value)} /></label>
      </section>

      <section className="summary-grid">
        <article className="summary-card primary"><span className="summary-icon"><Wallet size={19}/></span><div><small>Wydatki w miesiącu</small><strong>{money(allTotal)}</strong></div></article>
        <article className="summary-card"><span className="summary-icon pink"><TrendingDown size={19}/></span><div><small>Liczba wydatków</small><strong>{items.filter(x=>x.date.startsWith(month)).length}</strong></div></article>
      </section>

      <section className="panel">
        <div className="section-heading"><div><span className="heading-icon"><PieChart size={18}/></span><h2>Wydatki według kategorii</h2></div></div>
        {grouped.length ? <div className="category-list">{grouped.map((g,i)=><div className="category-row" key={g.name}><span className={`dot dot-${i%6}`}></span><span>{g.name}</span><div className="bar"><i style={{width:`${Math.max(4, g.value / Math.max(...grouped.map(a=>a.value))*100)}%`}}/></div><b>{money(g.value)}</b></div>)}</div> : <p className="empty-small">Brak wydatków w tym miesiącu.</p>}
      </section>

      <section className="transactions">
        <div className="section-heading"><div><span className="heading-icon"><List size={18}/></span><h2>Historia wydatków</h2></div><button className="text-btn" onClick={openNew}><Plus size={16}/> Dodaj</button></div>
        <div className="filters">
          <label className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Szukaj wydatku..." /></label>
          <select value={category} onChange={e=>setCategory(e.target.value)} aria-label="Filtr kategorii"><option>Wszystkie</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
        </div>
        <div className="transaction-list">
          {filtered.length ? filtered.map(item=><article className="transaction" key={item.id}>
            <div className="transaction-symbol">{item.category === "Jedzenie" ? "🍽️" : item.category === "Transport" ? "🚗" : item.category === "Mieszkanie" ? "🏠" : item.category === "Zdrowie" ? "＋" : "🛍️"}</div>
            <div className="transaction-info"><strong>{item.title}</strong><small>{item.category} · {new Date(item.date+"T12:00:00").toLocaleDateString("pl-PL")}</small>{item.note && <small className="note">{item.note}</small>}</div>
            <div className="transaction-end"><b>-{money(Number(item.amount))}</b><div><button aria-label="Edytuj" onClick={()=>openEdit(item)}><Pencil size={15}/></button><button aria-label="Usuń" onClick={()=>remove(item.id)}><Trash2 size={15}/></button></div></div>
          </article>) : <div className="empty"><div>🧾</div><strong>Brak wydatków</strong><span>Dodaj pierwszy wydatek, aby rozpocząć.</span></div>}
        </div>
      </section>
      <p className="privacy-note">Twoje dane są zapisywane lokalnie na tym urządzeniu.</p>
    </main>

    <nav className="bottom-nav">
      <button className={tab==="home"?"active":""} onClick={()=>setTab("home")}><Home size={19}/><span>Start</span></button>
      <button onClick={()=>{setTab("history");document.querySelector(".transactions")?.scrollIntoView({behavior:"smooth"});}} className={tab==="history"?"active":""}><List size={19}/><span>Historia</span></button>
      <button className="add-fab" onClick={openNew} aria-label="Dodaj wydatek"><Plus size={25}/></button>
      <button onClick={()=>{setTab("categories");document.querySelector(".panel")?.scrollIntoView({behavior:"smooth"});}} className={tab==="categories"?"active":""}><PieChart size={19}/><span>Kategorie</span></button>
      <button onClick={exportCSV}><Download size={19}/><span>Eksport</span></button>
    </nav>

    {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false);}}>
      <form className="form-sheet" onSubmit={save}>
        <div className="sheet-head"><div><p className="eyebrow">NOWA TRANSAKCJA</p><h2>{editing ? "Edytuj wydatek" : "Dodaj wydatek"}</h2></div><button type="button" className="icon-btn" onClick={()=>setShowForm(false)}><X size={20}/></button></div>
        <label className="field"><span>Nazwa wydatku</span><input required maxLength="70" placeholder="np. Zakupy spożywcze" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label>
        <label className="field"><span>Kwota (PLN)</span><input required type="number" min="0.01" step="0.01" inputMode="decimal" placeholder="0,00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})}/></label>
        <label className="field"><span>Kategoria</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label>
        <label className="field"><span>Data</span><input required type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label className="field"><span>Opis (opcjonalnie)</span><input maxLength="120" placeholder="Dodatkowe informacje" value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label>
        <button className="save-btn" type="submit">{editing ? "Zapisz zmiany" : "Zapisz wydatek"}</button>
      </form>
    </div>}
  </div>;
}