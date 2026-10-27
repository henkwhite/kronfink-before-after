<?php
/**
 * Updates from GitHub releases.
 *
 * @package Kronfink\BeforeAfter
 */

namespace Kronfink\BeforeAfter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Hooks up plugin-update-checker (YahnisElsts, MIT). The plugin watches the
 * repository henkwhite/kronfink-before-after for new releases and installs
 * the ZIP attached to the release.
 */
final class Updater {

	/**
	 * Repository that publishes the releases.
	 */
	const REPO = 'https://github.com/henkwhite/kronfink-before-after/';

	/**
	 * The update checker, kept for manual checks (WP-CLI, debugging).
	 *
	 * @var object|null
	 */
	public static $checker = null;

	/**
	 * Start the update check, provided the library ships with this copy.
	 *
	 * A checkout straight from GitHub has no vendor/ directory; the plugin
	 * then simply works without updates instead of failing.
	 *
	 * @return void
	 */
	public static function init() {
		$autoload = dirname( __DIR__ ) . '/vendor/autoload.php';

		if ( ! is_readable( $autoload ) ) {
			return;
		}

		require_once $autoload;

		if ( ! class_exists( \YahnisElsts\PluginUpdateChecker\v5\PucFactory::class ) ) {
			return;
		}

		$checker       = \YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
			self::REPO,
			PLUGIN_FILE,
			'kronfink-before-after'
		);
		self::$checker = $checker;

		$api = $checker->getVcsApi();

		if ( method_exists( $api, 'enableReleaseAssets' ) ) {
			// Only the ZIP attached to the release is a complete plugin: it
			// carries build/ and vendor/, GitHub's automatic source archive
			// does not. 2 = REQUIRE_RELEASE_ASSETS, no fallback to the archive.
			$api->enableReleaseAssets( '/kronfink-before-after.*\.zip$/i', 2 );
		}
	}
}
