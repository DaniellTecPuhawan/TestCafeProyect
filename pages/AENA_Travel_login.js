import { Selector, t } from 'testcafe';

class AENA_Travel_Login {
    constructor() {
        // Seleccionadores de elementos en la página
        this.loginButtonMobile = Selector('a.header__bottom__item.adobe-analytic-event.div-gigya-login');
        this.loginButtonDesktop = Selector('body > main > header > div > div > div.header__top__nav > div > div.header__top__nav__links__item.header__top__nav__links__item--user.header__top__nav__links__item--session > a');
        
        this.inputUser = Selector('#gigya-login-form input[type="text"]').with({ visibilityCheck: true });
        this.inputPass = Selector('#gigya-login-form input[type="password"]').with({ visibilityCheck: true });
        this.submitButton = Selector('#gigya-login-form input[type="submit"]').with({ visibilityCheck: true });

        // Selector para el mensaje de error de login
        this.loginErrorMessage = Selector('#gigya-login-form div.gigya-error-display-active > div');

        // Selectores para verificar login exitoso
        this.loginSuccessWindows = Selector('body > main > div.main__inner-wrapper > div.color-bg > div:nth-child(1) > div > h2');
        this.loginSuccessAndroid = Selector('body > main > header > div > div > div.header__top__nav > div > div:nth-child(2) > a > div');

        // Selector de botón de aceptación de cookies (ajustar si es necesario)
        this.acceptCookiesButton = Selector('button').withText('Aceptar');
    }

    async acceptCookies() {
        if (await this.acceptCookiesButton.exists && await this.acceptCookiesButton.visible) {
            await t.click(this.acceptCookiesButton);
        }
    }

    async login(isMobile) {
        await this.acceptCookies();
        if (isMobile) {
            await t.click(this.loginButtonMobile);
        } else {
            await t.click(this.loginButtonDesktop);
        }
    }

    async enterCredentials(email, password) {
        await this.acceptCookies();
        await t.typeText(this.inputUser, email);
        await t.typeText(this.inputPass, password, { replace: true });
    }

    async submit() {
        await this.acceptCookies();
        await t.click(this.submitButton);
    }

    async verifyLogin() {
        await this.acceptCookies();
        const isAndroid = await t.eval(() => navigator.userAgent.toLowerCase().includes('android'));
        const loginSuccessSelector = isAndroid ? this.loginSuccessAndroid : this.loginSuccessWindows;

        const divText = await loginSuccessSelector.innerText;
        await t.expect(divText.toLowerCase()).contains('hola', 'El inicio de sesión no fue exitoso');
    }

    async verifyLoginError() {
        await this.acceptCookies();
        return await this.loginErrorMessage.exists;
    }
}

// Exportar una instancia de la clase
export default new AENA_Travel_Login();
