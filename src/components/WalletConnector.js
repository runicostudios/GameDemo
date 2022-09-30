import React from 'react'
import './WalletConnector.css'

import Wallet from "@harmonicpool/cardano-wallet-interface";

async function fetchStuff() {
    console.log("starting command")
    let Nami = undefined
    const INami = Wallet.getInterface( Wallet.Names.Nami )

    if( !await Wallet.isEnabled( Wallet.Names.Nami ) ) {
        console.log("wallet not enabled")
        await Wallet.enable( Wallet.Names.Nami ).then(
            Wallet.Nami.getNetworkId()
        )
    } else {
        if(
            INami.isAviable()
        )
        {
            console.log("Wallet is aviable")
            Nami = Wallet.Nami
        }
    }

    console.log(await Nami.getNetworkId())
}

function WalletConnector() {

    const ActiveExtensions = []
    const ConnectionButtons = []
    
    for( let i = 0; i < Wallet.stringNames.length; i++ )
    {
        let WalletExtension = Wallet.stringNames[i]

        let WalletInj = undefined

        if (Wallet.has( WalletExtension )) {
            ActiveExtensions.push(WalletExtension)

            console.log("before")
            fetchStuff()
            console.log("after")

            ConnectionButtons.push(<button>{WalletExtension}</button>)
        } else {
            // ConnectionButtons.push(<button>{WalletExtension}</button>)
        }
    }
    
    console.log("Found Wallets: " + ActiveExtensions.toString())



    return (
        <div className='connections-container'>
            {ConnectionButtons}
        </div>
    )
}

export default WalletConnector