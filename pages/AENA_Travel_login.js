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

    async login(isMobile) {
        // Hacer clic en el botón de login dependiendo de si es móvil o escritorio
        if (isMobile) {
            await t.click(this.loginButtonMobile);
        } else {
            await t.click(this.loginButtonDesktop);
        }
    }

    async enterCredentials(email, password) {
        // Introduce el usuario y la contraseña
        await t.typeText(this.inputUser, email);
        await t.typeText(this.inputPass, password, { replace: true });
    }

    async submit() {
        // Hacer clic en el botón de submit para enviar el formulario
        await t.click(this.submitButton);
    }

    async verifyLogin() {
        // Detectar si estamos en una plataforma móvil o de escritorio (Windows o Android)
        const isAndroid = await t.eval(() => navigator.userAgent.toLowerCase().includes('android'));
        let loginSuccessSelector;

        // Usar el selector correcto según la plataforma
        if (isAndroid) {
            loginSuccessSelector = this.loginSuccessAndroid;
        } else {
            loginSuccessSelector = this.loginSuccessWindows;
        }

        // Verificar si el texto "hola" está presente en el elemento adecuado
        const divText = await loginSuccessSelector.innerText;
        await t.expect(divText.toLowerCase()).contains('hola', 'El inicio de sesión no fue exitoso');
    }

    async verifyLoginError() {
        // Verificar si aparece el mensaje de error
        const errorMessageVisible = await this.loginErrorMessage.exists;
        return errorMessageVisible;
    }
}

// Exportar una instancia de la clase
export default new AENA_Travel_Login();
