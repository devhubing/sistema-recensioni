# Template email · Sistema Recensioni

## Conferma richiesta del Test di Preferibilità Locale™

Email inviata dal workflow GHL **Email Confirmation Workflow**, azione **Invia Email di Conferma Test Preferibilità** (Quick compose).

- **Oggetto:** Test di Preferibilità Locale™ - Conferma Richiesta
- **Pre-header:** Conferma richiesta Test di Preferibilità Locale™ per la sua attività
- **Merge tag:** `{{contact.name}}`, `{{contact.ragione_sociale}}`

| File | Uso |
|---|---|
| `conferma-richiesta-test.html` | Email HTML. In GHL → Quick compose → Source code incollare **solo** il blocco tra i commenti `GHL START` e `GHL END`. |
| `conferma-richiesta-test.txt` | Versione solo testo con lo stesso contenuto. |
| `logo-sistema-recensioni-email.png` | Logo 2x su sfondo bianco (400×103, mostrato a 190×49). L'HTML usa il logo pubblico del branch `landing-dentisti`; in alternativa caricare questo file nei media di GHL e sostituire l'URL. |

## Regole dell'editor GHL (Quick compose / Tiptap)

L'editor riscrive l'HTML incollato. Il template funziona perché rispetta queste regole:

- `<head>`, `<style>`, media query e commenti condizionali vengono rimossi: il layout è fluido (100%, massimo 600px), senza media query.
- Le celle `td` conservano tutti gli stili: sfondi, bordi, bordi arrotondati e padding stanno lì.
- I `<p>` conservano `line-height`, `letter-spacing`, `text-transform` e colore, ma font e dimensione vengono forzati a Verdana 16px e i margini a 0.
- Font, dimensione e colore stanno su `<span>` **non annidati**; il grassetto è `<strong>`.
- La larghezza delle celle viene ignorata: niente colonne affiancate (i numeri si spezzerebbero), contenuti impilati in una cella.
- Il paragrafo del logo ha `line-height: 1px`, altrimenti l'editor aggiunge sotto l'immagine una riga vuota alta quanto il logo.

Per il rischio spam: una sola immagine, nessun link, nessuno script, nessun testo nascosto.
