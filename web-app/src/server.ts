import * as sapper from "@sapper/server";
import colors from "colors/safe";
import compression from "compression";
import "dotenv/config";
import fetch from "node-fetch";
import polka from "polka";
import sirv from "sirv";

const { PORT, NODE_ENV, API_URL = "localhost/api" } = process.env;
const dev = NODE_ENV === "development";

const app = polka();

if (dev) {
    app.use(async (req, res, next) => {
        const start = new Date();

        res.on("finish", () => {
            const ms = colors.underline(
                colors.bold(String(Date.now() - start.getTime()))
            );
            const url = colors.cyan(req.originalUrl);
            const code =
                res.statusCode >= 200
                    ? res.statusCode >= 300
                        ? res.statusCode >= 400
                            ? res.statusCode >= 500
                                ? colors.red(res.statusCode)
                                : colors.magenta(res.statusCode)
                            : colors.yellow(res.statusCode)
                        : colors.green(res.statusCode)
                    : colors.gray(res.statusCode);

            console.log(
                `${start.getHours()}:${start.getMinutes()}:${start.getSeconds()}` +
                    ` • ${ms} ms ${code} with ${req.method} on ${url}`
            );
        });

        next();
    });
}

app.use(compression({ threshold: 0 }), sirv("static", { dev }));

app.use(async function (req, res, next) {
    const user = await fetch(API_URL + "/user/me", {
        headers: {
            Cookie: req.headers.cookie,
        },
    }).then((response) => response.ok && response.json());

    sapper.middleware({
        session: (req, res) => ({
            apiUrl: API_URL,
            user: user
                ? Object.assign(user, {
                      isAuthenticated: true,
                  })
                : {
                      isAuthenticated: false,
                  },
        }),
    })(req, res, next);
});

app.listen(PORT, (err) => {
    if (err) {
        console.log(colors.red(`Ошибка!\n${err}`));
    } else {
        console.log(
            colors.green(
                `Сервер запущен на порте ${colors.bold(
                    colors.underline(String(PORT))
                )}.`
            )
        );
    }
});
