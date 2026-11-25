# ExpenseTracker PWA

Mobilna aplikacja do ewidencji wydatków. Projekt wykorzystuje React, Vite i standard PWA. Dane są zapisywane lokalnie w `localStorage` przeglądarki.

## Wymagania
- Node.js w wersji LTS (zalecane Node 22 LTS)
- npm
- przeglądarka Safari na iPhonie

## Uruchomienie lokalne
W terminalu, w katalogu projektu:
```bash
npm install
npm run dev
```
Vite pokaże adres lokalny. Do testowania na iPhonie i instalacji PWA wymagany jest adres HTTPS (lub localhost na tym samym urządzeniu).

## Zbudowanie wersji produkcyjnej
```bash
npm run build
npm run preview
```
Pliki gotowe do publikacji znajdują się w katalogu `dist`.

## Publikacja na Vercel
1. Utwórz repozytorium na GitHub i wgraj zawartość projektu (bez `node_modules` i `dist`).
2. Zaloguj się na https://vercel.com/ i wybierz Add New → Project.
3. Zaimportuj repozytorium.
4. Ustaw:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Kliknij Deploy. Otrzymany adres HTTPS otwórz na iPhonie w Safari.
6. W Safari wybierz Udostępnij → Dodaj do ekranu początkowego.

## Funkcje
- Dodawanie, edycja i usuwanie wydatków
- Kategorie, wyszukiwanie i filtrowanie
- Podsumowanie wydatków dla wybranego miesiąca
- Eksport CSV
- Manifest PWA i Service Worker z cache podstawowych plików
- Układ dostosowany do ekranów telefonów

## Ważne ograniczenia
- Wydatki są przechowywane wyłącznie na urządzeniu w `localStorage`.
- Usunięcie danych witryny, wyczyszczenie pamięci przeglądarki lub zmiana urządzenia może spowodować utratę danych. Regularnie eksportuj CSV.
- Nie ma synchronizacji, kont użytkowników ani kopii zapasowej w chmurze.
- Hosting udostępnia pliki aplikacji 24/7, ale iOS nie utrzymuje PWA stale uruchomionej w tle.
- Service Worker buforuje pliki aplikacji; operacje dodawania i edycji odbywają się lokalnie.

## Struktura
- `src/App.jsx` – interfejs i logika aplikacji
- `src/styles.css` – wygląd i responsywność
- `src/main.jsx` – start React i rejestracja Service Workera
- `public/manifest.webmanifest` – konfiguracja PWA
- `public/sw.js` – cache offline
- `public/icons/` – ikony aplikacji
