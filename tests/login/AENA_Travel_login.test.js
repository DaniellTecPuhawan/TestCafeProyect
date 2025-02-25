import { Selector, t, ClientFunction } from 'testcafe';
import fs from 'fs';
import path from 'path';
import Login from '../../pages/AENA_Travel_Login';

let logFilename = '';
let browserConsoleMessages = [];

// Función para escribir logs
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

// ClientFunction para capturar todos los mensajes de la consola
const getBrowserConsoleMessages = ClientFunction(() => {
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

// Cargar las credenciales de usuario
function loadUserCredentials() {
    const filePath = path.join(__dirname, '..', '..', '/data/users.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(data);
    return { validUser: parsedData.user1[0], invalidUser: parsedData.user2[0] };
}

async function checkResponseStatus(url) {
    const response = await t.eval(() => {
        return fetch('https://clubcliente.aena.es/AenaClub/es/sessionFinished')
            .then(res => res.status);
    });

    await t.expect(response).eql(200, `ERROR: No se recibió un Response 200 de ${url}`);
    writeLog(`✔ La página ${url} respondió con 200.`);
}

fixture `Login AENA Travel`
    .page `https://clubcliente.aena.es/AenaClub/es/sessionFinished`
    .beforeEach(async () => {
        writeLog("===== Iniciando nueva ejecución de prueba =====");
        await checkResponseStatus('https://clubcliente.aena.es/AenaClub/es/sessionFinished'); // Verifica status 200
    })
    .afterEach(async () => {
        browserConsoleMessages = await getBrowserConsoleMessages();

        const errorMessages = browserConsoleMessages.filter(msg => msg.level === 'error');

        if (errorMessages.length > 0) {
            writeLog("=== Errores de la consola del navegador ===");
            errorMessages.forEach(msg => writeLog(msg.message));
        }

        writeLog("=== Todos los mensajes de la consola ===");
        browserConsoleMessages.forEach(msg => writeLog(`[${msg.level}] ${msg.message}`));

        writeLog("===== Prueba finalizada =====\n");
    });

// Test con usuario válido en resolución completa
test('Login con usuario válido en resolución completa', async t => {
    writeLog("Accediendo a AENA Travel");
    await t.resizeWindow(1280, 720);
    await t.wait(5000);

    await Login.acceptCookies();
    writeLog("Se aceptaron las cookies");

    const { email, password } = loadUserCredentials().validUser;
    const isMobile = await t.eval(() => window.innerWidth < 768);
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    await t.wait(10000);

    await t.expect(loginButton.visible).ok('El botón de login no es visible.');
    await t.click(loginButton);
    writeLog("Se hizo click en el botón de login.");

    await t.wait(20000);
    
    await Login.enterCredentials(email, password);
    writeLog("Se escribieron las credenciales.");

    await t.wait(5000);
    await Login.submit();
    writeLog("Se hizo clic en el botón de enviar.");

    await t.wait(5000);
    await Login.verifyLogin();
    writeLog("Prueba completada exitosamente.");
});

// Test con usuario incorrecto en resolución completa
test('Login con usuario incorrecto en resolución completa', async t => {
    writeLog("Cargando la página...");
    await t.resizeWindow(1280, 720);
    await t.wait(5000);

    await Login.acceptCookies();
    writeLog("Cookies aceptadas.");

    const { email, password } = loadUserCredentials().invalidUser;
    const isMobile = await t.eval(() => window.innerWidth < 768);
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    await t.expect(loginButton.visible).ok('El botón de login no es visible.');
    await t.click(loginButton);
    writeLog("Se hizo clic en el botón de login.");

    await t.wait(5000);
    await Login.enterCredentials(email, password);
    writeLog("Se escribieron las credenciales.");

    await t.wait(5000);
    await Login.submit();
    writeLog("Se hizo clic en el botón de enviar.");

    await t.wait(10000);
    const loginErrorExists = await Login.verifyLoginError();
    await t.expect(loginErrorExists).ok('ERROR: Usuario incorrecto en resolución completa.');
    writeLog("Prueba completada: Usuario incorrecto en resolución completa.");
});
