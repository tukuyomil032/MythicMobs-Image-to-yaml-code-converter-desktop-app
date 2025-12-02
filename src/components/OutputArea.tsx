import React from 'react';

interface OutputAreaProps {
  yamlOutput: string;
  error: string | null;
  copyMessage: string;
  handleCopy: () => void;
  isLoading: boolean;
}


export const OutputArea: React.FC<OutputAreaProps> = ({
  yamlOutput,
  error,
  copyMessage,
  handleCopy,
  isLoading
}) => {

  return (
    <div className="output-box">
  	  <h3>Generated MythicMobs YAML</h3>
  	  {error && <p className="error">{error}</p>}
  	  <button
  	    className="copy-button"
  	    onClick={handleCopy}
  	    disabled={!yamlOutput || isLoading}
  	  >
  	    {copyMessage}
  	  </button>

      {isLoading ? (
        <div className="loader-wrapper">
          <div className="loader">
            <div className="inner one"></div>
            <div className="inner two"></div>
            <div className="inner three"></div>
          </div>
          <div className="loader-text">Generating...</div>
        </div>
      ) : (
  	    <textarea
  	      readOnly
  	      value={yamlOutput}
  	      placeholder="ここにYAMLコードが生成されます..."
  	    />
      )}
  	</div>
  );
};