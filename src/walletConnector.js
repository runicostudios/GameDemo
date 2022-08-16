import { unpackAssets, hexDecode } from "./util"
import { Buffer } from "buffer"
import cardano from './nami';

export const enable = async () => {
    // Connects nami wallet to current website 
    return window.cardano && window.cardano.enable()
        .catch(e => console.log(e))
}

export const getAddress = async () => {
    // retrieve address of nami wallet
    const loader = await cardano()
    const addressHex = Buffer.from(
        (await window.cardano.getUsedAddresses())[0],
        "hex"
    );

    const address = loader.BaseAddress.from_address(
        loader.Address.from_bytes(addressHex)
    )
        .to_address()
        .to_bech32();
        console.log(address);
    return address;
}

// export const getBalance = async () => {
//     // get balance of Nami Wallet
//     const loader = await cardano()
//     const valueCBOR = await window.cardano.getBalance()
//     const value = loader.Value.from_bytes(Buffer.from(valueCBOR, "hex"))
//     const lovelace = parseInt(value.coin().to_str())

//     const nfts = [];
//     if (value.multiasset()) {
//         const multiAssets = value.multiasset().keys();
//         for (let j = 0; j < multiAssets.len(); j++) {
//             const policy = multiAssets.get(j);
//             const policyAssets = value.multiasset().get(policy);
//             const assetNames = policyAssets.keys();
//             for (let k = 0; k < assetNames.len(); k++) {
//                 const policyAsset = assetNames.get(k);
//                 const quantity = policyAssets.get(policyAsset);
//                 const asset =
//                     Buffer.from(policy.to_bytes(), 'hex').toString('hex') +
//                     Buffer.from(policyAsset.name(), 'hex').toString('hex');
//                 const _policy = asset.slice(0, 56);
//                 const _name = asset.slice(56);
//                 const fingerprint = new AssetFingerprint(
//                     Buffer.from(_policy, 'hex'),
//                     Buffer.from(_name, 'hex')
//                 ).fingerprint();
//                 nfts.push({
//                     unit: asset,
//                     quantity: quantity.to_str(),
//                     policy: _policy,
//                     name: hexToAscii(_name),
//                     fingerprint,
//                 });
//             }
//         }
//     }
//     return { lovelace, nfts };
// };


export const isEnabled = window.cardano && window.cardano.isEnabled;
/**
     * Get the total balance of the wallet.
     */
export async function getBalance() {
    const loader = await cardano();
    const valueRaw = await window.cardano.getBalance();
    const value = loader.Value.from_bytes(
        Buffer.from(valueRaw, "hex")
    )
    return value
}

/**
 * Get the total balance of the wallet.
 */
export async function getAssets() {
    const value = await getBalance()
    return unpackAssets(value).map(asset => {
        return (
            {
                assetName: hexDecode(asset.assetName.name())
                , amount: asset.amount.to_str()
                , fingerprint: asset.hash.to_bech32("asset")
            }
        )
    })
}

export const getNetworkId = window.cardano && window.cardano.getNetworkId()

/**
 * A thin wrapper around a Cardano WalletConnectorRaw API to give it more 
 * convenient types
 * 
 */
export class WalletConnector {
    constructor(connector, onEnable) {
        this.connector = connector
        this.onEnable = onEnable
    }

    /**
     * 
     * @returns a boolean
     */
    enable() {
        this.connector.enable().then(
            _ => { this.onEnable(this) }
        ).catch(console.error)
    }

    /**
     * Returns true if wallet has access to requested website, false otherwise.
     * 
     * @returns a boolean
     */
    isEnabled() {
        return this.connector.isEnabled()
    }

    /**
     * Returns 0 if on testnet, otherwise 1 if on mainnet.
     * 
     * @returns 
     */
    async getNetworkId() {
        return await this.connector.getNetworkId()
    }
}
