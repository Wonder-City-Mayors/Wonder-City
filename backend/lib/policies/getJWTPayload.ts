import { verify } from "@lib/jwt"

export default async function (req, res) {
    const sources = [
        req.headers.authorization
            ? req.headers.authorization.substring(0, 6) === "Bearer"
                ? req.headers.authorization.substring(7)
                : req.headers.authorization
            : undefined,
        req?.cookies?.jwt,
        req?.query?.jwt,
        req?.body?.jwt,
    ]

    for (const jwt of sources) {
        req.jwtPayload = await verify(jwt)

        if (req.jwtPayload) return true
    }

    return false
}
