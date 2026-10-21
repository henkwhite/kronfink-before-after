import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	PanelColorSettings,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	FocalPointPicker,
	Notice,
	PanelBody,
	RangeControl,
	TextControl,
} from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';

import {
	lostMouseRelease,
	keyboardDelta,
	percentFromClientX,
	roundPercent,
} from './slider';

import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

/**
 * Two aspect ratios count as different once they are more than 1% apart —
 * below that the crop is invisible and a warning would only be noise.
 */
const RATIO_TOLERANCE = 0.01;

function hasRatioMismatch( before, after ) {
	const b = before?.media_details;
	const a = after?.media_details;

	if ( ! b?.width || ! b?.height || ! a?.width || ! a?.height ) {
		return false;
	}

	const beforeRatio = b.width / b.height;
	const afterRatio = a.width / a.height;

	return Math.abs( beforeRatio - afterRatio ) / beforeRatio > RATIO_TOLERANCE;
}

export default function Edit( { attributes, setAttributes, isSelected } ) {
	const {
		beforeId,
		beforeUrl,
		beforeAlt,
		beforeLabel,
		afterId,
		afterUrl,
		afterAlt,
		afterLabel,
		afterFocalPoint,
		startPosition,
		handleColor,
	} = attributes;

	// Dragging in the editor is preview only. If it wrote back to startPosition,
	// merely looking at the block would mark the post as modified.
	const [ previewPosition, setPreviewPosition ] = useState( startPosition );

	useEffect( () => {
		setPreviewPosition( startPosition );
	}, [ startPosition ] );

	const { beforeMedia, afterMedia } = useSelect(
		( select ) => ( {
			beforeMedia: beforeId ? select( coreStore ).getMedia( beforeId ) : null,
			afterMedia: afterId ? select( coreStore ).getMedia( afterId ) : null,
		} ),
		[ beforeId, afterId ]
	);

	const isSetup = ! beforeUrl || ! afterUrl;

	const blockProps = useBlockProps( {
		className: isSetup ? 'kf-ba--setup' : undefined,
		style: isSetup
			? undefined
			: {
					'--kf-ba-pos': `${ previewPosition }%`,
					'--kf-ba-after-pos': `${ ( afterFocalPoint?.x ?? 0.5 ) * 100 }% ${
						( afterFocalPoint?.y ?? 0.5 ) * 100
					}%`,
					...( handleColor ? { '--kf-ba-handle': handleColor } : {} ),
			  },
	} );

	const onSelectBefore = ( media ) =>
		setAttributes( { beforeId: media?.id ?? 0, beforeUrl: media?.url ?? '' } );

	const onSelectAfter = ( media ) =>
		setAttributes( { afterId: media?.id ?? 0, afterUrl: media?.url ?? '' } );

	// Pointer handling mirrors view.js: the range cannot serve as the drag
	// target, because iOS Safari only drags it from its thumb and the thumb has
	// to stay zero-width for the divider to track the pointer exactly.
	const frameRef = useRef( null );
	const activePointer = useRef( null );
	const dragPosition = useRef( null );

	// While dragging, the custom property is written straight to the figure and
	// committed to state once on release. A state update per pointermove would
	// re-render the whole block, labels included, for every pixel moved.
	const paintPosition = ( value ) => {
		dragPosition.current = value;
		frameRef.current?.parentElement?.style.setProperty(
			'--kf-ba-pos',
			`${ value }%`
		);
	};

	const commitPosition = () => {
		if ( null !== dragPosition.current ) {
			setPreviewPosition( dragPosition.current );
			dragPosition.current = null;
		}
	};

	const positionFromEvent = ( event ) =>
		percentFromClientX(
			frameRef.current?.getBoundingClientRect(),
			event.clientX
		);

	const onPointerUp = ( event ) => {
		if ( event.pointerId !== activePointer.current ) {
			return;
		}

		try {
			event.currentTarget.releasePointerCapture( event.pointerId );
		} catch ( error ) {
			// Already released.
		}

		activePointer.current = null;
		commitPosition();
	};

	const onPointerDown = ( event ) => {
		// The labels sit above the frame and stay editable.
		if ( event.button > 0 || event.target.closest( '.kf-ba__label' ) ) {
			return;
		}

		activePointer.current = event.pointerId;

		try {
			event.currentTarget.setPointerCapture( event.pointerId );
		} catch ( error ) {
			// See view.js: capture is an optimisation, not a requirement.
		}

		if ( 'touch' !== event.pointerType ) {
			const next = positionFromEvent( event );

			if ( null !== next ) {
				paintPosition( next );
			}
		}
	};

	const onPointerMove = ( event ) => {
		if ( event.pointerId !== activePointer.current ) {
			return;
		}

		// A mouse release that happened somewhere we never heard about it.
		if ( lostMouseRelease( event ) ) {
			onPointerUp( event );
			return;
		}

		const next = positionFromEvent( event );

		if ( null !== next ) {
			paintPosition( next );
		}
	};

	const onRangeKeyDown = ( event ) => {
		const delta = keyboardDelta( event );

		if ( ! delta ) {
			return;
		}

		event.preventDefault();
		setPreviewPosition( ( current ) => roundPercent( current + delta ) );
	};

	if ( isSetup ) {
		return (
			<div { ...blockProps }>
				<MediaPlaceholder
					icon="format-image"
					labels={ { title: __( 'Before image', 'kronfink-before-after' ) } }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					multiple={ false }
					onSelect={ onSelectBefore }
					mediaPreview={
						beforeUrl ? <img src={ beforeUrl } alt="" /> : undefined
					}
				/>
				<MediaPlaceholder
					icon="format-image"
					labels={ { title: __( 'After image', 'kronfink-before-after' ) } }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					multiple={ false }
					onSelect={ onSelectAfter }
					mediaPreview={
						afterUrl ? <img src={ afterUrl } alt="" /> : undefined
					}
				/>
			</div>
		);
	}

	return (
		<>
			<BlockControls group="other">
				<MediaReplaceFlow
					mediaId={ beforeId }
					mediaURL={ beforeUrl }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					onSelect={ onSelectBefore }
					name={ __( 'Replace before', 'kronfink-before-after' ) }
				/>
				<MediaReplaceFlow
					mediaId={ afterId }
					mediaURL={ afterUrl }
					allowedTypes={ ALLOWED_MEDIA_TYPES }
					accept="image/*"
					onSelect={ onSelectAfter }
					name={ __( 'Replace after', 'kronfink-before-after' ) }
				/>
			</BlockControls>

			<InspectorControls>
				<PanelBody title={ __( 'Comparison', 'kronfink-before-after' ) }>
					{ hasRatioMismatch( beforeMedia, afterMedia ) && (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'The two images have different aspect ratios. The after image is cropped to match the before image.',
								'kronfink-before-after'
							) }
						</Notice>
					) }
					<RangeControl
						__nextHasNoMarginBottom
						label={ __( 'Start position', 'kronfink-before-after' ) }
						value={ startPosition }
						onChange={ ( value ) =>
							setAttributes( {
								startPosition: undefined === value ? 50 : value,
							} )
						}
						min={ 0 }
						max={ 100 }
						step={ 1 }
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'Before image alt text', 'kronfink-before-after' ) }
						value={ beforeAlt }
						onChange={ ( value ) => setAttributes( { beforeAlt: value } ) }
						placeholder={
							beforeMedia?.alt_text ||
							__( 'Taken from the media library', 'kronfink-before-after' )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						label={ __( 'After image alt text', 'kronfink-before-after' ) }
						value={ afterAlt }
						onChange={ ( value ) => setAttributes( { afterAlt: value } ) }
						placeholder={
							afterMedia?.alt_text ||
							__( 'Taken from the media library', 'kronfink-before-after' )
						}
					/>
					<FocalPointPicker
						__nextHasNoMarginBottom
						label={ __( 'Visible section of the after image', 'kronfink-before-after' ) }
						help={ __(
							'Decides which part stays in view when the after image is cropped to the before image.',
							'kronfink-before-after'
						) }
						url={ afterUrl }
						value={ afterFocalPoint }
						onChange={ ( value ) =>
							setAttributes( { afterFocalPoint: value } )
						}
					/>
				</PanelBody>

				<PanelColorSettings
					__experimentalIsRenderedInSidebar
					title={ __( 'Colour', 'kronfink-before-after' ) }
					colorSettings={ [
						{
							value: handleColor,
							onChange: ( value ) =>
								setAttributes( { handleColor: value || '' } ),
							label: __( 'Divider and handle', 'kronfink-before-after' ),
						},
					] }
				/>
			</InspectorControls>

			<figure { ...blockProps }>
				<div
					className="kf-ba__frame"
					ref={ frameRef }
					onPointerDown={ onPointerDown }
					onPointerMove={ onPointerMove }
					onPointerUp={ onPointerUp }
					onPointerCancel={ onPointerUp }
				>
					<img className="kf-ba__img" src={ beforeUrl } alt="" />

					{ ( isSelected || beforeLabel ) && (
						<RichText
							tagName="span"
							className="kf-ba__label kf-ba__label--before"
							value={ beforeLabel }
							onChange={ ( value ) =>
								setAttributes( { beforeLabel: value } )
							}
							placeholder={ __( 'Before', 'kronfink-before-after' ) }
							allowedFormats={ [] }
						/>
					) }

					<div className="kf-ba__after">
						<img className="kf-ba__img" src={ afterUrl } alt="" />

						{ ( isSelected || afterLabel ) && (
							<RichText
								tagName="span"
								className="kf-ba__label kf-ba__label--after"
								value={ afterLabel }
								onChange={ ( value ) =>
									setAttributes( { afterLabel: value } )
								}
								placeholder={ __( 'After', 'kronfink-before-after' ) }
								allowedFormats={ [] }
							/>
						) }
					</div>

					<div className="kf-ba__line" aria-hidden="true">
						<span className="kf-ba__handle" />
					</div>

					<input
						className="kf-ba__range"
						type="range"
						min="0"
						max="100"
						step="0.1"
						value={ previewPosition }
						onChange={ ( event ) =>
							setPreviewPosition( parseFloat( event.target.value ) )
						}
						onKeyDown={ onRangeKeyDown }
						aria-label={ __(
							'Comparison position between the before and after image',
							'kronfink-before-after'
						) }
					/>
				</div>
			</figure>
		</>
	);
}
