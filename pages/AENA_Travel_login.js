import { Selector, t } from 'testcafe';

class AENA_Travel_Login {
    constructor() {
        // Seleccionadores de elementos en la página
        this.loginButtonMobile = Selector('a.header__bottom__item.adobe-analytic-event.div-gigya-login');
        this.loginButtonDesktop = Selector('body > main > header > div > div > div.header__top__nav > div > div.header__top__nav__links__item.header__top__nav__links__item--user.header__top__nav__links__item--session > a');
        
        this.inputUser = Selector('#gigya-login-form input[type="text"]').with({ visibilityCheck: true });
        this.inputPass = Selector('#gigya-login-form input[type="password"]').with({ visibilityCheck: true });
        this.submitButton = Selector('#gigya-login-form input[type="submit"]').with({ visibilityCheck: true });
        this.divElement = Selector('body > main > header > div > div > div.header__top__nav > div > div:nth-child(2) > a > div').with({ visibilityCheck: true });

        // Selector para el mensaje de error de login
        this.loginErrorMessage = Selector('#gigya-login-form > div.gigya-layout-row.with-divider > div.gigya-layout-cell.responsive.with-site-login > div.gigya-error-display.gigya-composite-control.gigya-composite-control-form-error.aena-submit-error-form-msg.gigya-error-code-403042.gigya-error-display-active > div');
        
        // Seleccionadores para verificar el login
        this.loginSuccessWindows = Selector('body > main > div.main__inner-wrapper > div.color-bg > div:nth-child(1) > div > h2');
        this.loginSuccessAndroid = Selector('body > main > header > div > div > div.header__top__nav > div > div:nth-child(2) > a > div');
    }

    async acceptCookies() {
        const acceptCookiesButton = Selector('button').withText('Aceptar'); // Ajusta el selector según el botón real

        // Continuar aceptando cookies mientras el botón sea visible
        while (await acceptCookiesButton.exists && await acceptCookiesButton.visible) {
            await t.click(acceptCookiesButton);
            await t.wait(500); // Espera corta para evitar hacer clic múltiples veces rápidamente
        }
    }

    async login(isMobile) {
        if (isMobile) {
            await t.click(this.loginButtonMobile);
        } else {
            await t.click(this.loginButtonDesktop);
        }
    }

    async enterCredentials(email, password) {
        await t.typeText(this.inputUser, email);
        await t.typeText(this.inputPass, password, { replace: true });
    }

    async submit() {
        await t.click(this.submitButton);
    }

    async verifyLogin() {
        const isAndroid = await t.eval(() => navigator.userAgent.toLowerCase().includes('android'));
        let loginSuccessSelector = isAndroid ? this.loginSuccessAndroid : this.loginSuccessWindows;
    
        try {
            // Intentamos obtener el texto del selector de éxito
            const divText = await loginSuccessSelector.innerText;
    
            // Verificamos si el texto esperado está presente
            await t.expect(divText.toLowerCase()).contains('hola', 'El inicio de sesión no fue exitoso. Usuario o contraseña incorrectos.');
    
        } catch (error) {
            // Si no se encuentra el selector, lanzar un error con el mensaje adecuado
            throw new Error('Usuario o contraseña incorrectos.');
        }
    }
    
    async verifyLoginError() {
        return await this.loginErrorMessage.exists;
    }
}

// Exportar una instancia de la clase
export default new AENA_Travel_Login();
