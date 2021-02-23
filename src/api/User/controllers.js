import pick from 'lodash/pick';
import bcrypt from 'bcrypt';

const parsePermissions = array => {
    return array.map(obj => obj.name);
};

export default {
    signUp: async (req, res) => {
        const { username, password } = req.body;

        if (
            !password ||
            !username ||
            password.length < 8 ||
            /[^0-9a-zA-Z#$*_]/.test(username)
        ) {
            res.throw(400, "Некорректный логин или пароль");
            return;
        }

        const potentiallyExistingUser = await wonder
            .query('user')
            .findOne({ username });

        if (potentiallyExistingUser) {
            res.throw(403, "Пользователь с таким логином уже зарегистрирован");
            return;
        }

        const userId = await wonder.knex.transaction(trx => {
            const date = new Date();

            return bcrypt
                .hash(password, 10)
                .then(hash => trx.insert({
                    first_name: 'Пользователь',
                    last_name: 'Анонимный',
                    password: hash,
                    username,
                })
                    .into('user')
                )
                .then(userId => userId[0]);
        });

        const jwt = wonder.services.jwt.issue({
            id: userId
        });

        res.send({
            jwt,
            data: {
                isAuthenticated: true,
                first_name: 'Пользователь',
                last_name: 'Анонимный',
                permissions: [],
                username
            }
        });

        return;
    },

    signIn: async (req, res) => {
        const { username, password } = req.body;

        if (
            !password ||
            !username ||
            password.length < 8 ||
            /[^0-9a-zA-Z#$*_]/.test(username)
        ) {
            res.throw(400, "Некорректный логин или пароль");
            return;
        }

        const user = await wonder.query('user').findOne({ username });

        if (
            !user ||
            !(await bcrypt.compare(password, String(user.password)))
        ) {
            res.throw(401, "Неправильный логин или пароль");
            return;
        }

        const jwt = wonder.services.jwt.issue({
            id: user.id
        });

        const permissions = user.role_id ?
            wonder.cache.roles[user.role_id].permissions :
            [];

        res.send({
            jwt,
            data: {
                isAuthenticated: true,
                permissions,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username
            },
        });

        return;

    },

    addDevice: async (req, res) => {
        if (req.query.id) {
            const id = parseInt(req.query.id, 10);

            if (id) {
                const device = await wonder.query('tree').findOne({ id });

                if (device) {
                    if (device.user_id === null) {
                        await wonder.query('tree').update({
                            id: id
                        }, {
                            user_id: req.user.id
                        });

                        res.send('OK');
                        return;
                    }

                    res.throw(403);
                    return;
                }
            }
        }

        res.throw(400);
    },

    addName: async (req, res) => {
        req.query.name
        if
            (req.query.name) {
            wonder.query("user").update({ id: req.user.id }, { first_name: req.query.name })
            res.send("Ок")
            return
        }
        res.throw(400)
    },

    /**
     * Обработчик, который меняет фамилию пользователя
     * 
     * @throws 400
     * 
     * @param {ExpressRequest} req 
     * @param {ExpressResponse} res 
     */
    changeLastName: async (req, res) => {
        // Тело функции
    },

    /**
     * Обработчик, который меняет электронную почту пользователю
     * 
     * @throws 400
     * 
     * @param {ExpressRequest} req 
     * @param {ExpressResponse} res 
     */
    changeEmail: async (req, res) => {
        // Тело функции    
    },

    /**
     * Обработчик, который меняет пароль пользователю
     * 
     * @param {ExpressRequest} req 
     * @param {ExpressResponse} res 
     */
    changePassword: async (req, res) => {
        // Тело функции
    }
};

