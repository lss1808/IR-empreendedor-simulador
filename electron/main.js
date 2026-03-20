const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 600,
    minHeight: 500,
    title: 'IR Empreendedor & Notas Fiscais',
    icon: path.join(__dirname, '../icons/icon-512.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Permite localStorage funcionar normalmente
      partition: 'persist:irempreendedor'
    },
    backgroundColor: '#f7f6f2',
    show: false // evita flash branco
  });

  // Carrega o index.html local
  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // Mostra a janela só quando estiver pronta (sem flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Abre links externos no navegador do sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

// Menu da aplicação
function buildMenu() {
  const template = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => mainWindow && mainWindow.reload() },
        { type: 'separator' },
        { label: 'Sair', accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Alt+F4', click: () => app.quit() }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Recortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
        { label: 'Selecionar tudo', accelerator: 'CmdOrCtrl+A', role: 'selectAll' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        { label: 'Aumentar zoom', accelerator: 'CmdOrCtrl+=', click: () => mainWindow && mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() + 0.5) },
        { label: 'Diminuir zoom', accelerator: 'CmdOrCtrl+-', click: () => mainWindow && mainWindow.webContents.setZoomLevel(mainWindow.webContents.getZoomLevel() - 0.5) },
        { label: 'Zoom padrão', accelerator: 'CmdOrCtrl+0', click: () => mainWindow && mainWindow.webContents.setZoomLevel(0) },
        { type: 'separator' },
        { label: 'Tela cheia', accelerator: 'F11', click: () => mainWindow && mainWindow.setFullScreen(!mainWindow.isFullScreen()) }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        { label: 'Receita Federal', click: () => shell.openExternal('https://www.gov.br/receitafederal') },
        { label: 'Portal do Empreendedor', click: () => shell.openExternal('https://www.gov.br/empresas-e-negocios/pt-br/empreendedor') },
        { type: 'separator' },
        { label: 'Versão 1.0.0', enabled: false }
      ]
    }
  ];

  // No macOS, adiciona o menu padrão da Apple
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Sobre IR Empreendedor' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar' },
        { role: 'hideOthers', label: 'Ocultar outros' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' }
      ]
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  buildMenu();
  createWindow();

  // macOS: recria janela ao clicar no ícone do dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
