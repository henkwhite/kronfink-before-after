<?php
/**
 * Server-side markup for the kronfink/before-after block.
 *
 * Rendering in PHP rather than baking HTML into the post content buys three things:
 * wp_get_attachment_image() supplies srcset/sizes/lazy loading, markup fixes reach
 * existing posts, and the block can never trip the editor's validation.
 *
 * @package Kronfink\BeforeAfter
 *
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$kf_before_id = isset( $attributes['beforeId'] ) ? (int) $attributes['beforeId'] : 0;
$kf_after_id  = isset( $attributes['afterId'] ) ? (int) $attributes['afterId'] : 0;

// An incomplete block renders nothing rather than an empty frame.
if ( ! $kf_before_id || ! $kf_after_id ) {
	return;
}

$kf_before_alt  = isset( $attributes['beforeAlt'] ) ? trim( (string) $attributes['beforeAlt'] ) : '';
$kf_after_alt   = isset( $attributes['afterAlt'] ) ? trim( (string) $attributes['afterAlt'] ) : '';
$kf_before_args = array( 'class' => 'kf-ba__img' );
$kf_after_args  = array( 'class' => 'kf-ba__img' );

// An empty override falls back to the alt text stored in the media library.
if ( '' !== $kf_before_alt ) {
	$kf_before_args['alt'] = $kf_before_alt;
}
if ( '' !== $kf_after_alt ) {
	$kf_after_args['alt'] = $kf_after_alt;
}

$kf_before_img = wp_get_attachment_image( $kf_before_id, 'full', false, $kf_before_args );
$kf_after_img  = wp_get_attachment_image( $kf_after_id, 'full', false, $kf_after_args );

// A deleted attachment leaves an empty string behind.
if ( ! $kf_before_img || ! $kf_after_img ) {
	return;
}

$kf_position = isset( $attributes['startPosition'] ) ? (float) $attributes['startPosition'] : 50.0;
$kf_position = max( 0.0, min( 100.0, $kf_position ) );
$kf_position = rtrim( rtrim( number_format( $kf_position, 2, '.', '' ), '0' ), '.' );
$kf_position = '' === $kf_position ? '0' : $kf_position;

$kf_style = '--kf-ba-pos:' . $kf_position . '%;';

/*
 * Focal point for the after image, which is the one object-fit crops. Both
 * values are numeric and clamped, so nothing can travel into the style
 * attribute that is not a percentage.
 */
$kf_focal   = isset( $attributes['afterFocalPoint'] ) && is_array( $attributes['afterFocalPoint'] )
	? $attributes['afterFocalPoint']
	: array();
$kf_focal_x = isset( $kf_focal['x'] ) ? (float) $kf_focal['x'] : 0.5;
$kf_focal_y = isset( $kf_focal['y'] ) ? (float) $kf_focal['y'] : 0.5;
$kf_focal_x = max( 0.0, min( 1.0, $kf_focal_x ) ) * 100;
$kf_focal_y = max( 0.0, min( 1.0, $kf_focal_y ) ) * 100;

if ( 50.0 !== $kf_focal_x || 50.0 !== $kf_focal_y ) {
	$kf_style .= sprintf(
		'--kf-ba-after-pos:%s%% %s%%;',
		rtrim( rtrim( number_format( $kf_focal_x, 2, '.', '' ), '0' ), '.' ),
		rtrim( rtrim( number_format( $kf_focal_y, 2, '.', '' ), '0' ), '.' )
	);
}

$kf_handle_color = isset( $attributes['handleColor'] ) ? trim( (string) $attributes['handleColor'] ) : '';

/*
 * The value goes into a custom property, and safecss_filter_attr() does not look
 * inside those — so an unchecked value could smuggle whole CSS declarations into
 * the style attribute. Only real colour syntax is let through: hex, a CSS
 * variable (theme palette colours arrive as var(--wp--preset--color--x)), a bare
 * keyword such as "transparent", or rgb()/hsl(). Anything else is dropped.
 *
 * Note that rgb()/hsl() pass this check but never reach the page: core's
 * safecss_filter_attr() rejects any declaration using a function other than
 * var/calc/min/max/minmax/clamp/repeat. The branch is kept so the picker's
 * output keeps working the day core lifts that limit, but do not enable the
 * colour picker's alpha channel expecting it to work today.
 */
$kf_color_pattern = '/^(#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([0-9a-z.,%\/ -]+\)|var\(\s*--[a-z0-9-]+\s*\)|[a-z]+)$/i';

if ( '' !== $kf_handle_color && preg_match( $kf_color_pattern, $kf_handle_color ) ) {
	$kf_style .= '--kf-ba-handle:' . $kf_handle_color . ';';
}

$kf_before_label = isset( $attributes['beforeLabel'] ) ? trim( (string) $attributes['beforeLabel'] ) : '';
$kf_after_label  = isset( $attributes['afterLabel'] ) ? trim( (string) $attributes['afterLabel'] ) : '';

$kf_wrapper_attributes = get_block_wrapper_attributes( array( 'style' => $kf_style ) );
?>
<figure <?php echo $kf_wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by get_block_wrapper_attributes(). ?>>
	<div class="kf-ba__frame">
		<?php echo $kf_before_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by wp_get_attachment_image(). ?>
		<?php if ( '' !== $kf_before_label ) : ?>
			<span class="kf-ba__label kf-ba__label--before"><?php echo wp_kses( $kf_before_label, array() ); ?></span>
		<?php endif; ?>

		<div class="kf-ba__after">
			<?php echo $kf_after_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by wp_get_attachment_image(). ?>
			<?php if ( '' !== $kf_after_label ) : ?>
				<span class="kf-ba__label kf-ba__label--after"><?php echo wp_kses( $kf_after_label, array() ); ?></span>
			<?php endif; ?>
		</div>

		<div class="kf-ba__line" aria-hidden="true"><span class="kf-ba__handle"></span></div>

		<input
			class="kf-ba__range"
			type="range"
			min="0"
			max="100"
			step="0.1"
			value="<?php echo esc_attr( $kf_position ); ?>"
			aria-label="<?php esc_attr_e( 'Comparison position between the before and after image', 'kronfink-before-after' ); ?>"
		/>
	</div>
</figure>
