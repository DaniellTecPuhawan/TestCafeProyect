import { Selector, t } from 'testcafe';
import fs from 'fs';
import path from 'path';
import Login from '../../pages/AENA_Travel_Login';

let logFilename = '';

function writeLog(message) {
    const timestamp = new Date();
    const logMessage = `[${timestamp.toISOString()}] ${message}\n`;

    if (!logFilename) {
        const date = timestamp.toISOString().split('T')[0];
        const time = timestamp.toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');

        logFilename = path.join(__dirname, '../../reports', `AENA_Travel_login_${date}_${time}.report.txt`);

        if (!fs.existsSync(path.dirname(logFilename))) {
            fs.mkdirSync(path.dirname(logFilename), { recursive: true });
        }
    }

    fs.appendFileSync(logFilename, logMessage);
}

function loadUserCredentials() {
    const filePath = path.join(__dirname, '..', '..', '/data/users.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(data);

    return { validUser: parsedData.user1[0] };
}

fixture `Login AENA Travel`
    .page `https://clubcliente.aena.es/AenaClub/es/sessionFinished`
    .beforeEach(async () => {
        writeLog("===== Iniciando nueva ejecución de prueba =====");
    })
    .afterEach(async () => {
        writeLog("===== Prueba finalizada =====\n");
    });

test('Login con usuario válido en resolución completa', async t => {
    writeLog("Cargando la página...");
    await t.resizeWindow(1920, 1080);
    await t.wait(3000);

    await Login.acceptCookies();
    writeLog("Cookies aceptadas.");

    const { email, password } = loadUserCredentials().validUser;
    const isMobile = await t.eval(() => window.innerWidth < 768);
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    await t.expect(loginButton.visible).ok('El botón de login no es visible.');
    await t.click(loginButton);
    writeLog("Se hizo clic en el botón de login.");

    await t.wait(3000);
    await Login.enterCredentials(email, password);
    writeLog("Se escribieron las credenciales.");

    await t.wait(3000);
    await Login.submit();
    writeLog("Se hizo clic en el botón de enviar.");

    await t.wait(3000);
    await Login.verifyLogin();
    writeLog("Prueba completada exitosamente.");
});

test('Login con usuario válido en móvil', async t => {
    writeLog("Cargando la página...");
    await t.resizeWindow(375, 667);
    await t.wait(3000);

    await Login.acceptCookies();
    writeLog("Cookies aceptadas.");

    const { email, password } = loadUserCredentials().validUser;
    const isMobile = await t.eval(() => window.innerWidth < 768);
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    await t.expect(loginButton.visible).ok('El botón de login no es visible.');
    await t.click(loginButton);
    writeLog("Se hizo clic en el botón de login.");

    await t.wait(3000);
    await Login.enterCredentials(email, password);
    writeLog("Se escribieron las credenciales.");

    await t.wait(3000);
    await Login.submit();
    writeLog("Se hizo clic en el botón de enviar.");

    await t.wait(3000);
    await Login.verifyLogin();
    writeLog("Prueba completada exitosamente.");
});
