=== Kronfink Before / After ===
Contributors: kronfink
Tags: before after, image comparison, slider, block
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.0.1
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
* Startposition, Alt-Texte je Bild, Ausrichtung breit/vollbreit, Farbe fuer Trenner und Griff
* Bilder ueber wp_get_attachment_image(): srcset, sizes und Lazy Loading kommen von WordPress
* Rund 0,6 KB JavaScript im Frontend, keine Abhaengigkeiten

== Anpassung per CSS ==

Alle Farben und Masse liegen als CSS-Variablen auf dem Block und lassen sich global
ueberschreiben:

`
.wp-block-kronfink-before-after {
	--kf-ba-handle: #ffffff;
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

= 1.0.1 =
* Plugin liegt jetzt in der Wurzel des Repositories.
* Header fuer Updates direkt aus dem GitHub-Repository ergaenzt.

= 1.0.0 =
* Erste Version.
