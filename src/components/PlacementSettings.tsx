import React from 'react';
import { TooltipLabel } from './TooltipLabel.tsx';

interface PlacementSettingsProps {
  resolution: number;
  setResolution: (val: number) => void;
  scale: number;
  setScale: (val: number) => void;
  alphaThreshold: number;
  setAlphaThreshold: (val: number) => void;
  maxParticles: number;
  setMaxParticles: (val: number) => void;
  skillName: string;
  setSkillName: (val: string) => void;

  maxParticlesUpProps: any;
  maxParticlesDownProps: any;
  
  // --- ▼▼▼ 新機能の props を追加 ▼▼▼ ---
  excludeWhite: boolean;
  setExcludeWhite: (val: boolean) => void;
  excludeBlack: boolean;
  setExcludeBlack: (val: boolean) => void;
  // --- ▲▲▲ ここまで ▲▲▲ ---
}

export const PlacementSettings: React.FC<PlacementSettingsProps> = (props) => {
  return (
    <>
      <h3>3. Placement Settings</h3>
      <div className="setting-item">
        <TooltipLabel
          label={`Resolution (解像度): ${props.resolution}px`}
          description="画像の何ピクセルごとに1パーティクルを配置するか。値が小さいほど高精細（＝重い）。"
        />
        <input
          type="range" id="resolution" min="1" max="50" step="1"
          value={props.resolution}
          onChange={(e) => props.setResolution(Number(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <TooltipLabel
          label={`Scale (サイズ): ${props.scale} ブロック`}
          description="画像全体の「幅」をMinecraftの何ブロックに相当させるか。"
        />
        <input
          type="range" id="scale" min="1" max="50" step="0.5"
          value={props.scale}
          onChange={(e) => props.setScale(Number(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <TooltipLabel
          label={`Alpha Threshold (透明度閾値): ${props.alphaThreshold}`}
          description="この値より不透明なピクセルのみパーティクルを配置 (0=すべて, 255=ほぼ不透明のみ)。"
        />
        <input
          type="range" id="threshold" min="0" max="255" step="1"
          value={props.alphaThreshold}
          onChange={(e) => props.setAlphaThreshold(Number(e.target.value))}
        />
      </div>

      <div className="setting-item">
        <TooltipLabel
          label="Max Particles (最大パーティクル数)"
          description="サーバー負荷対策。これを超えると生成を停止します。"
        />
        <div className="number-input-wrapper">
          <input
            type="number" id="maxParticles" min="100" max="20000" step="100"
            value={props.maxParticles}
            onChange={(e) => props.setMaxParticles(Number(e.target.value))}
          />
          <div className="number-input-arrows">
            <button type="button" {...props.maxParticlesUpProps} tabIndex={-1}>▲</button>
            <button type="button" {...props.maxParticlesDownProps} tabIndex={-1}>▼</button>
          </div>
        </div>
      </div>

      {/* --- ▼▼▼ 新機能（除外トグル）のUIを追加 ▼▼▼ --- */}
      {/* (※標準のチェックボックスを使いますが、`setting-item` が左右に配置してくれます) */}
      <div className="setting-item">
        <TooltipLabel
          label="白に近い色を除外"
          description="パフォーマンス向上のため、背景色(R,G,B > 240)を無視します。白いロゴの場合はOFFにしてください。"
        />
        <input
          type="checkbox"
          id="excludeWhite"
          checked={props.excludeWhite}
          onChange={(e) => props.setExcludeWhite(e.target.checked)}
          className="large-checkbox" // (※もしスタイルがあれば。なくても機能します)
        />
      </div>
      
      <div className="setting-item">
        <TooltipLabel
          label="黒に近い色を除外"
          description="パフォーマンス向上のため、背景色(R,G,B < 15)を無視します。黒いロゴの場合はOFFにしてください。"
        />
        <input
          type="checkbox"
          id="excludeBlack"
          checked={props.excludeBlack}
          onChange={(e) => props.setExcludeBlack(e.target.checked)}
          className="large-checkbox"
        />
      </div>
      {/* --- ▲▲▲ ここまで ▲▲▲ --- */}
      
      <div className="setting-item">
        <TooltipLabel
          label="Skill Name (スキル名)"
          description="生成されるMythicMobsスキル名。"
        />
        <input
          type="text"
          id="skillName"
          value={props.skillName}
          onChange={(e) => props.setSkillName(e.target.value)}
        />
      </div>
    </>
  );
};