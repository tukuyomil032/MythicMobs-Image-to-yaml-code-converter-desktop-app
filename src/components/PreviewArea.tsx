import React, { useRef, useEffect, useState } from 'react';

interface PreviewAreaProps {
  imagePreview: string | null;
  imageRef: React.RefObject<HTMLImageElement | null>;
  resolution: number;
  scale: number;
  alphaThreshold: number;
  size: number;
  useColor: boolean;
  color: string;
  particleType: string;
}

const drawParticlePreview = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  props: PreviewAreaProps
) => {
  const canvas = ctx.canvas;
  const { resolution, scale, alphaThreshold, size, useColor, color, particleType } = props;

  const canvasWidth = canvas.clientWidth;
  const aspect = 1;
  const canvasHeight = canvasWidth / aspect;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvasWidth * dpr;
  canvas.height = canvasHeight * dpr;
  ctx.scale(dpr, dpr);

  const drawWidth = canvasWidth;
  const drawHeight = canvasHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.globalAlpha = 0.3;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  let drawImgWidth = drawWidth;
  let drawImgHeight = drawHeight;
  if (imgAspect > aspect) {
    drawImgHeight = drawWidth / imgAspect;
  } else {
    drawImgWidth = drawHeight * imgAspect;
  }
  const imgX = (drawWidth - drawImgWidth) / 2;
  const imgY = (drawHeight - drawImgHeight) / 2;
  ctx.drawImage(img, imgX, imgY, drawImgWidth, drawImgHeight);
  ctx.globalAlpha = 1.0;


  const hiddenCanvas = document.createElement('canvas');
  hiddenCanvas.width = img.naturalWidth;
  hiddenCanvas.height = img.naturalHeight;
  const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true });
  if (!hiddenCtx) return;

  hiddenCtx.drawImage(img, 0, 0);
  let imageData: ImageData;
  try {
     imageData = hiddenCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
  } catch(e) {
    console.error("プレビュー用の画像データ取得に失敗（CORSの可能性があります）", e);
    ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx.font = "12px Roboto, sans-serif";
    ctx.fillText("CORS Error: Cannot read pixels", 10, 20);
    return;
  }
  const data = imageData.data;

  const step = Math.max(1, resolution);
  const particleRadius = (size / scale) * (drawWidth / 20);

  const imgWidth = img.naturalWidth;
  for (let y = 0; y < img.naturalHeight; y += step) {
    for (let x = 0; x < imgWidth; x += step) {
      const index = (y * imgWidth + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      if (a >= alphaThreshold) {
        const drawX = ((x / imgWidth) * drawImgWidth) + imgX;
        const drawY = ((y / img.naturalHeight) * drawImgHeight) + imgY;

        if (particleType === 'reddust' && useColor) {
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        } else {
          ctx.fillStyle = color;
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, Math.max(0.5, particleRadius), 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

export const PreviewArea: React.FC<PreviewAreaProps> = (props) => {
  const { imagePreview, imageRef, particleType } = props;
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (imagePreview) {
      setShouldAnimate(true);
    }
  }, [imagePreview]);

  const isPreviewSupported = particleType === 'reddust';

  useEffect(() => {
    if (!previewCanvasRef.current || !imageRef.current || !imagePreview) return;

    const ctx = previewCanvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;

    if (isPreviewSupported) {
      if (img.complete && img.naturalWidth > 0) {
        drawParticlePreview(ctx, img, props);
      } else {
        const handleLoad = ()=> {
          if(img) {
             drawParticlePreview(ctx, img, props);
          }
        };
        img.addEventListener('load', handleLoad);
        return () => {
          img.removeEventListener('load', handleLoad);
        };
      }
    }

  }, [
    imagePreview,
    imageRef,
    props,
    isPreviewSupported
  ]);


  return (
    <div className="preview-box">
      <h3>Image Preview</h3>
        <div className="preview-split-container">
          <div className="preview-pane original-image-pane">
            {imagePreview && <div className="preview-pane-label">Uploaded Image</div>}
            {imagePreview ? (
              <img
                ref={imageRef}
                src={imagePreview}
                alt="Uploaded preview"
                crossOrigin="anonymous"
                className={shouldAnimate ? 'image-popup' : ''}
                onAnimationEnd={() => setShouldAnimate(false)}
              />
            ) : (
              <p>Upload Image</p>
            )}
          </div>
          <div className="preview-divider"></div>
          <div className="preview-pane particle-preview-pane">
            {imagePreview && <div className="preview-pane-label">In Game</div>}
            {imagePreview ? (
              <>
                <canvas
                  ref={previewCanvasRef}
                  style={{ display: isPreviewSupported ? 'block' : 'none' }} // サポート時のみ表示
                ></canvas>

                {!isPreviewSupported && (
                  <div className="preview-disabled-overlay">
                    <span className="disabled-title">In-game preview is disabled.</span>
                    <span className="disabled-subtitle">The currently selected particle does not support in-game preview.</span>
                  </div>
                )}
              </>
            ) : (
              <p>Game Preview</p>
            )}
          </div>
        </div>
    </div>
  );
};