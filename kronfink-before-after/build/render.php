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

$kf_handle_color = isset( $attributes['handleColor'] ) ? (string) $attributes['handleColor'] : '';
if ( '' !== $kf_handle_color ) {
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
			<span class="kf-ba__label kf-ba__label--before"><?php echo wp_kses_post( $kf_before_label ); ?></span>
		<?php endif; ?>

		<div class="kf-ba__after">
			<?php echo $kf_after_img; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Escaped by wp_get_attachment_image(). ?>
			<?php if ( '' !== $kf_after_label ) : ?>
				<span class="kf-ba__label kf-ba__label--after"><?php echo wp_kses_post( $kf_after_label ); ?></span>
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
