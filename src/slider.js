/**
 * Geometry and key handling shared by the front end (view.js) and the editor
 * preview (edit.js), so the two cannot drift apart.
 */

/** Percent moved per arrow key press; Shift switches to the fine step. */
export const KEY_STEP = 1;
export const FINE_KEY_STEP = 0.1;

const DIRECTIONS = {
	ArrowRight: 1,
	ArrowUp: 1,
	ArrowLeft: -1,
	ArrowDown: -1,
};

/**
 * Clamp to 0–100 and round to a tenth, the resolution the range input uses.
 *
 * @param {number} value Raw percentage.
 * @return {number} Clamped, rounded percentage.
 */
export function roundPercent( value ) {
	const clamped = Math.min( 100, Math.max( 0, value ) );

	return Math.round( clamped * 10 ) / 10;
}

/**
 * Map a pointer's clientX onto the frame as a percentage.
 *
 * @param {DOMRect|undefined} rect    The frame's bounding rect.
 * @param {number}            clientX Pointer position.
 * @return {number|null} Percentage, or null when the frame has no width yet.
 */
export function percentFromClientX( rect, clientX ) {
	if ( ! rect || ! rect.width ) {
		return null;
	}

	return roundPercent( ( ( clientX - rect.left ) / rect.width ) * 100 );
}

/**
 * The signed percentage an arrow key press should move the divider.
 *
 * @param {KeyboardEvent} event Key event on the range input.
 * @return {number} Delta in percent, 0 when the key is not ours.
 */
export function keyboardDelta( event ) {
	const direction = DIRECTIONS[ event.key ];

	if ( ! direction || event.altKey || event.ctrlKey || event.metaKey ) {
		return 0;
	}

	return direction * ( event.shiftKey ? FINE_KEY_STEP : KEY_STEP );
}

/**
 * Whether a mouse drag lost its release. Without pointer capture a mouse
 * button released outside the frame is reported elsewhere, and the next hover
 * would otherwise keep dragging. Touch and pen contacts are implicitly
 * captured by the browser, so their pointerup always arrives — and Safari does
 * not report `buttons` for touch moves, so they must not be judged by it.
 *
 * @param {PointerEvent} event Pointer move event.
 * @return {boolean} True when a mouse is moving with no button held.
 */
export function lostMouseRelease( event ) {
	return 'mouse' === event.pointerType && 0 === ( event.buttons & 1 );
}
