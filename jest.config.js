const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  testMatch: ["**/tests/**/*.test.ts"], // test dosyalarının yolu
  moduleFileExtensions: ["ts", "js", "json"], // hangi uzantıları tanısın
  clearMocks: true, // her testten sonra jest.mock() otomatik sıfırlansın
};