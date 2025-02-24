import { Selector } from 'testcafe';
import fs from 'fs';
import path from 'path';
import Login from '../../pages/AENA_Travel_login';

// Generar el nombre del archivo de log solo una vez
let logFilename = ''; 

// Función para escribir en el log
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

// Función para cargar las credenciales de usuario desde el archivo users.json
function loadUserCredentials() {
    const filePath = path.join(__dirname, '..', '..', '/data/users.json'); // Ruta del archivo users.json
    const data = fs.readFileSync(filePath, 'utf8');
    const parsedData = JSON.parse(data);

    return {
        validUser: parsedData.user1[0],  // Primer usuario válido
        invalidUsers: parsedData.user2  // Lista de usuarios inválidos
    };
}

// Selector para el mensaje de error de login (ajusta según lo que el sistema muestre cuando las credenciales son incorrectas)
const loginErrorMessage = Selector('#gigya-login-form > div.gigya-layout-row.with-divider > div.gigya-layout-cell.responsive.with-site-login > div.gigya-error-display.gigya-composite-control.gigya-composite-control-form-error.aena-submit-error-form-msg.gigya-error-code-403042.gigya-error-display-active > div');

// Configuración de la prueba
fixture `Login2 AENA Travel`
    .page `https://clubcliente.aena.es/AenaClub/es/sessionFinished`
    .beforeEach(async t => {
        // Cambiar el tamaño de la ventana a 1920x1080, modo escritorio
        await t.resizeWindow(1920, 1080);
        writeLog("===== Iniciando prueba =====");
    })
    .afterEach(async () => {
        writeLog("===== Test realizado =====\n");
    });

test('Login con usuario válido', async t => {
    writeLog("Cargando la página...");
    await t.wait(10000);

    // Detecta si está en modo móvil o escritorio
    const isMobile = await t.eval(() => window.innerWidth < 768);

    // Obtener las credenciales del usuario válido
    const { email, password } = loadUserCredentials().validUser;

    // Hacer clic en el botón de login correspondiente dependiendo de si es Mobile o Desktop
    await Login.login(isMobile);
    writeLog(isMobile ? "Se hizo clic en el botón de login para móvil" : "Se hizo clic en el botón de login para escritorio");

    // Espera antes de ingresar las credenciales
    await t.wait(10000);
    writeLog("Esperando 3 segundos antes de ingresar el usuario...");
    
    await Login.enterCredentials(email, password);
    writeLog("Se escribieron las credenciales.");

    await t.wait(10000);
    writeLog("Esperando 3 segundos antes de hacer clic en el botón de enviar...");
    
    await Login.submit();
    await t.wait(10000);
    writeLog("Se hizo clic en el botón de enviar.");

    await t.wait(10000);
    writeLog("Esperando 3 segundos para verificar el login...");
    
    await Login.verifyLogin();
    writeLog("El texto en el div contiene 'hola'.");

    writeLog("Prueba completada exitosamente.");
});

test('Login con usuarios inválidos', async t => {
    // Obtener los usuarios inválidos del archivo JSON
    const invalidUsers = loadUserCredentials().invalidUsers;

    // Iterar sobre los usuarios inválidos y ejecutar la prueba para cada uno
    for (let user of invalidUsers) {
        writeLog(`Cargando la página...`);
        await t.wait(10000);

        // Detecta si está en modo móvil o escritorio
        const isMobile = await t.eval(() => window.innerWidth < 768);

        // Hacer clic en el botón de login correspondiente dependiendo de si es Mobile o Desktop
        await Login.login(isMobile);
        writeLog(isMobile ? "Se hizo clic en el botón de login para móvil" : "Se hizo clic en el botón de login para escritorio");

        // Espera antes de ingresar las credenciales
        await t.wait(10000);
        writeLog("Esperando 3 segundos antes de ingresar el usuario...");

        await Login.enterCredentials(user.email, user.password);
        writeLog("Se escribieron las credenciales.");

        await t.wait(10000);
        writeLog("Esperando 3 segundos antes de hacer clic en el botón de enviar...");

        await Login.submit();
        await t.wait(10000);
        writeLog("Se hizo clic en el botón de enviar.");

        await t.wait(10000);
        writeLog("Esperando 3 segundos para verificar el login...");

        // Verificar si hay un error de login
        const errorMessageVisible = await loginErrorMessage.exists;

        if (errorMessageVisible) {
            writeLog(`Usuario o contraseña incorrectos: ${user.email}`);
        } else {
            writeLog("Login exitoso cuando no debería haberlo sido.");
        }

        writeLog(`Prueba de usuario inválido completada exitosamente.`);
    }
});
