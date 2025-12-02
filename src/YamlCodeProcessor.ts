function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

export interface GenerateCodeParams {
  imageElement: HTMLImageElement;
  canvasElement: HTMLCanvasElement;
  resolution: number;
  scale: number;
  alphaThreshold: number;
  skillName: string;
  maxParticles: number;
  
  particleType: string;
  useColor: boolean; 
  amount: number;
  size: number;
  repeat: number;
  repeati: number;
  color: string; 
  color1: string;
  color2: string;
  material: string;

  availableOptions: string[];
  excludeWhite: boolean;
  excludeBlack: boolean;
}

export type ProcessResult = {
  success: true;
  yaml: string;
} | {
  success: false;
  error: string;
};

export const processImageToYaml = (params: GenerateCodeParams): ProcessResult => {
  const {
    imageElement,
    canvasElement,
    resolution,
    scale,
    alphaThreshold,
    skillName,
    maxParticles,
    
    particleType,
    useColor,
    amount,
    size,
    repeat,
    repeati,
    color,
    color1,
    color2,
    material,
    availableOptions,
    excludeWhite,
    excludeBlack,
  } = params;


  const ctx = canvasElement.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    return { success: false, error: 'Canvasのコンテキスト取得に失敗しました。' };
  }

  canvasElement.width = imageElement.naturalWidth;
  canvasElement.height = imageElement.naturalHeight;

  ctx.drawImage(imageElement, 0, 0);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
  } catch (e) {
    console.error("Failed to get image data (CORS issue?):", e); 
    return { 
      success: false, 
      error: '画像の解析に失敗しました。ローカル画像でない場合、CORSポリシーに違反している可能性があります。' 
    };
  }

  const data = imageData.data;
  const width = canvasElement.width;
  const height = canvasElement.height;
  
  const particleOptions: string[] = [];
  particleOptions.push(`p=${particleType}`);
  particleOptions.push(`a=${amount}`);
  
  if (repeat > 1) { 
    particleOptions.push(`repeat=${repeat}`);
    particleOptions.push(`repeati=${repeati}`);
  }
  
  if (availableOptions.includes('size')) {
    particleOptions.push(`size=${size}`);
  }
  if (availableOptions.includes('material')) {
    particleOptions.push(`material=${material.toUpperCase()}`);
  }
  if (availableOptions.includes('transition')) {
    particleOptions.push(`color1=${color1}`);
    particleOptions.push(`color2=${color2}`);
  }
  
  if (availableOptions.includes('color') && !useColor) {
    particleOptions.push(`color=${color}`);
  }

  const staticOptionsString = particleOptions.join(';');

  const particleLines: string[] = [];
  const step = Math.max(1, resolution);

  const centerX = width / 2;
  const centerY = height / 2;
  
  // ▼▼▼ 除外色のしきい値を設定（完全な0, 255だと JPEG のノイズに弱いため）▼▼▼
  const whiteThreshold = 240; // この値よりR,G,Bが「すべて」高いピクセルは白とみなす
  const blackThreshold = 15;  // この値よりR,G,Bが「すべて」低いピクセルは黒とみなす

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3]; 

      if (a >= alphaThreshold) {
        if (excludeWhite && r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
          continue;
        }
        if (excludeBlack && r < blackThreshold && g < blackThreshold && b < blackThreshold) {
          continue; 
        }

        const offsetX = ((x - centerX) / width) * scale;
        const offsetY = ((centerY - y) / width) * scale;
        const offsetZ = 0; 

        let dynamicOptions = "";
        if (availableOptions.includes('color') && useColor) {
          const hexColor = rgbToHex(r, g, b);
          dynamicOptions = `;color=${hexColor}`;
        }
        
        const particleBlock = `e:p{${staticOptionsString}${dynamicOptions}}`;
        const originBlock = `@origin{xoffset=${offsetX.toFixed(3)};yoffset=${offsetY.toFixed(3)};zoffset=${offsetZ.toFixed(3)}}`;
        
        const particleLine = `- ${particleBlock} ${originBlock}`;
        
        particleLines.push(particleLine);

        if (particleLines.length >= maxParticles) {
          const yaml = `${skillName}:
  SkillTriggers:
  - CHAT message="<caster.name> image"
  Skills:
  # Total Particles: ${particleLines.length} (MAXIMUM REACHED)
${particleLines.map((line) => `  ${line}`).join('\n')}`;
          return { success: true, yaml: yaml };
        }
      }
    }
  }

  if (particleLines.length > 0) {
    const yaml = `${skillName}:
  SkillTriggers:
  - CHAT message="<caster.name> image"
  Skills:
  # Total Particles: ${particleLines.length}
${particleLines.map((line) => `  ${line}`).join('\n')}`;
    
    return { success: true, yaml: yaml };
  } else {
    return { success: false, error: 'パーティクルを生成できませんでした。透明度閾値が高すぎるか、画像が透明です。' };
  }
};