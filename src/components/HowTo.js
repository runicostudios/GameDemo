import React from 'react'
import './HowTo.css'
import { connectWallet } from '../App'

function HowTo() {
  return (
    <div className="howto-container">
        <div className="howto-header">
            <span style={{ fontSize: '38px', fontWeight: 'bold'}}>Before You Play</span>
        </div>
        <div className="howto-content">
            <span>
                <br/>
                This demo requires the Nami Wallet browser extension to play.
                <br/>
                <br/>
                To begin playing, click the connect button below (make sure you have pop-ups enabled).
                <br/>
                <br/>
                Click Accept and your wallet will be successfully connected to the game!
                <br/>
                <br/>
                Please report any bugs or feedback to our discord. Enjoy the Demo!
                <br/>
                <br/>
            </span>
        </div>
        <div className="ConnectContainer">
            <button onClick={connectWallet}>Connect</button>
        </div>
    </div>
  )
}

export default HowTo