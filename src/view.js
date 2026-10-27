/**
 * Frontend behaviour.
 *
 * The native range input stays responsible for keyboard control and the screen
 * reader announcement. Pointer input is handled here rather than left to it:
 * iOS Safari only drags a range from its thumb, while the thumb has to stay
 * zero-width so the divider lands exactly under the pointer. Both cannot hold
 * at once, so dragging is done against the frame's own geometry.
 */
import {
	lostMouseRelease,
	keyboardDelta,
	percentFromClientX,
	roundPercent,
} from './slider';

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
		range.value = roundPercent( value ).toFixed( 1 );
		update();
	};

	const setFromClientX = ( clientX ) => {
		const next = percentFromClientX( frame.getBoundingClientRect(), clientX );

		if ( null !== next ) {
			setPosition( next );
		}
	};

	let activePointer = null;

	/* Focus that a pointer caused must not show the keyboard ring; see style.scss. */
	let pointerFocus = false;
	const KEYBOARD_CLASS = 'kf-ba--keyboard';

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
			pointerFocus = true;
			range.focus( { preventScroll: true } );
			pointerFocus = false;
		}
	} );

	range.addEventListener( 'focus', () => {
		if ( ! pointerFocus ) {
			block.classList.add( KEYBOARD_CLASS );
		}
	} );

	range.addEventListener( 'blur', () => {
		block.classList.remove( KEYBOARD_CLASS );
	} );

	frame.addEventListener( 'pointermove', ( event ) => {
		if ( event.pointerId !== activePointer ) {
			return;
		}

		// A mouse release that happened somewhere we never heard about it.
		if ( lostMouseRelease( event ) ) {
			endDrag( event );
			return;
		}

		setFromClientX( event.clientX );
		event.preventDefault();
	} );

	frame.addEventListener( 'pointerup', endDrag );
	frame.addEventListener( 'pointercancel', endDrag );

	range.addEventListener( 'input', update );

	range.addEventListener( 'keydown', ( event ) => {
		const delta = keyboardDelta( event );

		if ( ! delta ) {
			return;
		}

		event.preventDefault();
		// Keys after a click: the ring appears once the keyboard takes over.
		block.classList.add( KEYBOARD_CLASS );
		setPosition( parseFloat( range.value ) + delta );
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
