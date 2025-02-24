import { Selector } from 'testcafe';
import fs from 'fs';

// Función para escribir en el log
function writeLog(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync('test-log1.txt', logMessage);
}

// Configuración de la prueba
fixture `Prueba de TestCafe`
    .page `https://clubcliente.aena.es/AenaClub/es/sessionFinished`
    .beforeEach(async () => {
        writeLog("===== Iniciando nueva ejecución de prueba =====");
    })
    .afterEach(async () => {
        writeLog("===== Prueba finalizada =====\n");
    });

test('Hacer clic en el enlace de usuario dependiendo del modo (móvil o escritorio)', async t => {
    writeLog("Cargando la página...");

    // Detecta si está en modo móvil o escritorio
    const isMobile = await t.eval(() => window.innerWidth < 768);
    

    // Selectores de los botones de login
    const loginButtonMobile = Selector('a.header__bottom__item.adobe-analytic-event.div-gigya-login');
    const loginButtonDesktop = Selector('body > main > header > div > div > div.header__top__nav > div > div.header__top__nav__links__item.header__top__nav__links__item--user.header__top__nav__links__item--session > a');

    // Verificar si está en modo móvil o escritorio y hacer clic en el botón correspondiente
    if (isMobile) {
        // En el modo móvil, haz clic en el botón móvil
        await t.click(loginButtonMobile);
        writeLog("📱 Se hizo clic en el botón de login para móvil");
    } else {
        // En el modo escritorio, haz clic en el botón de escritorio
        await t.click(loginButtonDesktop);
        writeLog("💻 Se hizo clic en el botón de login para escritorio");
    }

    
    // Continuar con el proceso de login después de hacer clic
    const inputUser = Selector('#gigya-login-form input[type="text"]').with({ visibilityCheck: true });
    await t.wait(10000);
    writeLog("Esperando 3 segundos antes de ingresar el usuario...");
    await t.typeText(inputUser, 'daniell.tec@entelgy.com');
    writeLog("✔ Se escribió el usuario.");

    const inputPass = Selector('#gigya-login-form input[type="password"]').with({ visibilityCheck: true });
    await t.wait(10000);
    writeLog("Esperando 3 segundos antes de ingresar la contraseña...");

    const MAX_RETRIES = 3;
    for (let i = 0; i < MAX_RETRIES; i++) {
        if (i < 2) {
            try {
                await t.typeText(inputPass, 'Arbust0@EN@1', { replace: true });
                writeLog(`❌ Intento ${i + 1}: Error al escribir la contraseña (simulado).`);
            } catch (error) {
                writeLog(`⚠️ Intento ${i + 1}: Error al escribir la contraseña: ${error.name} - ${error.message}\n${error.stack}`);
            }
        } else {
            try {
                await t.typeText(inputPass, 'Arbust0@EN@1', { replace: true });
                writeLog("✔ Se escribió la contraseña correctamente.");
                break;
            } catch (error) {
                writeLog(`❌ Error al escribir la contraseña: ${error.name} - ${error.message}\n${error.stack}`);
            }
        }
    }

    const submitButton = Selector('#gigya-login-form input[type="submit"]').with({ visibilityCheck: true });
    await t.wait(10000);
    writeLog("Esperando 3 segundos antes de hacer clic en el botón de enviar...");
    await t.click(submitButton);
    await t.wait(10000);
    writeLog("✔ Se hizo clic en el botón de enviar.");

    await t.wait(10000);
    writeLog("Esperando 3 segundos para verificar el login...");

    const divElement = Selector('body > main > header > div > div > div.header__top__nav > div > div:nth-child(2) > a > div').with({ visibilityCheck: true });
    await t.wait(10000);
    writeLog("Esperando 3 segundos para verificar el mensaje en pantalla...");
    const divText = await divElement.innerText;
    await t.expect(divText.toLowerCase()).contains('hola', 'Ha habido un error en el Inicio de sesión');
    writeLog("✔ El texto en el div contiene 'hola'.");

    writeLog("Prueba completada exitosamente.");

    
});
