import * as React from "react"
import { useSize } from "@/hooks/use-size"
import { cn } from "@/lib/utils"

const FALLBACK_IMAGE_URL =
  "https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png"

// Wix Media Platform hosts whose images support /v1/ transform URLs
// (resize, focal-point crop, and format conversion via the OUTPUT FILENAME
// EXTENSION — a .webp output re-encodes JPG/PNG uploads to WebP on the fly).
const WIX_MEDIA_HOSTS = ["media.base44.com", "static.wixstatic.com"]
// First-paint width before the container is measured.
const DEFAULT_TRANSFORM_WIDTH = 1024
const DEVICE_PIXEL_RATIOS = [1, 2, 3]
// Not a documented CDN limit — verified live that w_/h_ up to 10000 succeed
// and requests start failing somewhere between 10000 and 15000. This is a
// defensive ceiling with generous headroom (a 3x DPR request needs a
// ~2000px container to reach it), not a real constraint we expect to hit.
const MAX_DIMENSION = 6000

/**
 * Detects a Wix Media URL and strips any existing /v1/ transform so it can be
 * rebuilt. Returns null for other hosts and for SVGs (vectors — a raster
 * transform only downgrades them).
 */
function parseWixMediaUrl(src) {
  try {
    const url = new URL(src)
    if (!WIX_MEDIA_HOSTS.includes(url.hostname)) return null
    const v1 = url.pathname.indexOf("/v1/")
    const basePath = v1 === -1 ? url.pathname : url.pathname.slice(0, v1)
    const filename = basePath.split("/").pop()
    if (!filename || /\.svg$/i.test(filename)) return null
    return { baseUrl: `${url.origin}${basePath}`, filename }
  } catch {
    return null
  }
}

const clampDim = (n) => Math.min(Math.max(Math.round(n), 1), MAX_DIMENSION)
const clamp01 = (n) => Math.min(1, Math.max(0, n))

/**
 * Builds a Wix Media transform URL:
 * `<base>/v1/{fill|fit}/w_,h_[,fp_x_y|al_c],q_,usm_…/<name>.webp`
 * GIFs keep their extension (WebP output could drop animation).
 */
function buildTransformUrl({ baseUrl, filename }, { width, height, crop, focalPoint, quality }) {
  const params = [`w_${clampDim(width)}`, `h_${clampDim(height || width)}`]
  if (crop) {
    params.push(
      focalPoint
        ? `fp_${clamp01(focalPoint.x).toFixed(2)}_${clamp01(focalPoint.y).toFixed(2)}`
        : "al_c"
    )
  }
  params.push(`q_${quality}`, "usm_0.66_1.00_0.01", "enc_webp", "quality_auto")
  const outputName = /\.gif$/i.test(filename)
    ? filename
    : filename.replace(/\.[a-z0-9]+$/i, "") + ".webp"
  return `${baseUrl}/v1/${crop ? "fill" : "fit"}/${params.join(",")}/${outputName}`
}

function buildSrcSet(parsed, options) {
  return DEVICE_PIXEL_RATIOS.map(
    (dpr) =>
      `${buildTransformUrl(parsed, {
        ...options,
        width: options.width * dpr,
        height: options.height ? options.height * dpr : undefined,
      })} ${dpr}x`
  ).join(", ")
}

const ImageWrapper = React.forwardRef(({ aspectRatio, className, style, children }, ref) => (
  <span
    ref={ref}
    className={cn("inline-block relative", className)}
    style={{ aspectRatio, ...style }}
  >
    {children}
  </span>
))
ImageWrapper.displayName = "ImageWrapper"

const ResponsiveImage = React.forwardRef(
  ({ parsed, fittingType, focalPoint, quality, className, style, aspectRatio, onLoad, ...props }, parentRef) => {
    const wrapperRef = React.useRef(null)
    const imgRef = React.useRef(null)
    const size = useSize(wrapperRef)
    const [loaded, setLoaded] = React.useState(false)

    React.useImperativeHandle(parentRef, () => imgRef.current)

    // Reset the blur-up when the underlying image changes.
    React.useEffect(() => {
      setLoaded(false)
    }, [parsed.baseUrl])

    const crop = fittingType !== "fit"
    // `size` is null exactly once: the pre-measurement first render, which we
    // never let reach the network (see below — useSize measures before paint).
    // A *measured* zero (content-sized wrapper with no CSS dimensions) falls
    // back to a fixed transform width so the image itself can size the box.
    const options = size && {
      width: size.width || DEFAULT_TRANSFORM_WIDTH,
      height: size.height ? size.height : undefined,
      crop,
      focalPoint: crop ? focalPoint : undefined,
      quality,
    }

    // Both layers render only once the container is measured, so the first
    // URL the browser ever fetches is already the right size — never a
    // DEFAULT_TRANSFORM_WIDTH guess that gets replaced a frame later (a
    // wasted full-size download per image). useSize measures in
    // useLayoutEffect, so nothing is lost: measurement lands before the
    // first paint.
    return (
      <ImageWrapper ref={wrapperRef} aspectRatio={aspectRatio} className={className} style={style}>
        {/* Tiny blurred placeholder (a few hundred bytes) covering the main
            image's load time. Same crop shape and focal anchor as the main
            image — fp_ is relative to the crop box, so a square or centered
            placeholder would blur-preview a different region. */}
        {options && !loaded && (
          <img
            src={buildTransformUrl(parsed, {
              ...options,
              width: 20,
              height: options.height
                ? Math.max(1, Math.round((20 * options.height) / options.width))
                : undefined,
              quality: 20,
            })}
            alt=""
            aria-hidden="true"
            className="w-full h-full inset-0 absolute"
            style={{
              objectFit: fittingType === "fit" ? "contain" : "cover",
              filter: "blur(10px)",
              transform: "scale(1.1)",
            }}
          />
        )}
        {options && (
          <img
            ref={imgRef}
            src={buildTransformUrl(parsed, options)}
            srcSet={buildSrcSet(parsed, options)}
            loading="lazy"
            className={cn(
              "w-full h-full inset-0 absolute",
              fittingType === "fit" ? "object-contain" : "object-cover"
            )}
            onLoad={(e) => {
              setLoaded(true)
              onLoad?.(e)
            }}
            {...props}
          />
        )}
      </ImageWrapper>
    )
  }
)
ResponsiveImage.displayName = "ResponsiveImage"

/**
 * Image with built-in Wix Media Platform support: URLs on media.base44.com /
 * static.wixstatic.com are served resized to the rendered container (per
 * device pixel ratio) and re-encoded to WebP; `fittingType="fill"` crops
 * server-side, optionally anchored at a focal point. Other URLs render as a
 * plain <img>. Failed loads swap to a fallback image.
 */
const Image = React.forwardRef(
  (
    {
      src,
      fittingType = "fill",
      originWidth,
      originHeight,
      focalPointX,
      focalPointY,
      quality = 90,
      ...props
    },
    ref
  ) => {
    const [imgSrc, setImgSrc] = React.useState(src)

    React.useEffect(() => {
      setImgSrc(src)
    }, [src])

    const imageProps = {
      ...props,
      onError: () => setImgSrc(FALLBACK_IMAGE_URL),
    }

    if (!src) {
      // Renders as a real <img> (not a <div>) — the visual editor's
      // click-to-edit toolbar keys its "Replace Image" action off the DOM
      // tag being `img`, so a placeholder div would be unrecoverable in the
      // editor. FALLBACK_IMAGE_URL doubles as the "no image chosen" graphic.
      return <img ref={ref} src={FALLBACK_IMAGE_URL} {...imageProps} data-empty-image />
    }

    // The fallback renders as a plain <img> so a broken upload can't cascade
    // into a second (transformed) failing request.
    const parsed = imgSrc === FALLBACK_IMAGE_URL ? null : parseWixMediaUrl(imgSrc)

    if (!parsed) {
      const isErrorUrl = imgSrc === FALLBACK_IMAGE_URL
      return (
        <img ref={ref} src={imgSrc} {...imageProps} data-error-image={isErrorUrl || undefined} />
      )
    }

    const focalPoint =
      typeof focalPointX === "number" && typeof focalPointY === "number"
        ? { x: focalPointX, y: focalPointY }
        : undefined
    // Origin dimensions are optional — when known they stabilize layout via
    // the wrapper's aspect-ratio before the image loads.
    const aspectRatio =
      originWidth && originHeight ? `${originWidth} / ${originHeight}` : undefined

    return (
      <ResponsiveImage
        ref={ref}
        parsed={parsed}
        fittingType={fittingType}
        focalPoint={focalPoint}
        quality={quality}
        aspectRatio={aspectRatio}
        {...imageProps}
      />
    )
  }
)
Image.displayName = "Image"

export { Image }
