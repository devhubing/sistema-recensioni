# Landing dentisti · Codex Light

Apri `index.html` nel browser. La cartella è autonoma: HTML, CSS, JavaScript, font e immagini sono locali; non richiede build o dipendenze.

## Fonti e fedeltà

- Design system: `design-system/desgin-codex/desgin-codex-light.html`, con copia dei token light originali e dei font Manrope (licenza in `assets/OFL-Manrope.txt`).
- Struttura e testi: `Landing dentisti - struttura.pdf`, otto pagine. Mantenuti ordine delle sezioni, copy, CTA, campi e opzioni del modulo. Nella sezione dati il nome è scritto «Sistema Recensioni 5 *****», in grassetto.
- Hero e logo aggiornati con i PNG originali forniti: `assets/report-preferibilita.png` e `assets/logo-sistema-recensioni.png`, mantenendo trasparenza e proporzioni. Il logo è utilizzato in header e footer. Le decorazioni sono stelle a cinque punte.
- Immagini del PDF utilizzate: classifiche Google/AI, reception e dashboard. Sono esempi presenti nel documento, non risultati aggiuntivi o verificati.
- Il blocco «La preferenza si costruisce. I risultati la dimostrano.» e la relativa testimonianza sono stati rimossi su richiesta. Le sezioni non hanno etichette sopra il titolo; le card della reception mostrano solo il nome (Il team, Il paziente, La prova).
- Le due analisi gratuite mantengono il disegno originale: schede affiancate su desktop, numeri 01/02 rossi, titoli e liste con icone lineari. Su mobile le schede si impilano. Le fotografie illustrative `analisi-reputazione.webp` e `analisi-competitiva.webp` restano negli asset ma non sono utilizzate nella pagina.
- La sezione «Essere visibili non basta» usa due righe alternate: testo a sinistra e confronto degli studi online a destra; colloquio di fiducia con il dentista a sinistra e domanda/CTA a destra. Le due nuove foto sono generate con imagegen e hanno funzione illustrativa. Su mobile ogni testo è seguito dalla propria foto. Prompt e dettagli in `assets/visibility-photo-prompts.md`.
- Ingombri: hero a due colonne con pannello fotografico alto; confronto con immagine verticale; reception a sinistra con tre fasi a destra; dashboard a destra. Conservati i rapporti originali delle immagini, senza ritagli del contenuto. Su mobile le colonne si impilano.
- I salti pagina del PDF non diventano spazi bianchi artificiali nella pagina web. La terza fase della reception e le fasi 4–6 del volano proseguono nelle rispettive sezioni.

## Interazioni

- Icone dei cinque step: team, QR Code, megafono, dashboard e crescita, realizzate con SVG incorporati nell'HTML e lo stesso tratto delle icone nelle analisi. In vista dell'integrazione in GHL non sono state aggiunte librerie di icone, font o script di inizializzazione esterni. Le icone decorative hanno `aria-hidden="true"`; i titoli descrivono ciascuno step.

- Tutte le CTA portano al modulo finale.
- I passaggi «Il team attiva», «Il paziente accede», «La prova resta» riprendono le card del punto 07 del design system Codex Light: fondo chiaro, rosso e carbone, `position: sticky` e sovrapposizione con scarti di 20 px. Il titolo della sezione rimane visibile sotto la navigazione; le card e la foto si fermano sotto il titolo. Le altezze reali di titolo e navigazione sono misurate con `ResizeObserver` nativo, senza librerie esterne. La fotografia resta affiancata e sticky su desktop, precede le card su mobile. Con movimento ridotto le card tornano nel flusso normale; in stampa anche il titolo è statico.
- Hero: titolo del test evidenziato e fascia dei loghi Google Maps, ChatGPT, Gemini e Perplexity con scorrimento automatico continuo, senza pulsanti play/pausa e senza interruzioni al passaggio del mouse o al focus. L'animazione funziona anche senza JavaScript. Con movimento ridotto attivo i quattro loghi sono disposti in una griglia statica. La stella decorativa rimane soltanto nella sezione finale.
- Volano con sei fasi, descrizione centrale, avanzamento ogni 8,5 secondi, pausa/ripresa, selezione manuale e navigazione con frecce/Home/End. Selezionare una fase mette in pausa la riproduzione. Le descrizioni complete sono leggibili anche nell'accordion e senza JavaScript.
- Animazioni di ingresso e indicatore di lettura. Rispetto di `prefers-reduced-motion`; il volano automatico si ferma fuori schermo e con scheda nascosta.
- Validazione dei campi nel browser e poi sul server. Nome e cognome sono campi separati; l'ambito territoriale ammette una selezione.

## Invio del modulo a Prospect

Il modulo parla con le rotte pubbliche della webapp Prospect, senza token nella pagina. L'indirizzo è in `data-api` sul `<form id="studio-form">`:

- oggi punta a staging: `https://staging.sistemarecensioni.it/api/v1/landing/eZ3AlcoxddCWelo8pbmB`;
- per la produzione basta sostituire il dominio con `app2.sistemarecensioni.it`, lasciando uguale la location.

Come funziona:

- **Nome dello studio (come appari su Google)**: dopo tre caratteri chiede i suggerimenti a `…/suggerimenti` (Google Places del sub-account). Lo studio va scelto dall'elenco, con mouse o frecce e Invio: senza una scheda scelta il modulo non parte.
- **Invio**: `POST …/richieste` con scheda, nome, cognome, email, telefono e zona (`quartiere`, `citta`, `provincia`). In Prospect la scheda diventa un target con fonte `landing` e la persona diventa il contatto GHL, sincronizzato da Prospect via API.
- Il campo nascosto `nota_interna` è un'esca per i bot: le persone non lo vedono.
- Gli errori del server tornano sotto i rispettivi campi; limiti di frequenza e problemi di rete hanno un messaggio dedicato.

La webapp risponde solo se la location è abilitata sul server (`PROSPECT_LANDING_LOCATIONS`). Dettagli in `Docs/15-api.md` del repository Prospect.

## Prima della pubblicazione

Mancano le informazioni privacy appropriate al trattamento dei dati raccolti dal modulo. Le immagini estratte dal PDF possono essere sostituite con gli originali mantenendo gli stessi nomi e rapporti.

La cartella `qa/` contiene le pagine renderizzate e il testo estratto dal PDF, oltre alle verifiche della landing. Nessuna cartella preesistente è stata modificata.
