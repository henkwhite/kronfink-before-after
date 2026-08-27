/**
 * Frontend behaviour.
 *
 * The native range input stays responsible for keyboard control and the screen
 * reader announcement. Pointer input is handled here rather than left to it:
 * iOS Safari only drags a range from its thumb, while the thumb has to stay
 * zero-width so the divider lands exactly under the pointer. Both cannot hold
 * at once, so dragging is done against the frame's own geometry.
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
	const frame = block.querySelector( '.kf-ba__frame' );

	if ( ! range || ! frame ) {
		return;
	}

	const update = () => {
		block.style.setProperty( '--kf-ba-pos', `${ range.value }%` );
	};

	const setPosition = ( value ) => {
		range.value = Math.min( 100, Math.max( 0, value ) ).toFixed( 1 );
		update();
	};

	const setFromClientX = ( clientX ) => {
		const rect = frame.getBoundingClientRect();

		if ( ! rect.width ) {
			return;
		}

		setPosition( ( ( clientX - rect.left ) / rect.width ) * 100 );
	};

	let activePointer = null;

	frame.addEventListener( 'pointerdown', ( event ) => {
		if ( event.button > 0 ) {
			return;
		}

		activePointer = event.pointerId;

		try {
			frame.setPointerCapture( activePointer );
		} catch ( error ) {
			// Capture is an optimisation for pointers leaving the frame, not a
			// requirement — dragging still works through the listeners below.
		}

		// A touch only starts dragging once it actually moves, so that tapping
		// or scrolling past the image does not make the divider jump. With a
		// mouse, clicking somewhere is meant to jump there.
		if ( 'touch' !== event.pointerType ) {
			setFromClientX( event.clientX );
			event.preventDefault();

			// Focus only for pointing devices, so arrow keys carry on from where
			// the click landed. Doing it on touch makes Safari paint the focus
			// ring after every swipe, which is meant for keyboard users alone.
			range.focus( { preventScroll: true } );
		}
	} );

	frame.addEventListener( 'pointermove', ( event ) => {
		if ( event.pointerId !== activePointer ) {
			return;
		}

		setFromClientX( event.clientX );
		event.preventDefault();
	} );

	const endDrag = ( event ) => {
		if ( event.pointerId !== activePointer ) {
			return;
		}

		try {
			frame.releasePointerCapture( activePointer );
		} catch ( error ) {
			// The capture is already gone; nothing left to release.
		}

		activePointer = null;
	};

	frame.addEventListener( 'pointerup', endDrag );
	frame.addEventListener( 'pointercancel', endDrag );

	range.addEventListener( 'input', update );

	range.addEventListener( 'keydown', ( event ) => {
		const direction = DIRECTIONS[ event.key ];

		if ( ! direction || event.altKey || event.ctrlKey || event.metaKey ) {
			return;
		}

		event.preventDefault();

		const step = event.shiftKey ? FINE_KEY_STEP : KEY_STEP;

		setPosition( parseFloat( range.value ) + direction * step );
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
