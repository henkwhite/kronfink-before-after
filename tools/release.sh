#!/usr/bin/env bash
# Builds the release ZIP and, after confirmation, publishes a GitHub release.
#
# Flow: check versions → production build → ZIP with build/, languages/ and
# vendor/ (no development files) → show contents → confirm → push tag →
# gh release create. The plugin-update-checker inside installed copies then
# picks the release up on the next update check.
#
# Usage: tools/release.sh              (everything, asks before publishing)
#        RELEASE_CONFIRM=j tools/release.sh  (no prompt — only after explicit approval)
#        tools/release.sh --zip-only   (just build dist/<name>-<version>.zip)
#
# Tags carry the bare version (1.3.0, no "v"), matching the existing tags.
set -euo pipefail
cd "$(dirname "$0")/.."

REPO="henkwhite/kronfink-before-after"
SLUG="kronfink-before-after"

version=$(grep -E "^ \* Version:" "$SLUG.php" | awk '{print $3}')
stable=$(grep -E "^Stable tag:" readme.txt | awk '{print $3}')
pkg=$(node -p "require('./package.json').version")
block=$(node -p "require('./src/block.json').version")

if [ "$version" != "$stable" ] || [ "$version" != "$pkg" ] || [ "$version" != "$block" ]; then
	echo "✗ Versions differ: header $version, Stable tag $stable, package.json $pkg, block.json $block"
	exit 1
fi
if ! grep -q "^= $version =" readme.txt; then
	echo "✗ readme.txt has no changelog entry for $version"
	exit 1
fi
echo "Version $version"

npm run build --silent

# Fresh copy in a temporary directory (left to the system's temp cleanup);
# vendor/ is installed there without dev packages.
work=$(mktemp -d)
mkdir -p "$work/$SLUG"
cp -R build languages includes "$SLUG.php" readme.txt composer.json composer.lock "$work/$SLUG/"
(cd "$work/$SLUG" && composer install --no-dev --optimize-autoloader --no-interaction --quiet)
zip_name="$SLUG-$version.zip"
mkdir -p dist
(cd "$work" && zip -rqX "$zip_name" "$SLUG" -x '*.DS_Store' "$SLUG/composer.json" "$SLUG/composer.lock")
mv -f "$work/$zip_name" "dist/$zip_name"

echo; echo "Contents of dist/$zip_name (library omitted):"
unzip -l "dist/$zip_name" | awk 'NR>3 {print $4}' | grep -v "^$" | grep -v "/vendor/yahnis-elsts/plugin-update-checker/." | sed '$d'
echo "(plus vendor/yahnis-elsts/plugin-update-checker)"
du -h "dist/$zip_name"

if [ "${1:-}" = "--zip-only" ]; then
	exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
	echo "✗ Working tree is not clean — commit first."
	exit 1
fi

echo
answer="${RELEASE_CONFIRM:-}"
if [ -z "$answer" ]; then
	read -r -p "Publish release $version on github.com/$REPO? [j/N] " answer < /dev/tty || answer=""
fi
if [ "$answer" != "j" ]; then
	echo "Aborted, nothing published."
	exit 0
fi

git tag "$version"
git push origin master "$version"
notes=$(awk "/^= $version =/{f=1;next}/^= /{f=0}f" readme.txt)
gh release create "$version" "dist/$zip_name" --repo "$REPO" --title "$version" --notes "$notes"
echo "✓ Release $version published."
