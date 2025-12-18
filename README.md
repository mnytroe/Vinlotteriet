# Vinlotteriet 🎰

En webapplikasjon for å kjøre lotteri på jobben med et animert hjul (wheel of fortune).

## Funksjoner

- **Administrasjon av ansatte**: Legg til, rediger og aktiver/deaktiver ansatte
- **Sesjonsoppsett**: Velg ansatte som skal delta og sett antall lodd per person
- **Animeret hjul**: Spinn hjulet for å trekke en tilfeldig vinner
- **Loddtelling**: Velg om loddet skal fjernes etter seier
- **Randomiser**: Blande deltakere og tilfeldig startposisjon

## Teknologier

- Next.js 14 (App Router)
- TypeScript
- Prisma (database ORM)
- SQLite (lokalt) / Turso (produksjon på Vercel)
- Tailwind CSS
- React

## Lokal utvikling

1. Installer avhengigheter:
```bash
npm install
```

2. Opprett `.env` fil i rotmappen:
```
DATABASE_URL="file:./dev.db"
```

3. Opprett database:
```bash
npx prisma db push
npx prisma generate
```

4. Start utviklingsserver:
```bash
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## Deployment på Vercel

1. Opprett en Turso-konto på [turso.tech](https://turso.tech) (gratis)
2. Opprett en ny database og få connection string
3. **VIKTIG: Initialiser database schema:**
   
   **Alternativ A: Bruk Turso CLI (anbefalt):**
   ```bash
   # Installer Turso CLI hvis ikke allerede installert
   # Kjør SQL-filen for å opprette tabeller
   turso db shell vinlotteriet < init-db.sql
   ```
   
   **Alternativ B: Bruk Turso Dashboard:**
   - Gå til Turso dashboard
   - Velg databasen din
   - Gå til "Query" eller "SQL Editor"
   - Kopier innholdet fra `init-db.sql` filen og kjør den
4. Push kode til GitHub
5. Koble GitHub repository til Vercel
6. Legg til environment variable i Vercel:
   - `DATABASE_URL`: Turso connection string
7. Deploy!

Vercel vil automatisk deploye ved push til main branch.
