import * as openpgp from 'openpgp';
import * as fs from 'fs'

let publicKey: openpgp.Key | undefined = undefined
let privateKey: openpgp.PrivateKey | undefined = undefined


let publicKeyArmored;
let privateKeyArmored;
let passphrase: string | undefined = undefined

export const init = async ({publicKeyPath, privateKeyPath, passphrase}: {publicKeyPath: string, privateKeyPath: string, passphrase: string }) => {
    
    publicKeyArmored = fs.readFileSync(publicKeyPath).toString('utf8');
    privateKeyArmored = fs.readFileSync(privateKeyPath).toString('utf8');
    passphrase = passphrase;

    publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
    privateKey = await openpgp.decryptKey({
        privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
        passphrase: passphrase
    });

}

export const encryptMessageUsingSecret = async (original: string) => {
    console.log(`encryptMessageUsingSecret passphrase............: ${passphrase}`)
    if (!privateKey || !publicKey) throw new Error(`Key is not init...`)
    return encryptMessage(original, privateKey, publicKey)
}
export const decryptMessageUsingSecret = async (encrypted) => {
    console.log(`decryptMessageUsingSecret passphrase............: ${passphrase}`)

    if (!privateKey || !publicKey) throw new Error(`Key is not init...`)
    return decryptMessage(encrypted, privateKey, publicKey)
}



export const encryptMessage = async (original: string, privateKey: openpgp.PrivateKey, publicKey: openpgp.Key) => {
    const encrypted = await openpgp.encrypt({
        message: await openpgp.createMessage({ text: original }), // input as Message object
        encryptionKeys: publicKey,
        signingKeys: privateKey // optional
    });
    return encrypted
}

export const decryptMessage = async (encrypted, privateKey: openpgp.PrivateKey, publicKey: openpgp.Key) => {

    const message = await openpgp.readMessage({
        armoredMessage: encrypted
    });
    
    try {
        const { data: decrypted, signatures } = await openpgp.decrypt({
            message,
            verificationKeys: publicKey, // optional
            decryptionKeys: privateKey
        });

        console.log(`signatures: ${signatures[0].verified}`)
        // console.log('---------------------------------------')
        // console.log(decrypted)
        // console.log(signatures[0])
        // console.log('---------------------------------------')

        // check signature validity (signed messages only)
        // try {
        //     await signatures[0].verified; // throws on invalid signature
        // } catch (e) {
        //     throw new Error('Signature could not be verified: ' + e.message);
        // }
        
        return decrypted
    } catch (e) {
        console.error(e)
        throw e
    }

}
