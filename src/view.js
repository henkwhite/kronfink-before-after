/**
 * Frontend behaviour.
 *
 * The native range input handles dragging, touch, click-to-jump, Home/End,
 * Page Up/Down and the screen reader announcement. Two things are added on top:
 * mirroring the value into the custom property the CSS clips against, and a
 * usable arrow key step — the input needs a fine `step` so dragging stays
 * smooth, but that same step would move the divider by 0.1% per key press.
 */
const KEY_STEP = 1;
const FINE_KEY_STEP = 0.1;

const DIRECTIONS = {
	ArrowRight: 1,
	ArrowUp: 1,
	ArrowLeft: -1,
	ArrowDown: -1,
};

function initBeforeAfter( block ) {
	const range = block.querySelector( '.kf-ba__range' );

	if ( ! range ) {
		return;
	}

	const update = () => {
		block.style.setProperty( '--kf-ba-pos', `${ range.value }%` );
	};

	range.addEventListener( 'input', update );

	range.addEventListener( 'keydown', ( event ) => {
		const direction = DIRECTIONS[ event.key ];

		if ( ! direction || event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		event.preventDefault();

		const step = event.shiftKey ? FINE_KEY_STEP : KEY_STEP;
		const next = Math.min(
			100,
			Math.max( 0, parseFloat( range.value ) + direction * step )
		);

		range.value = next.toFixed( 1 );
		update();
	} );

	update();
}

function run() {
	document
		.querySelectorAll( '.wp-block-kronfink-before-after' )
		.forEach( initBeforeAfter );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', run );
} else {
	run();
}
