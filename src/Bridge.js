import React, { useEffect, useState } from 'react'
import {
    Address,
    BaseAddress,
    MultiAsset,
    Assets,
    ScriptHash,
    Costmdls,
    Language,
    CostModel,
    AssetName,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutputBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInputs,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    PlutusScripts,
    PlutusScript,
    PlutusList,
    Redeemers,
    Redeemer,
    RedeemerTag,
    Ed25519KeyHashes,
    ConstrPlutusData,
    ExUnits,
    Int,
    NetworkInfo,
    EnterpriseAddress,
    TransactionOutputs,
    hash_transaction,
    hash_script_data,
    hash_plutus_data,
    ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential
} from "@emurgo/cardano-serialization-lib-asmjs"
import {blake2b} from "blakejs";
import "./Bridge.css"

import { blockfrostRequest } from './API';
import Unity, { UnityContext } from "react-unity-webgl";
import { toHex, hexDecode, unpackAssets } from './util';
import { setCoinValue, setAssets } from './App'

let Buffer = require('buffer/').Buffer
let blake = require('blakejs')

function Bridge() {

    const [wallets, setWallets] = useState([])
    const [whichWalletSelected, setWhichWalletSelected] = useState(undefined)
    const [walletFound, setWalletFound] = useState(false)
    const [walletIsEnabled, setWalletIsEnabled] = useState(false)
    const [walletAPIVersion, setWalletAPIVersion] = useState(undefined)
    const [walletName, setWalletName] = useState(undefined)

    const [networkId, setNetworkId] = useState(undefined)
    const [Utxos, setUtxos] = useState(undefined)
    const [balance, setBalance] = useState(undefined)
    const [nativeAssets, setNativeAssets] = useState([])

    const [walletsLoaded, setWalletsLoaded] = useState(false)
    const [reconnectingWallet, setReconnectingWallet] = useState(false)

    var API = undefined

    useEffect(() => {
        console.log("selected Wallet: " + whichWalletSelected)
        refreshData()
    }, [whichWalletSelected])

    useEffect(() => {
        console.log("stuff happened")
        connectWallet()
    }, [nativeAssets])

    useEffect(() => {
        pollWallets()
    }, [])


    const pollWallets = (count = 0) => {
        const walletsT = [];
        for(const key in window.cardano) {
            if (window.cardano[key].enable && walletsT.indexOf(key) === -1) {
                walletsT.push(key);
            }
        }
        if (count < 3) {
            setTimeout(() => {
                console.log("loading wallets..." + count)
                pollWallets(count + 1)
            }, 1000);
            return;
        }

        setWallets(walletsT)
        // setWhichWalletSelected(walletsT[0])
        setWalletsLoaded(true)
        console.log("finsihed count: " + count + " with: " + walletsT)
        
        
    }

    const handleWalletSelect = (val) => {
        setWhichWalletSelected(val)
    }

    const checkifWalletFound = () => {
        const walletKey = whichWalletSelected
        const walletFoundT = !!window?.cardano?.[walletKey]
        setWalletFound(walletFoundT)
        return walletFoundT
    }

    const getWalletName = () => {
        const walletKey = whichWalletSelected
        const walletNameT = window?.cardano?.[walletKey].name
        setWalletName(walletNameT)
        return walletNameT
    }

    const enableWallet = async () => {
        const walletKey = whichWalletSelected
        
        try {
            API = await window.cardano[walletKey].enable();
        } catch (err) {
            setWhichWalletSelected(null)
            console.log(err)
        }
        return checkIfWalletEnabled()
    }

    const checkIfWalletEnabled = async () => {
        let walletIsEnabledT = false

        try {
            const walletNameT = whichWalletSelected
            walletIsEnabledT = await window.cardano[walletNameT].isEnabled()
        } catch (err) {
            console.log(err)
        }
        setWalletIsEnabled(walletIsEnabledT)

        return walletIsEnabledT
    }

    const getNetworkId = async () => {
        try {
            const networkIdT = await API.getNetworkId()
            setNetworkId(networkIdT)
        } catch (err) {
            console.log(err)
        }
    }

    const getUtxos = async () => {

        let UtxosT = []

        try {
            const rawUtxos = await API.getUtxos()

            const newNativeAssets = []

            for (const rawUtxo of rawUtxos) {
                
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str(); // ADA amount in lovelace
                const multiasset = output.amount().multiasset();
                let multiAssetStr = "";

                if (multiasset) {
                    const keys = multiasset.keys()
                    const N = keys.len()
                    // console.log(`${N} Multiassets in the UTXO`)
                    
                    for (let i = 0; i < N; i++){
                        const policyId = keys.get(i);
                        const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
                        // console.log(`policyId: ${policyIdHex}`)
                        const assets = multiasset.get(policyId)
                        const assetNames = assets.keys();
                        const K = assetNames.len()
                        // console.log(`${K} Assets in the Multiasset`)

                        for (let j = 0; j < K; j++) {
                            const assetName = assetNames.get(j);
                            const assetNameString = Buffer.from(assetName.name(),"utf8").toString();
                            const assetNameHex = Buffer.from(assetName.name(),"utf8").toString("hex")
                            const multiassetAmt = multiasset.get_asset(policyId, assetName)
                            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                            if (multiassetAmt) {
                                newNativeAssets.push({ assetName: assetName,  amount: multiassetAmt, hash: policyId})
                            }
                        }
                    }          
                }

                const obj = {
                    txid: txid,
                    txindx: txindx,
                    amount: amount,
                    str: `${txid} #${txindx} = ${amount}`,
                    multiAssetStr: multiAssetStr,
                    TransactionUnspentOutput: utxo
                }
                UtxosT.push(obj)

            }
            setUtxos(UtxosT)
            setNativeAssets(newNativeAssets)
        } catch (err) {
            console.log(err)
        }
    }

    const getBalance = async () => {
        try {
            const balanceCBORHex = await API.getBalance() 

            const balanceT = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str()
            setBalance(balanceT)
        } catch (err) {
            console.log(err)
        }
    }

    const refreshData = async () => {
        try {
            const walletFound = checkifWalletFound()
            if (walletFound) {
                await getAPIVersion()
                await getWalletName()
                const walletEnabled = await enableWallet()
                if (walletEnabled) {
                    // console.log("wallet enalbed")
                    await getNetworkId()
                    await getBalance()
                    await getUtxos()

                } else {
                    // console.log("wallet not enalbed")
                    await setUtxos(null)
                    await setBalance(null)
                    await setUtxos(null)
                }
            }
        } catch (err) {
            console.log(err)
        }
    }

    const getAPIVersion = () => {
        const walletKey = whichWalletSelected
        const walletAPIVersionT = window?.cardano?.[walletKey].apiVersion
        setWalletAPIVersion(walletAPIVersionT)
        return walletAPIVersionT
    }

    const connectWallet = async () => {
        console.log("sending...")
        if (balance != null && nativeAssets != []) {

            setCoinValue(balance)

            const assetsRaw = nativeAssets
            const assetsWithMetadata = []

            for (let i = 0; i < assetsRaw.length; i++) {
                const asset = assetsRaw[i]
                
                if ((toHex(asset.hash.to_bytes())) == "5d6aa5c975266893fc446f24a094dddc59192638b5da0ec0691ec0ae") {
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
            }

            setAssets(JSON.stringify(assetsWithMetadata));

        } else {
            console.log("failed to send. balance: " + balance  + ", nativeAssets: " + nativeAssets)
        }
    }

    const refreshWallet = () => {
        setReconnectingWallet(true)
        setTimeout(() => {  
            console.log("Reconnecting Wallet")
            connectWallet()
            setReconnectingWallet(false)
        }, 1000);
        
    }

    return (

        (!walletIsEnabled)
            ? (!walletsLoaded)
                ?   <div className="connector-container">
                        <span>Loading Wallets...</span>
                    </div>
                :   <div className="connector-container">
                        <span style={{ fontSize: '24px' }}>Select Your Prefered Wallet</span>
                        <div className="wallet-container">
                        
                        {wallets.map(key => 
                            <button
                                onClick={() => handleWalletSelect(key)}
                                key={key}
                                className="wallet-label"
                                value={key}>
                                <img src={window.cardano[key].icon} width={24} height={24} alt={key}/>
                                {window.cardano[key].name} ({key})
                            </button>
                        )}
                        </div>
                    </div>
            :   <div className="connector-container">
                    <span>You are currently connected with</span>
                    <div className='connected-wallet'>
                        <img src={window.cardano[whichWalletSelected].icon} width={24} height={24} alt={whichWalletSelected}/>
                        <span>{whichWalletSelected.toUpperCase()}</span>
                    </div>
                    {
                        (reconnectingWallet)
                        ? <span style={{ marginLeft: '10%'}}>Reconnecting...</span>
                        : <button className='reconnect-btn' onClick={() => refreshWallet()}>Reconnect Wallet</button>
                    } 
                </div>

        
  )
}

export default Bridge