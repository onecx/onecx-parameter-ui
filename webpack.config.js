const { ModifyEntryPlugin } = require('@angular-architects/module-federation/src/utils/modify-entry-plugin')
const { share, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack')
const { ModifySourcePlugin, ReplaceOperation } = require('modify-source-webpack-plugin')
const { getOneCXSharedRecommendations } = require('@onecx/accelerator')
const { dependencies } = require('./package.json')

const sharedEntries = {}
for (const libName of Object.keys(dependencies)) {
  const result = getOneCXSharedRecommendations(libName, { requiredVersion: 'auto', includeSecondaries: true })
  if (result !== false) {
    sharedEntries[libName] = result
  }
}

const config = withModuleFederationPlugin({
  name: 'onecx-parameter-ui',
  filename: 'remoteEntry.js',
  exposes: {
    './OneCXParameterModule': 'src/main.ts'
  },
  shared: share(sharedEntries)
})
config.devServer = { allowedHosts: 'all' }

const plugins = config.plugins.filter((plugin) => !(plugin instanceof ModifyEntryPlugin))

const modifyPrimeNgPlugin = new ModifySourcePlugin({
  rules: [
    {
      test: (module) => {
        return module.resource && module.resource.includes('primeng')
      },
      operations: [
        new ReplaceOperation(
          'all',
          'document\\.createElement\\(([^)]+)\\)',
          'document.createElementFromPrimeNg({"this": this, "arguments": Array.from(arguments), element: $1})'
        ),
        new ReplaceOperation('all', 'Theme.setLoadedStyleName', '(function(_){})')
      ]
    }
  ]
})

const modifyMaterialPlugin = new ModifySourcePlugin({
  rules: [
    {
      test: (module) => {
        return (
          module.resource && (module.resource.includes('@angular/material') || module.resource.includes('@angular/cdk'))
        )
      },
      operations: [
        new ReplaceOperation(
          'all',
          'document\\.createElement\\(',
          'document.createElementFromMaterial({"this": this, "arguments": Array.from(arguments)},'
        )
      ]
    }
  ]
})

module.exports = {
  ...config,
  plugins: [...plugins, modifyPrimeNgPlugin, modifyMaterialPlugin],
  module: { parser: { javascript: { importMeta: false } } },
  output: { uniqueName: 'onecx-parameter-ui', publicPath: 'auto' },
  experiments: { ...config.experiments, topLevelAwait: true },
  optimization: { runtimeChunk: false, splitChunks: false }
}
