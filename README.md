# desgin-codex

Design system HTML, CSS e JavaScript per il progetto Sistema Recensioni. Il nome `desgin-codex` mantiene la grafia richiesta.

Apri **index.html** per scegliere demo o design system, ciascuno in versione **dark** e **light**. Non servono dipendenze, compilazione o connessione: font e immagini sono locali. “Apri demo” mantiene il tema scelto; il pulsante Light/Dark nell'intestazione passa alla pagina corrispondente dell'altro tema.

## Contenuti

- Hero tipografica, segno grafico originale e marquee continuo.
- Palette rosso Signal `#FF3045`, carbone `#191919`, grafite `#2D2D2D`, avorio `#F2F0E9`; colori semantici e rapporti di contrasto calcolati.
- Manrope locale, scala tipografica e campo per provare il proprio testo.
- Scala di spaziatura, raggi e griglia sovrapponibile a 12 colonne desktop / 4 mobile.
- Pulsanti, badge, switch, filtri, carousel recensioni e form con validazione locale.
- Pattern servizi con accordion e storytelling con card sticky sovrapposte.
- Motion lab: text reveal, magnetic button, stacked cards, marquee, count up, shape reveal. Replay singolo o collettivo, pausa, velocità 1× / 0.5× / 0.25×.
- Modalità a movimento ridotto, con rispetto automatico di `prefers-reduced-motion`.
- Sezione espandibile con collegamenti alle reference.

## File

| File | Uso |
| --- | --- |
| `index.html` | Pagina iniziale con accessi distinti, senza reindirizzamento automatico |
| `demo.html` | Demo di una pagina: hero animata, contatore, servizi e card sovrapposte |
| `demo.js` | Interazioni della demo, pausa e replay dall'inizio |
| `desgin-codex.html` | Design system e laboratorio animazioni, con CSS e JavaScript incorporati |
| `demo-light.html` | Demo animata con palette light |
| `desgin-codex-light.html` | Design system light con componenti e laboratorio |
| `light.css` | Trattamento light condiviso fra demo e design system |
| `theme-switch.css` | Navigazione fra temi, responsive |
| `tokens.css` | Variabili CSS riutilizzabili |
| `tokens.json` | Stessi token in JSON semplice |
| `tokens-light.css`, `tokens-light.json` | Token light completi, inclusi `--canvas`, `--ink` e colori semantici |
| `build-light.py` | Rigenera gli HTML light dalle versioni dark e aggiorna i token light |
| `assets/manrope-*.ttf` | Font locali, pesi da 400 a 800 |
| `assets/OFL-Manrope.txt` | Licenza SIL Open Font License |
| `assets/reference-*.png` | Copie delle reference fornite, mostrate nel moodboard |

Il pulsante nel footer esporta i token CSS della pagina. I file `tokens.css` e `tokens.json` rappresentano la palette e i valori iniziali. La demo mantiene le proprie variabili all'inizio del blocco `<style>`: se cambi il sistema, aggiorna anche i file token o esporta nuovamente il CSS.

La variante light usa avorio `#F2F0E9` per il canvas, gesso `#FFFDF8` per le superfici e carbone `#191919` per i testi. Il rosso principale `#FF3045` resta invariato; `#C71930` è l'accento per testi piccoli. La card conclusiva conserva il carbone come contrasto editoriale. Il download dal sistema light esporta i valori effettivi della variante light.

Per mantenere allineate le varianti dopo modifiche ai sorgenti dark, esegui `python build-light.py` da questa cartella. Modifica `light.css` per il trattamento cromatico e `build-light.py` per i testi specifici della variante; gli HTML light sono rigenerati. La demo condivide `demo.js` fra i due temi. Il cambio tema apre la pagina corrispondente e riparte dall'inizio, senza memorizzare preferenze.

## Interazioni

Le animazioni all'ingresso usano IntersectionObserver e Web Animations API. Il marquee usa CSS; le card in fondo usano `position: sticky` e scroll nativo. Il contatore usa un clock condiviso. Velocità e pausa governano gli effetti animati; i pannelli sticky seguono lo scroll della persona. Attivare movimento ridotto elimina anche lo stacking sticky.

Le animazioni finite partono una volta all'ingresso. I pulsanti di replay del laboratorio le riavviano. L'effetto magnetico segue il mouse; su touch il pulsante della demo offre una simulazione al tap. Escape chiude menu mobile e griglia. Il testo rimane visibile anche in assenza delle API di animazione.

Recensioni, nomi, organizzazioni e statistiche sono dati dimostrativi. Il form non invia né conserva dati; gli altri controlli mantengono stato solo fino al ricaricamento. Non è presente un backend.

## Direzione creativa

- [Codigo](https://www.codigo.co/): hero e scala tipografica.
- [Pixora](https://html.aqlova.com/pixora-prev/pixora/index-2.html): riferimento richiesto per impaginazione e movimento allo scroll.
- [Agntix](https://agntix-next.vercel.app/): hero, progressione delle sezioni e area servizi.
- Immagini Union Direct fornite nella cartella `inspirations`: rosso, segno grafico fuori scala e contrasti editoriali. Restano materiale di riferimento nel moodboard.

## Verifica

Controllati nel browser: desktop e breakpoint mobile, menu, accordion, filtri, carousel, validazione del form, replay, pausa del contatore, velocità e movimento ridotto. JavaScript verificato con `node --check`.
