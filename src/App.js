import './App.css';
import React from "react";
import Unity, { UnityContext } from "react-unity-webgl";

import NavBar from './components/NavBar';
import HowTo from './components/HowTo';
// import WalletConnector from './components/WalletConnector';
import Bridge from './Bridge';

const unityContext = new UnityContext({
  loaderUrl: "./WebGL.loader.js",
  dataUrl: "./WebGL.data",
  frameworkUrl: "./WebGL.framework.js",
  codeUrl: "./WebGL.wasm",
});



export function setCoinValue(coinVal) {
  console.log('Setting coin value: ', coinVal);
  unityContext.send('Bridge', 'SetCoinValue', coinVal);
}


export function setAssets(assetMetadata) {
  console.log('Setting assets: ', assetMetadata);
  unityContext.send('Bridge', 'SetAssetsValue', assetMetadata);
}

function App() {

  function handleOnClickFullscreen() {
    unityContext.setFullscreen(true);
  }
  
  return (
    <div className="appContent">
      <NavBar/>
      <HowTo/>
      <Bridge />
      
        <div id="unity-container" class="unity-desktop">
          <Unity unityContext={unityContext} style={{
            height: 600,
            width: 960,
            backgroundColor: 'black'
          }} />
          <div id="unity-loading-bar">
            <div id="unity-logo"></div>
            <div id="unity-progress-bar-empty">
              <div id="unity-progress-bar-full"></div>
            </div>
          </div>
          <div id="unity-warning"> </div>
          <div id="unity-footer">
            <div id="unity-fullscreen-button" onClick={handleOnClickFullscreen}></div>
            <div id="unity-build-title">RuneFortress Demo</div>
          </div>
        </div>
    </div>
  );
}

export default App;
