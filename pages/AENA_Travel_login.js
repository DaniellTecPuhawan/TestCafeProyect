import { Selector, t } from 'testcafe';
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
        // Verificar si el login es exitoso buscando un texto específico
        const divText = await this.divElement.innerText;
        await t.expect(divText.toLowerCase()).contains('hola', 'El inicio de sesión no fue exitoso');
    }

    async verifyLoginError() {
        // Verificar si aparece el mensaje de error
        const errorMessageVisible = await this.loginErrorMessage.exists;
        if (errorMessageVisible) {
            writeLog("Usuario o contraseña incorrectos.");
        }
    }
}

// Función para escribir en el log
let logFilename = ''; 

function writeLog(message) {
    const timestamp = new Date();
    const logMessage = `[${timestamp.toISOString()}] ${message}\n`;

    // Crea el nombre del archivo donde se almacene los logs
    if (!logFilename) {
        const date = timestamp.toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
        const time = timestamp.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-'); // Hora en formato HH-MM-SS

        // El directorio de la carpeta reports
        logFilename = path.join(__dirname, '../../reports', `AENA_Travel_login_${date}_${time}.report.txt`); // Nombre de archivo único dentro de 'reports'
        
        // Si existe se crea otro
        if (!fs.existsSync(path.dirname(logFilename))) {
            fs.mkdirSync(path.dirname(logFilename), { recursive: true });
        }
    }

    // Escribir el log en el archivo
    fs.appendFileSync(logFilename, logMessage);
}

// Exportar una instancia de la clase
export default new AENA_Travel_Login();
