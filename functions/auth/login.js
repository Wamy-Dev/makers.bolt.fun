
const { prisma } = require('../prisma');
const LnurlService = require('./services/lnurl.service')
const cookie = require('cookie')
const jose = require('jose');
const { CONSTS } = require('../utils');


async function generateAuthUrl() {
    const data = await LnurlService.generateAuthUrl();
    return {
        status: "OK",
        body: JSON.stringify(data)
    };
}


async function login(tag, k1, sig, key) {
    if (tag !== 'login') {
        return { status: 'ERROR', reason: 'Not a login request' }
    }

    const result = LnurlService.verifySig(sig, k1, key)
    if (!result) {
        return { status: 'ERROR', reason: 'Invalid Signature' }
    }

    const user = await prisma.user.findFirst({ where: { pubKey: key } })
    if (user === null) {
        await prisma.user.create({
            data: {
                pubKey: key,
                name: key,
                avatar: `https://avatars.dicebear.com/api/bottts/${key}.svg`
            }
        })
    }



    // Set cookies on the user's headers
    const hour = 3600000
    const maxAge = 30 * 24 * hour
    const jwtSecret = CONSTS.JWT_SECRET;


    const jwt = await new jose.SignJWT({ pubKey: key })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(maxAge)
        //TODO: Set audience, issuer
        .sign(Buffer.from(jwtSecret, 'utf-8'))



    const authCookie = cookie.serialize('Authorization', `Bearer ${jwt}`, {
        secure: true,
        httpOnly: true,
        path: '/',
        maxAge: maxAge,
    })

    return {
        status: 'OK',
        'headers': {
            'Set-Cookie': authCookie,
            'Cache-Control': 'no-cache',
        },
    }
}



exports.handler = async (event, context) => {
    const { tag, k1, sig, key } = event.queryStringParameters ?? {}

    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    if (!sig || !key) {
        return generateAuthUrl();
    }
    else {
        return login(tag, k1, sig, key)
    }
};