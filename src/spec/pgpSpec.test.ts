import * as pgp from '../utils/pgp'


const PUBLIC_PGP_KEY_PATH = process.env.PUBLIC_PGP_KEY_PATH || ''
const PRIVATE_PGP_KEY_PATH = process.env.PRIVATE_PGP_KEY_PATH || ''
const PRIVATE_KEY_PASSPHRASE = process.env.PRIVATE_KEY_PASSPHRASE || ''


describe("test init", () => {
  beforeAll(async () => {
    await pgp.init({publicKeyPath: PUBLIC_PGP_KEY_PATH, privateKeyPath: PRIVATE_PGP_KEY_PATH, passphrase: PRIVATE_KEY_PASSPHRASE})    
  });
  it("pgp test", async () => {

    try {
      const enc = await pgp.encryptMessageUsingSecret('{ "message": "ok"}')
      console.log (`encrypted ---------------------`)
      console.log (`${enc}`)

      const dec = await pgp.decryptMessageUsingSecret(enc)
      expect(dec).toBe('{ "message": "ok"}')
    } catch (e) {
      console.error(e)
    }
    
  });

});

