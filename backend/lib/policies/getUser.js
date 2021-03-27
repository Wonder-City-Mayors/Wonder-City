import getUser from 'utils/getUser';

export default async (req, res) => {
    const sources = [
        (
            req.headers.authorization ?
                (
                    req.headers.authorization.substring(0, 6) === 'Bearer' ?
                        req.headers.authorization.substring(7) :
                        req.headers.authorization
                ) :
                undefined
        ),
        req?.cookies?.jwt,
        req?.query?.jwt,
        req?.body?.jwt,
    ];

    for (const jwt of sources) {
        req.user = await getUser(jwt);

        if (req.user) return true;
    }

    return false;
};