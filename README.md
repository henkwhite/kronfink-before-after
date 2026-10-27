# Kronfink Before / After

WordPress-Block für Vorher-Nachher-Bildvergleiche: zwei Bilder, ein Schieberegler, sonst nichts.
Beschreibung, FAQ und Changelog stehen in [`readme.txt`](readme.txt).

## Installation

Die ZIP aus dem [neuesten Release](https://github.com/henkwhite/kronfink-before-after/releases/latest)
unter *Plugins › Installieren › Plugin hochladen* installieren. Updates kommen danach automatisch
aus den GitHub-Releases (plugin-update-checker).

Nicht den automatischen Quellcode-Download von GitHub verwenden: Ihm fehlen `build/` und `vendor/`.

## Entwicklung

```bash
npm install              # Build-Werkzeuge
composer install         # Update-Checker nach vendor/
npm run build            # Produktions-Build nach build/ (wird committet)
npm run start            # Watch-Modus — danach npm run build nicht vergessen
npm run i18n             # Übersetzungsdateien neu erzeugen
```

Lokal getestet wird in WordPress Studio, der Projektordner ist dort als Plugin verlinkt.

## Release

```bash
npm run zip              # nur dist/kronfink-before-after-<version>.zip bauen
npm run release          # Versionen prüfen, ZIP bauen, Tag pushen, GitHub-Release anlegen
```

Vor dem Release die Version in `kronfink-before-after.php`, `src/block.json`, `package.json`
und `readme.txt` (Stable tag plus Changelog-Eintrag) anheben. Tags tragen die nackte Version
(`1.3.0`).

## Lizenz

GPL-2.0-or-later. Enthält [plugin-update-checker](https://github.com/YahnisElsts/plugin-update-checker) (MIT).
