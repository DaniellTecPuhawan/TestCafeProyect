import { Selector, t, ClientFunction } from 'testcafe';
import fs from 'fs';
import path from 'path';

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
        
        // Variables para el log de la consola
        this.logFilename = '';
    }

    // Función para escribir logs
    writeLog(message) {
        const timestamp = new Date();
        const logMessage = `[${timestamp.toISOString()}] ${message}\n`;

        if (!this.logFilename) {
            const date = timestamp.toISOString().split('T')[0];
            const time = timestamp.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');

            this.logFilename = path.join(__dirname, '../../reports', `AENA_Travel_login_${date}_${time}.report.txt`);

            if (!fs.existsSync(path.dirname(this.logFilename))) {
                fs.mkdirSync(path.dirname(this.logFilename), { recursive: true });
            }
        }

        fs.appendFileSync(this.logFilename, logMessage);
    }

    // ClientFunction para capturar todos los mensajes de la consola
    getBrowserConsoleMessages = ClientFunction(() => {
        window.console.messages = window.console.messages || [];
        
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const originalConsoleWarn = console.warn;

        const captureConsoleMessage = (message, level) => {
            window.console.messages.push({ message, level });
        };

        console.log = (...args) => {
            captureConsoleMessage(args.join(' '), 'log');
            originalConsoleLog.apply(console, args);
        };

        console.error = (...args) => {
            captureConsoleMessage(args.join(' '), 'error');
            originalConsoleError.apply(console, args);
        };

        console.warn = (...args) => {
            captureConsoleMessage(args.join(' '), 'warn');
            originalConsoleWarn.apply(console, args);
        };

        return window.console.messages;
    });

    // Aceptar cookies
    async acceptCookies() {
        const acceptCookiesButton = Selector('button').withText('Aceptar'); // Ajusta el selector según el botón real

        // Continuar aceptando cookies mientras el botón sea visible
        while (await acceptCookiesButton.exists && await acceptCookiesButton.visible) {
            await t.click(acceptCookiesButton);
            await t.wait(500); // Espera corta para evitar hacer clic múltiples veces rápidamente
        }
    }

    // Login
    async login(isMobile) {
        if (isMobile) {
            await t.click(this.loginButtonMobile);
        } else {
            await t.click(this.loginButtonDesktop);
        }
    }


    // Ingresar credenciales
    async enterCredentials(email, password) {
        //await t.expect(this.inputUser.exists).ok('El campo de usuario no está visible', { timeout: 5000 });
        await t.typeText(this.inputUser, email);
        await t.typeText(this.inputPass, password, { replace: true });
    }

    // Enviar el formulario
    async submit() {
        await t.click(this.submitButton);
    }

    // Verificar el login exitoso
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
    
    // Verificar si existe un error en el login
    async verifyLoginError() {
        return await this.loginErrorMessage.exists;
    }

    // Función para capturar los mensajes de la consola después de cada prueba
    async captureConsoleMessages() {
        const browserConsoleMessages = await this.getBrowserConsoleMessages();

        // Filtra los errores
        const errorMessages = browserConsoleMessages.filter(msg => msg.level === 'error');

        // Si hay errores, los escribimos en el log
        if (errorMessages.length > 0) {
            this.writeLog("=== Errores de la consola del navegador ===");
            errorMessages.forEach(msg => this.writeLog(msg.message));
        }

        // Escribir todos los mensajes de la consola (incluyendo errores) en el archivo de log
        this.writeLog("=== Todos los mensajes de la consola ===");
        browserConsoleMessages.forEach(msg => this.writeLog(`[${msg.level}] ${msg.message}`));
    }
}

// Exportar una instancia de la clase
export default new AENA_Travel_Login();
