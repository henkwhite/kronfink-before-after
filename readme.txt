=== Kronfink Before / After ===
Contributors: kronfink
Tags: before after, image comparison, slider, block
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.3.1
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Ein bewusst simpler Block fuer Vorher-Nachher-Bildvergleiche. Zwei Bilder, ein Schieberegler, sonst nichts.

== Description ==

Der Block legt zwei Bilder uebereinander und blendet sie mit einem Trenner gegeneinander auf.
Er macht genau das und nichts weiter: keine Lightbox, keine Bildunterschrift, kein Autoplay,
keine Pro-Version.

Eigenschaften:

* Zwei Bilder per Drag & Drop oder Mediathek
* Bedienung ueber ein natives Schieberegler-Element: ziehen, wischen, klicken, Pfeiltasten,
  Pos1/Ende, Bild-hoch/Bild-runter, Screenreader-Ansage
* Optionale Beschriftungen, direkt im Bild bearbeitbar
* Startposition, Alt-Texte je Bild, Ausrichtung breit/vollbreit, Farbe des Griffs
* Bilder ueber wp_get_attachment_image(): srcset, sizes und Lazy Loading kommen von WordPress
* Rund 0,6 KB JavaScript im Frontend, keine Abhaengigkeiten

== Installation ==

Die ZIP aus dem neuesten GitHub-Release unter Plugins > Installieren > Plugin hochladen
installieren. Danach kommen Updates automatisch aus den Releases. Nicht den
Quellcode-Download von GitHub verwenden: Ihm fehlen build/ und vendor/.

== Anpassung per CSS ==

Alle Farben und Masse liegen als CSS-Variablen auf dem Block und lassen sich global
ueberschreiben:

`
.wp-block-kronfink-before-after {
	--kf-ba-line: #ffffff;      /* Trennlinie */
	--kf-ba-handle: #ff0082;    /* Rand und Pfeile des Griffs */
	--kf-ba-handle-bg: #ffffff; /* Fuellung des Griffs */
	--kf-ba-line-width: 2px;
	--kf-ba-handle-size: 40px;
}
`

== Frequently Asked Questions ==

= Was passiert bei unterschiedlichen Seitenverhaeltnissen? =

Das Vorher-Bild gibt das Mass vor, das Nachher-Bild wird eingepasst und dabei beschnitten.
Der Editor weist darauf hin, sobald die Verhaeltnisse mehr als ein Prozent auseinanderliegen.

= Warum verschwindet der Block, wenn ich das Plugin deaktiviere? =

Es ist ein dynamischer Block: das Markup entsteht bei jedem Seitenaufruf in PHP. Dadurch
kommen Bildgroessen und spaetere Korrekturen automatisch auch bei alten Beitraegen an, und
es gibt nie die Meldung "Dieser Block enthaelt unerwarteten Inhalt". Nach dem Reaktivieren
ist alles wieder da.

== Changelog ==

= 1.3.1 =
* Behoben: Nach einem Klick ins Bild lag ein magentafarbener Rahmen um das ganze Bild
  (der Fokusring des Reglers). Der Fokusring liegt jetzt als Ring um den Griff und
  erscheint nur bei Tastaturbedienung.

= 1.3.0 =
* Updates kommen jetzt direkt aus den GitHub-Releases (plugin-update-checker). Einmal
  diese Version per ZIP installieren, danach erscheinen neue Versionen unter Plugins
  wie gewohnt.

= 1.2.0 =
* Neuer Griff: runder, weiss gefuellter Knopf mit Rand und Doppelpfeil in Magenta
  (Standard #ff0082). Die Trennlinie bleibt weiss.
* Die Farbeinstellung im Editor faerbt jetzt nur noch den Griff. Trennlinie und
  Fuellung sind per CSS-Variable (--kf-ba-line, --kf-ba-handle-bg) anpassbar.

= 1.1.1 =
* Behoben: Ein Ziehen, dessen Loslassen ausserhalb des Bildes landete, konnte beim
  naechsten Ueberfahren mit der Maus weiterziehen.
* Behoben: Ein kurz ruhender Finger oeffnete auf iOS das Bildmenue statt zu ziehen.
* Editor-Vorschau rendert beim Ziehen nicht mehr pro Pixel neu.
* Build-Werkzeuge: plugin-zip erzwingt jetzt einen frischen Produktions-Build.

= 1.1.0 =
* Neu: Sichtbarer Ausschnitt des Nachher-Bildes einstellbar, wenn es zugeschnitten wird.
* Behoben: Wischen funktionierte in mobilem Safari nicht. Die Zeigersteuerung laeuft
  jetzt nicht mehr ueber das Range-Element, weil iOS Safari es nur am Griff zieht --
  und der muss null Pixel breit bleiben, damit der Trenner unter dem Finger sitzt.
* Vertikales Scrollen ueber dem Bild verschiebt den Trenner nicht mehr.

= 1.0.1 =
* Plugin liegt jetzt in der Wurzel des Repositories.
* Header fuer Updates direkt aus dem GitHub-Repository ergaenzt.

= 1.0.0 =
* Erste Version.
