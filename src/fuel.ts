import {LinkSession} from 'anchor-link'
import {SigningRequest} from 'eosio-signing-request'

const supportedChains = {
    '2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840':
        'https://jungle3.greymass.com',
}

async function apiCall(url: string, body?: any) {
    return (
        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        })
    ).json()
}

export async function fuel(
    request: SigningRequest,
    session: LinkSession,
    updatePrepareStatus: (message: string) => void
) {
    updatePrepareStatus('Detecting if Fuel is required.')
    const cloned = request.clone()
    const chainId = cloned.getChainId()
    const nodeUrl = supportedChains[chainId]
    if (!nodeUrl) {
        throw new Error('Chain does not support Fuel.')
    }
    const result = await apiCall(nodeUrl + '/v1/cosigner/sign', {
        request: cloned,
        signer: session.auth,
    })
    if (result.data.signatures[0]) {
        cloned.setInfoKey('fuel_sig', result.data.signatures[0])
    } else {
        throw new Error('No signature returned from Fuel')
    }
    cloned.data.req = result.data.request
    return cloned
}
