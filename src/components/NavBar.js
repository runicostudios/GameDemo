import React from 'react'
import './NavBar.css'
import LogoCondensed from '../assets/LogoCondensedWhiteBorderCompressed.png'
import DiscordLogo from '../assets/discord-xxl.png'

function navBar() {
  return (
    <div className="navbar-container">
        <div className="navbar-content">
            <a href="https://www.runefortress.com" target="_blank" className="navbar-element" id="rf-logo-wrap">
                <img src={LogoCondensed} />
            </a>
            <div className="navbar-element" id="navbar-title">
                <span style={{ fontSize: '30px' }}>RuneFortress Alpha Demo</span>
            </div>
            <a href="https://discord.gg/84aQ9rGqcA" target="_blank" className="navbar-element" id="rf-discord-logo-wrap">
                <img src={DiscordLogo} />
            </a>
        </div>
    </div>
  )
}

export default navBar   