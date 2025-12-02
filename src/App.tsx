import React, { useState, useRef } from 'react';
import { processImageToYaml } from './YamlCodeProcessor.ts';

import { useStepper } from './hooks/useStepper.ts';
import { Header } from './components/Header.tsx';
import { ParticleSettings } from './components/ParticleSettings.tsx';
import { PlacementSettings } from './components/PlacementSettings.tsx';
import { PreviewArea } from './components/PreviewArea.tsx';
import { OutputArea } from './components/OutputArea.tsx';


function App() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [yamlOutput, setYamlOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>('Copy to Clipboard');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [particleType, setParticleType] = useState<string>('flame');
  const [amount, setAmount] = useState<number>(1);
  const [size, setSize] = useState<number>(1);
  const [repeat, setRepeat] = useState<number>(1);
  const [repeati, setRepeati] = useState<number>(20);
  const [useColor, setUseColor] = useState<boolean>(true);
  const [color, setColor] = useState<string>("#FFFFFF");
  const [color1, setColor1] = useState<string>("#FF0000");
  const [color2, setColor2] = useState<string>("#0000FF");
  const [material, setMaterial] = useState<string>("STONE");
  const [resolution, setResolution] = useState<number>(10);
  const [scale, setScale] = useState<number>(5);
  const [alphaThreshold, setAlphaThreshold] = useState<number>(128);
  const [maxParticles, setMaxParticles] = useState<number>(2000);
  const [skillName, setSkillName] = useState<string>('ImageParticleSkill');
  
  // --- ▼▼▼ 新機能（除外設定）の状態を追加 ▼▼▼ ---
  // (デフォルトはON（除外する）にしておきます)
  const [excludeWhite, setExcludeWhite] = useState<boolean>(true);
  const [excludeBlack, setExcludeBlack] = useState<boolean>(true);
  // --- ▲▲▲ ここまで ▲▲▲ ---
  
  const amountUpProps = useStepper(() => setAmount(a => a + 1));
  const amountDownProps = useStepper(() => setAmount(a => Math.max(1, a - 1)));
  const sizeUpProps = useStepper(() => setSize(s => parseFloat((s + 0.1).toFixed(1))));
  const sizeDownProps = useStepper(() => setSize(s => Math.max(0.1, parseFloat((s - 0.1).toFixed(1)))));
  const repeatUpProps = useStepper(() => setRepeat(r => r + 1));
  const repeatDownProps = useStepper(() => setRepeat(r => Math.max(1, r - 1)));
  const repeatiUpProps = useStepper(() => setRepeati(r => r + 1));
  const repeatiDownProps = useStepper(() => setRepeati(r => Math.max(1, r - 1)));
  const maxParticlesUpProps = useStepper(() => setMaxParticles(p => p + 100));
  const maxParticlesDownProps = useStepper(() => setMaxParticles(p => Math.max(100, p - 100)));


  const handleImageFile = (file: File | null) => {
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setError(null);
      setYamlOutput('');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setError('PNG または JPEG ファイルのみアップロード可能です。');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageFile(e.target.files ? e.target.files[0] : null);
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setYamlOutput('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    if (!yamlOutput) return;
    navigator.clipboard.writeText(yamlOutput)
      .then(() => {
        setCopyMessage('Copied!');
        setTimeout(() => setCopyMessage('Copy to Clipboard'), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setCopyMessage('Failed');
      });
  };
  
  const generateCode = () => {
    const imgEl = imageRef.current; 
    if (!imagePreview || !imgEl) { 
      setError('先に画像をアップロードしてください。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setYamlOutput('');

    const particleOptionsMap: Record<string, string[]> = {
      'reddust': ['color', 'size'], 
      'mobspell': ['color'],
      'spell': ['color'],
      'fallingdust': ['color', 'material'],
      'dust_color_transition': ['transition', 'size'],
    };

    const result = processImageToYaml({
      imageElement: imgEl, 
      canvasElement: canvasRef.current,
      resolution, scale, alphaThreshold,
      skillName, maxParticles,
      
      particleType, useColor,
      amount, size,
      repeat, repeati,
      color, color1, color2,
      material,
      availableOptions: particleOptionsMap[particleType] || [],
      
      // --- ▼▼▼ 新機能の値をロジックに渡す ▼▼▼ ---
      excludeWhite,
      excludeBlack,
      // --- ▲▲▲ ここまで ▲▲▲ ---
    });

    if (result.success) {
      setYamlOutput(result.yaml);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    handleImageFile(e.dataTransfer.files ? e.dataTransfer.files[0] : null);
  };


  return (
    <div className="App">
      <Header />

      <div className="container">
        <aside className="settings-panel">
          
          <div 
            className={`upload-section ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <h3>1. Upload Image</h3>
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
            {imagePreview && (
              <button onClick={handleClearImage} className="clear-button">
                Clear Image
              </button>
            )}
            {isDragging && (
              <div className="drop-overlay">
                Drop image here
              </div>
            )}
          </div>


          <div className="particle-section">
            <ParticleSettings 
              particleType={particleType} setParticleType={setParticleType}
              amount={amount} setAmount={setAmount}
              size={size} setSize={setSize}
              useColor={useColor} setUseColor={setUseColor}
              color={color} setColor={setColor}
              color1={color1} setColor1={setColor1}
              color2={color2} setColor2={setColor2}
              material={material} setMaterial={setMaterial}
              repeat={repeat} setRepeat={setRepeat}
              repeati={repeati} setRepeati={setRepeati}
              amountUpProps={amountUpProps}
              amountDownProps={amountDownProps}
              sizeUpProps={sizeUpProps}
              sizeDownProps={sizeDownProps}
              repeatUpProps={repeatUpProps}
              repeatDownProps={repeatDownProps}
              repeatiUpProps={repeatiUpProps}
              repeatiDownProps={repeatiDownProps}
            />
          </div>
          
          <div className="placement-section">
            <PlacementSettings
              resolution={resolution} setResolution={setResolution}
              scale={scale} setScale={setScale}
              alphaThreshold={alphaThreshold} setAlphaThreshold={setAlphaThreshold}
              maxParticles={maxParticles} setMaxParticles={setMaxParticles}
              skillName={skillName} setSkillName={setSkillName}
              maxParticlesUpProps={maxParticlesUpProps}
              maxParticlesDownProps={maxParticlesDownProps}
              
              // --- ▼▼▼ 新機能の props を渡す ▼▼▼ ---
              excludeWhite={excludeWhite}
              setExcludeWhite={setExcludeWhite}
              excludeBlack={excludeBlack}
              setExcludeBlack={setExcludeBlack}
              // --- ▲▲▲ ここまで ▲▲▲ ---
            />
          </div>

          <div className="generate-section">
            <h3>4. Generate Code</h3>
            <button
              onClick={generateCode}
              disabled={isLoading || !imagePreview}
              className="generate-button"
            >
              {isLoading ? 'Generating...' : 'Generate YAML Code'}
            </button>
          </div>
        </aside>

        <main className="result-area">
          
          <PreviewArea
            imagePreview={imagePreview}
            imageRef={imageRef}
            resolution={resolution}
            scale={scale}
            alphaThreshold={alphaThreshold}
            size={size}
            useColor={useColor}
            color={color}
            particleType={particleType}
          />

          <OutputArea
            yamlOutput={yamlOutput}
            error={error}
            copyMessage={copyMessage}
            handleCopy={handleCopy}
          />
        </main>
      </div>
    </div>
  );
}

export default App;