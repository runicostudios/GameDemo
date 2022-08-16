import './App.css';
import React from "react";
import Unity, { UnityContext } from "react-unity-webgl";
import { enable, getBalance } from './walletConnector';
import { blockfrostRequest } from './API';
import { toHex, hexDecode, unpackAssets } from './util';

import NavBar from './components/NavBar';
import HowTo from './components/HowTo';

const unityContext = new UnityContext({
  loaderUrl: "./WebGL.loader.js",
  dataUrl: "./WebGL.data",
  frameworkUrl: "./WebGL.framework.js",
  codeUrl: "./WebGL.wasm",
});

export function connectWallet() {
  enable().then(async (response) => {
    console.log('Connection response: ', response);
    const value = await getBalance();
    // Set Lovelace amount
    setCoinValue(value.coin().to_str());
  
    // Find all assets
    const assetsRaw = unpackAssets(value)
    const assetsWithMetadata = []
  
    for (let i = 0; i < assetsRaw.length; i++) {
      const asset = assetsRaw[i]
      //Blockfrost api uses the policyid + assetname as key to lookup an asset (hex encoded)
      const unit = toHex(asset.hash.to_bytes()) + toHex(asset.assetName.name())
      let metadata = await blockfrostRequest(`/assets/${unit}`);
      // console.log('Metadata: ', metadata);
      assetsWithMetadata.push({
        asset: {
          assetName: hexDecode(asset.assetName.name())
          , amount: asset.amount.to_str()
        },
        metadata: metadata
      })
    }
    setAssets(JSON.stringify(assetsWithMetadata));
    console.log(JSON.stringify(assetsWithMetadata));
  })
}


export function setCoinValue(coinVal) {
  console.log('Setting coin value: ', coinVal);
  unityContext.send('Bridge', 'SetCoinValue', coinVal);
}
export function setAssets(assetMetadata) {
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
