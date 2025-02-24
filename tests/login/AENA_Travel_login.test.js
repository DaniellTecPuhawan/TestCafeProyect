import { Selector, t } from 'testcafe'; 
import fs from 'fs';
import path from 'path';
import Login from '../../pages/AENA_Travel_Login';

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
    };
}

// Configuración de la prueba
fixture `Login AENA Travel`
    .page `https://clubcliente.aena.es/AenaClub/es/sessionFinished`
    .beforeEach(async () => {
        writeLog("===== Iniciando nueva ejecución de prueba =====");
    })
    .afterEach(async () => {
        writeLog("===== Prueba finalizada =====\n");
    });



// Primer test: Login con usuario válido en resolución 1920x1080 (pantalla completa)
test('Login con usuario válido en resolución completa', async t => {
    writeLog("Cargando la página...");
    await t.resizeWindow(1920, 1080);  // Redimensionar ventana a 1920x1080
    await t.wait(10000);

    // Cerrar el modal si aparece
    //await closeModal();

    // Obtener las credenciales del usuario válido
    const { email, password } = loadUserCredentials().validUser;

    // Detecta si está en modo móvil o escritorio
    const isMobile = await t.eval(() => window.innerWidth < 768);

    // Hacer clic en el botón de login correspondiente dependiendo de si es Mobile o Desktop
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    // Esperar a que el botón sea visible antes de hacer clic
    await t.expect(loginButton.visible).ok('El botón de login no es visible.')
    await t.click(loginButton);
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
    
    // Verificar el login en función de si es móvil o escritorio
    await Login.verifyLogin(isMobile);
    writeLog("El texto en el div contiene 'hola'.");

    writeLog("Prueba completada exitosamente.");
});

// Segundo test: Login con usuario válido en resolución de móvil
test('Login con usuario válido en móvil', async t => {
    writeLog("Cargando la página...");
    await t.resizeWindow(375, 667);  // Redimensionar ventana a resolución de móvil (Ej. 375x667)
    await t.wait(10000);

    // Cerrar el modal si aparece
    //await closeModal();

    // Obtener las credenciales del usuario válido
    const { email, password } = loadUserCredentials().validUser;

    // Detecta si está en modo móvil o escritorio
    const isMobile = await t.eval(() => window.innerWidth < 768);

    // Hacer clic en el botón de login correspondiente dependiendo de si es Mobile o Desktop
    const loginButton = isMobile ? Login.loginButtonMobile : Login.loginButtonDesktop;

    // Esperar a que el botón sea visible antes de hacer clic
    await t.expect(loginButton.visible).ok('El botón de login no es visible.')
    await t.click(loginButton);
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
    
    // Verificar el login en función de si es móvil o escritorio
    await Login.verifyLogin(isMobile);
    writeLog("El texto en el div contiene 'hola'.");

    writeLog("Prueba completada exitosamente.");
});
