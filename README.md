# Template email · Sistema Recensioni

Tutte le email di Sistema Recensioni usano lo stesso template grafico e tecnico: `conferma-richiesta-test.html` è il riferimento. Per una nuova email si mantiene il testo (tono, merge tag) e lo si rimonta con questi componenti:

- **Header:** logo 190×49 (ospitato su GHL, vedi sotto) e linea rossa 3px (#ff3045) come bordo della cella.
- **Etichetta:** testo mono 11px maiuscolo rosso con pallino (es. "● Contratto da firmare").
- **Titolo:** 38px maiuscolo su tre righe, una parola in rosso.
- **Testo:** saluto 20px grassetto; paragrafi 16px/26px #4d4d4d con i passaggi chiave in grassetto #191919.
- **Card:** fondo #f5f5f5, bordo #e6e6e6, numero rosso 42px sopra il titolo maiuscolo.
- **Pulsante principale:** cella rossa a pillola con testo scuro maiuscolo e freccia ↗ (a tutta larghezza quando è l'azione chiave); il link porta solo il testo.
- **Azione secondaria:** link testuale sottolineato dentro la frase (niente secondo pulsante).
- **Dati come piano e importo:** righe di testo 16px, etichetta grigia e valore scuro, senza card né evidenziazioni.
- **Footer rosso:** una riga di testo 13px, scritta "Sistema / Recensioni✳︎" 48px su due righe, riga mono "Sistema Recensioni / 2026 · Preferenza locale. Reputazione che lavora.".

## Conferma richiesta del Test di Preferibilità Locale™

Email inviata dal workflow GHL **Email Confirmation Workflow**, azione **Invia Email di Conferma Test Preferibilità** (Quick compose).

- **Oggetto:** Test di Preferibilità Locale™ - Conferma Richiesta
- **Pre-header:** Conferma richiesta Test di Preferibilità Locale™ per la sua attività
- **Merge tag:** `{{contact.name}}`, `{{contact.ragione_sociale}}`

| File | Uso |
|---|---|
| `conferma-richiesta-test.html` | Email HTML. In GHL → Quick compose → Source code incollare **solo** il blocco tra i commenti `GHL START` e `GHL END`. |
| `conferma-richiesta-test.txt` | Versione solo testo con lo stesso contenuto. |
| `logo-sistema-recensioni-email.png` | Logo 2x su sfondo bianco (400×103, mostrato a 190×49). È caricato nella Media Storage di GHL e le email usano quell'indirizzo: `https://assets.cdn.filesafe.space/eZ3AlcoxddCWelo8pbmB/media/6aabebd4ff484614db0b7c1c.png` |

## Contratto da firmare

Email con il contratto da leggere e firmare online.

- **Merge tag:** `{{contact.first_name}}`, `{{document.url}}`
- `contratto-da-firmare.html` (HTML, stesso blocco `GHL START`/`GHL END`) e `contratto-da-firmare.txt` (solo testo).
- Il vecchio `{{location.name}}` in fondo è sostituito dalla scritta Sistema Recensioni del footer.

## Contratto firmato

Email dopo la firma: copia del contratto e pagamento per l'attivazione.

- **Merge tag:** `{{contact.first_name}}`, `{{document.url}}`, `{{contact.piano_climbo}}`, `{{contact.prezzo_piano}}`, `{{contact.link_di_pagamento_stripe}}`
- **Gerarchia sobria:** l'unico elemento forte è il pulsante rosso a tutta larghezza "Completa l'attivazione" (link di pagamento). Piano e importo sono testo semplice, senza enfasi, per non creare ripensamenti; il download del PDF è un link testuale sottolineato.
- `contratto-firmato.html` (HTML, stesso blocco `GHL START`/`GHL END`) e `contratto-firmato.txt` (solo testo).

## Regole dell'editor GHL (Quick compose / Tiptap)

L'editor riscrive l'HTML incollato. Il template funziona perché rispetta queste regole:

- `<head>`, `<style>`, media query e commenti condizionali vengono rimossi: il layout è fluido (100%, massimo 600px), senza media query.
- Le celle `td` conservano tutti gli stili: sfondi, bordi, bordi arrotondati e padding stanno lì.
- I `<p>` conservano `line-height`, `letter-spacing`, `text-transform` e colore, ma font e dimensione vengono forzati a Verdana 16px e i margini a 0.
- Font, dimensione e colore stanno su `<span>` **non annidati**; il grassetto è `<strong>`.
- La larghezza delle celle viene ignorata: niente colonne affiancate (i numeri si spezzerebbero), contenuti impilati in una cella.
- Il paragrafo del logo ha `line-height: 1px`, altrimenti l'editor aggiunge sotto l'immagine una riga vuota alta quanto il logo.
- Gli stili scritti sui link potrebbero non sopravvivere (da verificare in GHL): per sicurezza la forma del pulsante (sfondo, pillola, padding) sta sulla cella che lo contiene.

Per il rischio spam: una sola immagine, link solo dove servono (es. il pulsante del contratto), nessuno script, nessun testo nascosto.
