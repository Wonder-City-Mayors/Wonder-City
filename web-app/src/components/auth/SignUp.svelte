<script>
    import { mdiLogin } from "@mdi/js";
    import { stores } from "@sapper/app";
    import { createEventDispatcher } from "svelte";
    import { postApi } from "utils/requests";
    import Textfield from "../Input.svelte";
    import SubmitButton from "./SubmitButton.svelte";

    export let element;
    export let active;

    const dispatch = createEventDispatcher();
    const { session } = stores();

    let usernameEntered = false;
    let passwordEntered = false;
    let passwordRepeatEntered = false;
    let wrongUsername = false;
    let username = "";
    let password = "";
    let passwordRepeat = "";
    let usernameError;
    let passwordError;
    let passwordRepeatError;
    let promise;

    const checkWrongUsername = () => {
        if (wrongUsername) {
            wrongUsername = false;
        }
    };

    $: disabled = usernameError || passwordError || passwordRepeatError;

    const checkUsername = (username) => {
        checkWrongUsername();

        if (username.length === 0) {
            return "Заполните это поле.";
        } else if (/[^0-9a-zA-Z#$*_]/.test(username)) {
            return (
                "Логин может состоять только из английских букв, цифр и знаков" +
                " #, $, *, _."
            );
        }
    };

    const checkPassword = (password) => {
        checkPasswordRepeat(passwordRepeat);

        if (password.length === 0) {
            return "Заполните это поле.";
        } else if (password.length < 8) {
            return "Пароль должен состоять как минимум из 8 символов.";
        }
    };

    const checkPasswordRepeat = (passwordRepeat) => {
        if (passwordRepeat.length === 0) {
            return "Заполните это поле.";
        } else if (passwordRepeat !== password) {
            return "Пароли не совпадают.";
        }

        passwordRepeatError = false;
    };

    const signup = () => {
        if (usernameEntered && passwordEntered && passwordRepeatEntered) {
            if (!disabled) {
                promise = postApi($session.apiUrl + "/auth/signUp", {
                    username,
                    password,
                });

                promise
                    .then((json) => {
                        dispatch("signed", json);
                    })
                    .catch((e) => {
                        if (e.status === 409) {
                            promise = null;
                            wrongUsername = true;
                        }
                    });
            }
        } else {
            usernameEntered = true;
            passwordEntered = true;
            passwordRepeatEntered = true;
        }
    };
</script>

<form
    bind:this={element}
    class="signup {active ? 'active' : 'unactive'}"
    on:submit|preventDefault={signup}
>
    <div class="fields">
        <Textfield
            placeholder="Логин"
            validation={checkUsername}
            bind:value={username}
            bind:error={usernameError}
        />
    </div>
    <div class="fields">
        <Textfield
            type="password"
            validation={checkPassword}
            placeholder="Пароль"
            bind:value={password}
            bind:interacted={passwordEntered}
            bind:error={passwordError}
        />
        <Textfield
            type="password"
            validation={checkPasswordRepeat}
            placeholder="Повтор пароля"
            bind:value={passwordRepeat}
            bind:interacted={passwordRepeatEntered}
            bind:error={passwordRepeatError}
        />
    </div>
    {#if promise}
        {#await promise}
            <p class="await">Ждём ответа...</p>
        {:then resolved}
            <p class="await">Перенаправляем...</p>
        {:catch e}
            <p class="error">
                К сожалению, произошла какая-то&nbsp; ошибка. Пожалуйста,
                попробуйте снова через&nbsp; пару минут или обратитесь к
                администратору.
            </p>
        {/await}
    {:else if wrongUsername}
        <p class="error">Этот логин уже занят.</p>
        <SubmitButton disabled icon={mdiLogin} label="регистрация" />
    {:else}
        <SubmitButton {disabled} icon={mdiLogin} label="регистрация" />
    {/if}
</form>

<style lang="scss">
    @import "colors";

    form.signup {
        display: flex;
        flex-wrap: wrap;
        color: $mdc-theme-secondary;
        transition: opacity 0.3s ease, transform 0.3s ease;

        &.active {
            position: static;
            transform: none;
            opacity: 1;
        }

        &.unactive {
            position: absolute;
            transform: translateX(10rem);
            opacity: 0;
        }
    }
</style>
