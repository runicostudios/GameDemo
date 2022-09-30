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
                Firstly, ensure you have at least one cardano wallet extension installed.
                <br/>
                <br/>
                To begin playing, choose your prefered wallet below (make sure you have pop-ups enabled).
                <br/>
                <br/>
                Click Accept and your wallet will be successfully connected to the game!
                <br/>
                <br/>
                If you experience any connection issues, try reconnecting the wallet.
                <br/>
                <br/>
                Please report any bugs or feedback to our discord. Enjoy the Demo!
                <br/>
                <br/>
            </span>
        </div>
    </div>
  )
}

export default HowTo