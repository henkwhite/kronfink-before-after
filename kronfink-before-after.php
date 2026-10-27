<?php
/**
 * Plugin Name:       Kronfink Before / After
 * Plugin URI:        https://github.com/henkwhite/kronfink-before-after
 * Description:       A deliberately simple before/after image comparison block. Two images, one slider, nothing else.
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Version:           1.3.0
 * Author:            Kronfink
 * Update URI:        https://github.com/henkwhite/kronfink-before-after
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       kronfink-before-after
 * Domain Path:       /languages
 *
 * @package Kronfink\BeforeAfter
 */

namespace Kronfink\BeforeAfter;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Script handle that register_block_type() derives from the block name in block.json.
 *
 * @see generate_block_asset_handle()
 */
const EDITOR_SCRIPT_HANDLE = 'kronfink-before-after-editor-script';

define( __NAMESPACE__ . '\PLUGIN_FILE', __FILE__ );

require_once __DIR__ . '/includes/class-updater.php';

// Updates come from the GitHub releases, see includes/class-updater.php.
Updater::init();

/**
 * Register the block and hook up the editor translations.
 *
 * wp_set_script_translations() has to run after register_block_type(), because that
 * is what registers the script handle in the first place.
 *
 * @return void
 */
function register_block() {
	load_plugin_textdomain(
		'kronfink-before-after',
		false,
		dirname( plugin_basename( __FILE__ ) ) . '/languages'
	);

	register_block_type( __DIR__ . '/build' );

	wp_set_script_translations(
		EDITOR_SCRIPT_HANDLE,
		'kronfink-before-after',
		plugin_dir_path( __FILE__ ) . 'languages'
	);
}
add_action( 'init', __NAMESPACE__ . '\register_block' );
