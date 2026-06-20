// Metro config para monorepo pnpm: hace que Metro observe la raíz del workspace
// y resuelva dependencias tanto desde apps/mobile/node_modules como desde la raíz.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Forzar UNA sola copia de react-native y react: siempre las de la raíz del
// monorepo. Si quedó un node_modules viejo en apps/mobile (residuo de una
// instalación anterior en Windows), Metro lo ignora para estos paquetes y no
// se mezclan versiones (causa del error "getDevServer is not a function").
const rootModules = path.join(workspaceRoot, "node_modules");
const forceSingle = ["react-native", "react", "@firebase/app", "@firebase/component", "firebase"];
const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const forced = forceSingle.find(
    (name) => moduleName === name || moduleName.startsWith(name + "/")
  );
  if (forced) {
    // Reanclar el origen a la raíz para que el walk-up encuentre la copia
    // correcta primero, incluyendo subpaths (react-native/Libraries/...).
    return context.resolveRequest(
      { ...context, originModulePath: path.join(rootModules, "index.js") },
      moduleName,
      platform
    );
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
